import { judge0CompilerService } from './judge0CompilerService';
import { CodeSubmission } from '../models/CodeSubmission';
import { CodingProblem } from '../models/CodingProblem';
import { mockCodeSubmissions, mockCodingProblems } from '../repositories/mockMemoryDb';
import { gamificationService } from './gamificationService';

interface Job {
  id: string;
  studentId: string;
  problemId: string;
  code: string;
  language: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  result?: any;
}

export class SubmissionQueue {
  private queue: Job[] = [];
  private processingLimit = 5; // Process up to 5 compile executions concurrently
  private activeCount = 0;

  addJob(studentId: string, problemId: string, code: string, language: string): string {
    const jobId = `job-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newJob: Job = {
      id: jobId,
      studentId,
      problemId,
      code,
      language,
      status: 'queued'
    };
    this.queue.push(newJob);

    // Persist a pending submission in the database first
    this.createPendingSubmission(jobId, studentId, problemId, code, language);

    // Process next job asynchronously
    process.nextTick(() => this.processNext());

    return jobId;
  }

  getJobStatus(jobId: string): Job | undefined {
    return this.queue.find(j => j.id === jobId);
  }

  private async createPendingSubmission(
    jobId: string,
    studentId: string,
    problemId: string,
    code: string,
    language: string
  ) {
    if (global.isMockDb) {
      mockCodeSubmissions.push({
        _id: jobId,
        student: studentId,
        problem: problemId,
        code,
        language,
        status: 'queued',
        passedCount: 0,
        totalCount: 0,
        runtimeMs: 0,
        memoryKb: 0
      });
    } else {
      await CodeSubmission.create({
        _id: jobId as any,
        student: studentId as any,
        problem: problemId as any,
        code,
        language,
        status: 'queued',
        passedCount: 0,
        totalCount: 0,
        runtimeMs: 0,
        memoryKb: 0
      });
    }
  }

  private async processNext() {
    if (this.activeCount >= this.processingLimit) return;
    
    const job = this.queue.find(j => j.status === 'queued');
    if (!job) return;

    job.status = 'processing';
    this.activeCount++;

    // Async compile call
    this.executeJob(job)
      .catch(err => {
        console.error(`Error processing execution job ${job.id}:`, err);
        job.status = 'failed';
      })
      .finally(() => {
        this.activeCount--;
        // Recurse to run remaining queued items
        this.processNext();
      });
  }

  private async executeJob(job: Job): Promise<void> {
    let problem: any;
    if (global.isMockDb) {
      problem = mockCodingProblems.find(p => p._id === job.problemId);
    } else {
      problem = await CodingProblem.findById(job.problemId);
    }

    if (!problem) {
      job.status = 'failed';
      return;
    }

    const testCases = problem.testCases || [];
    let passedCount = 0;
    let totalTime = 0;
    let totalMemory = 0;
    let finalStatus: 'accepted' | 'wrong_answer' | 'compilation_error' | 'runtime_error' | 'time_limit_exceeded' | 'memory_limit_exceeded' = 'accepted';
    let errorMessage: string | undefined;

    // Execute code sequentially against all test cases
    for (const test of testCases) {
      const result = await judge0CompilerService.executeCode(
        job.code,
        job.language,
        test.input,
        test.expectedOutput,
        1500, // 1.5s limit
        256000 // 256MB limit
      );

      totalTime += result.timeMs;
      totalMemory = Math.max(totalMemory, result.memoryKb);

      if (result.status === 'accepted') {
        passedCount++;
      } else {
        finalStatus = result.status as any;
        errorMessage = result.stderr || result.compileOutput || 'Wrong Answer';
        // Halt evaluations on first test failure to speed up response cycles
        break;
      }
    }

    // Determine final status
    const status = passedCount === testCases.length ? 'accepted' : finalStatus;

    // Update database submission record
    if (global.isMockDb) {
      const dbSub = mockCodeSubmissions.find(s => s._id === job.id);
      if (dbSub) {
        dbSub.status = status;
        dbSub.passedCount = passedCount;
        dbSub.totalCount = testCases.length;
        dbSub.runtimeMs = totalTime;
        dbSub.memoryKb = totalMemory;
        dbSub.errorMessage = errorMessage;
      }
    } else {
      await CodeSubmission.findByIdAndUpdate(job.id, {
        status,
        passedCount,
        totalCount: testCases.length,
        runtimeMs: totalTime,
        memoryKb: totalMemory,
        errorMessage
      });
    }

    // Award XP to student if accepted
    if (status === 'accepted') {
      try {
        await gamificationService.addXp(job.studentId, problem.points || 100, 'Solved Coding Problem');
      } catch (err) {
        console.error('Error awarding XP to student:', err);
      }
    }

    job.status = 'completed';
    job.result = {
      status,
      passedCount,
      totalCount: testCases.length,
      runtimeMs: totalTime,
      memoryKb: totalMemory,
      errorMessage
    };
  }
}

export const submissionQueue = new SubmissionQueue();
