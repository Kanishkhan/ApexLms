import { Server, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';
import { DailyQuiz } from '../models/DailyQuiz';
import { Assessment } from '../models/Assessment';

interface QuizSession {
  roomCode: string;
  quizId: string;
  hostSocketId: string;
  status: 'waiting' | 'active' | 'finished';
  currentQuestionIndex: number;
  participants: {
    userId: string;
    username: string;
    socketId: string;
    score: number;
  }[];
  answersReceived: {
    userId: string;
    answerValues: string[];
    timeTaken: number; // in seconds
    isCorrect: boolean;
  }[];
}

// Memory store for active classroom quiz rooms
const activeQuizSessions = new Map<string, QuizSession>();

export const initializeSocket = (httpServer: HttpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
      credentials: true,
    },
  });

  io.on('connection', (socket: Socket) => {
    console.log(`🔌 Socket connected: ${socket.id}`);

    // --- LIVE ASSESSMENT REGISTRATION & HEARTBEAT ---
    socket.on('join_assessment', async ({ assessmentId, userId }) => {
      socket.join(`assessment:${assessmentId}`);
      console.log(`👤 User ${userId} joined assessment: ${assessmentId}`);
    });

    socket.on('assessment_heartbeat', async ({ assessmentId, userId }) => {
      // Periodic heartbeat to track connection and update db status
      try {
        await Assessment.updateOne(
          { _id: assessmentId, 'submissions.user': userId },
          { $set: { 'submissions.$.heartbeat': new Date() } }
        );
        socket.to(`assessment:${assessmentId}`).emit('user_heartbeat_sync', { userId });
      } catch (err) {
        console.error('Heartbeat update error:', err);
      }
    });

    // --- KAHOOT-STYLE CLASSROOM QUIZZES ---
    // Host starts a live quiz session
    socket.on('host_create_room', async ({ quizId, userId }) => {
      const roomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      const dailyQuiz = await DailyQuiz.findById(quizId);
      if (!dailyQuiz) {
        socket.emit('error', { message: 'Quiz not found' });
        return;
      }

      const session: QuizSession = {
        roomCode,
        quizId,
        hostSocketId: socket.id,
        status: 'waiting',
        currentQuestionIndex: -1,
        participants: [],
        answersReceived: [],
      };

      activeQuizSessions.set(roomCode, session);
      socket.join(roomCode);
      socket.emit('room_created', { roomCode, session });
      console.log(`🏫 Live Room ${roomCode} created by Host: ${socket.id}`);
    });

    // Student joins classroom quiz room
    socket.on('student_join_room', ({ roomCode, userId, username }) => {
      const session = activeQuizSessions.get(roomCode);
      if (!session) {
        socket.emit('error', { message: 'Room not found or expired' });
        return;
      }

      // Add student
      const existsIndex = session.participants.findIndex(p => p.userId === userId);
      if (existsIndex > -1) {
        session.participants[existsIndex].socketId = socket.id;
      } else {
        session.participants.push({
          userId,
          username,
          socketId: socket.id,
          score: 0,
        });
      }

      socket.join(roomCode);
      // Notify host and room
      io.to(roomCode).emit('room_update', session);
      console.log(`🎒 Student ${username} (${userId}) joined Room ${roomCode}`);
    });

    // Host starts the quiz (moves to first question)
    socket.on('host_start_quiz', async ({ roomCode }) => {
      const session = activeQuizSessions.get(roomCode);
      if (!session || session.hostSocketId !== socket.id) return;

      session.status = 'active';
      session.currentQuestionIndex = 0;
      session.answersReceived = [];

      const dailyQuiz = await DailyQuiz.findById(session.quizId);
      if (!dailyQuiz || dailyQuiz.questions.length === 0) return;

      const question = dailyQuiz.questions[0];
      io.to(roomCode).emit('next_question', {
        questionIndex: 0,
        questionText: question.questionText,
        questionType: question.questionType,
        options: question.options,
        timeLimit: question.timeLimit || 30,
        matchPairs: question.matchPairs, // if match following
      });
      io.to(roomCode).emit('room_update', session);
    });

    // Student submits an answer
    socket.on('student_submit_answer', async ({ roomCode, userId, answerValues, timeTaken }) => {
      const session = activeQuizSessions.get(roomCode);
      if (!session || session.status !== 'active') return;

      const dailyQuiz = await DailyQuiz.findById(session.quizId);
      if (!dailyQuiz) return;

      const question = dailyQuiz.questions[session.currentQuestionIndex];
      let isCorrect = false;

      if (question.questionType === 'single-choice') {
        isCorrect = question.correctAnswers?.[0] === answerValues[0];
      } else if (question.questionType === 'multiple-choice') {
        const correct = question.correctAnswers || [];
        isCorrect = correct.length === answerValues.length && correct.every(v => answerValues.includes(v));
      } else if (question.questionType === 'fill-blank') {
        isCorrect = question.correctAnswers?.[0]?.trim().toLowerCase() === answerValues[0]?.trim().toLowerCase();
      } else if (question.questionType === 'match-following') {
        // Pairs matched: check if user matches match leftItem correctly to rightItem
        // Values expected: Array of "leftItem:rightItem"
        const correctPairs = question.matchPairs?.map(p => `${p.leftItem}:${p.rightItem}`) || [];
        isCorrect = correctPairs.length === answerValues.length && correctPairs.every(v => answerValues.includes(v));
      }

      // Points calculation: speed-based scoring for Kahoot style
      let pts = 0;
      if (isCorrect) {
        const limit = question.timeLimit || 30;
        const timeRatio = Math.max(0, Math.min(1, timeTaken / limit));
        pts = Math.round(question.points * (1 - timeRatio * 0.5)); // Up to 50% deduction for slow answers
      }

      // Record answer
      session.answersReceived.push({
        userId,
        answerValues,
        timeTaken,
        isCorrect,
      });

      // Update participant score
      const p = session.participants.find(part => part.userId === userId);
      if (p && isCorrect) {
        p.score += pts;
      }

      // Notify host of answers update (e.g. participant count answered)
      io.to(session.hostSocketId).emit('answers_status', {
        answersCount: session.answersReceived.length,
        totalParticipants: session.participants.length,
      });

      // If everyone answered, auto trigger leaderboard
      if (session.answersReceived.length >= session.participants.length) {
        io.to(session.hostSocketId).emit('all_answered');
      }
    });

    // Host shows question results/leaderboard
    socket.on('host_show_leaderboard', ({ roomCode }) => {
      const session = activeQuizSessions.get(roomCode);
      if (!session || session.hostSocketId !== socket.id) return;

      // Sort leaderboard
      const leaderboard = [...session.participants].sort((a, b) => b.score - a.score);
      io.to(roomCode).emit('leaderboard', {
        leaderboard,
        answersReceived: session.answersReceived,
      });
    });

    // Host moves to next question
    socket.on('host_next_question', async ({ roomCode }) => {
      const session = activeQuizSessions.get(roomCode);
      if (!session || session.hostSocketId !== socket.id) return;

      const dailyQuiz = await DailyQuiz.findById(session.quizId);
      if (!dailyQuiz) return;

      session.currentQuestionIndex += 1;
      session.answersReceived = [];

      if (session.currentQuestionIndex >= dailyQuiz.questions.length) {
        // End Quiz
        session.status = 'finished';
        const finalLeaderboard = [...session.participants].sort((a, b) => b.score - a.score);
        io.to(roomCode).emit('quiz_end', { leaderboard: finalLeaderboard });
        activeQuizSessions.delete(roomCode);
      } else {
        const question = dailyQuiz.questions[session.currentQuestionIndex];
        io.to(roomCode).emit('next_question', {
          questionIndex: session.currentQuestionIndex,
          questionText: question.questionText,
          questionType: question.questionType,
          options: question.options,
          timeLimit: question.timeLimit || 30,
          matchPairs: question.matchPairs,
        });
        io.to(roomCode).emit('room_update', session);
      }
    });

    // Handle user disconnect
    socket.on('disconnect', () => {
      console.log(`🔌 Socket disconnected: ${socket.id}`);
      // Find room where user or host disconnected
      for (const [roomCode, session] of activeQuizSessions.entries()) {
        if (session.hostSocketId === socket.id) {
          io.to(roomCode).emit('error', { message: 'Host disconnected' });
          activeQuizSessions.delete(roomCode);
          console.log(`🏫 Live Room ${roomCode} terminated because host left`);
        } else {
          const index = session.participants.findIndex(p => p.socketId === socket.id);
          if (index > -1) {
            const p = session.participants[index];
            session.participants.splice(index, 1);
            io.to(roomCode).emit('room_update', session);
            console.log(`🎒 Participant ${p.username} disconnected from room ${roomCode}`);
          }
        }
      }
    });
  });

  return io;
};
