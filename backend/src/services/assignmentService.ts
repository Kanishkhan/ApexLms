import { Assignment, IAssignment } from '../models/Assignment';
import { Submission, ISubmission } from '../models/Submission';
import { NotFoundError, BadRequestError } from '../utils/customErrors';
import { mockAssignments, mockSubmissions } from '../repositories/mockMemoryDb';

export class AssignmentService {
  async getAssignmentsByCourse(courseId: string): Promise<IAssignment[]> {
    if (global.isMockDb) {
      return mockAssignments.filter((a) => a.course === courseId) as any[];
    }
    return Assignment.find({ course: courseId }).populate('module', 'title');
  }

  async getAssignmentById(id: string): Promise<IAssignment> {
    if (global.isMockDb) {
      const assignment = mockAssignments.find((a) => a._id === id);
      if (!assignment) throw new NotFoundError('Assignment details not found');
      return assignment as any;
    }
    const assignment = await Assignment.findById(id);
    if (!assignment) throw new NotFoundError('Assignment details not found');
    return assignment;
  }

  async createAssignment(assignmentData: Partial<IAssignment>): Promise<IAssignment> {
    const maxPoints = assignmentData.rubric?.reduce((acc, curr) => acc + curr.maxPoints, 0) || 0;
    if (global.isMockDb) {
      const assignment = {
        _id: `a-${Date.now()}`,
        ...assignmentData,
        maxPoints,
      };
      mockAssignments.push(assignment);
      return assignment as any;
    }
    return Assignment.create({
      ...assignmentData,
      maxPoints,
    });
  }

  async submitAssignment(
    studentId: string,
    assignmentId: string,
    submitData: { githubUrl?: string; fileUrl?: string; submissionText?: string }
  ): Promise<ISubmission> {
    let assignment: any;
    if (global.isMockDb) {
      assignment = mockAssignments.find((a) => a._id === assignmentId);
    } else {
      assignment = await Assignment.findById(assignmentId);
    }
    if (!assignment) throw new NotFoundError('Assignment not found');

    // Check if deadline passed
    const status = new Date() > new Date(assignment.deadline) ? 'late' : 'submitted';

    if (global.isMockDb) {
      const existing = mockSubmissions.find((s) => s.assignment._id === assignmentId && s.student === studentId);
      if (existing) {
        existing.githubUrl = submitData.githubUrl;
        existing.fileUrl = submitData.fileUrl;
        existing.submissionText = submitData.submissionText;
        existing.status = status;
        existing.submittedAt = new Date();
        return existing as any;
      }
      const newSub = {
        _id: `s-${Date.now()}`,
        assignment: {
          _id: assignment._id,
          title: assignment.title,
          maxPoints: assignment.maxPoints,
          course: { title: 'Mock Course' }
        },
        student: studentId,
        ...submitData,
        status,
        submittedAt: new Date()
      };
      mockSubmissions.push(newSub);
      return newSub as any;
    }

    // Upsert submission
    const existing = await Submission.findOne({ assignment: assignmentId, student: studentId });
    if (existing) {
      existing.githubUrl = submitData.githubUrl;
      existing.fileUrl = submitData.fileUrl;
      existing.submissionText = submitData.submissionText;
      existing.status = status;
      existing.submittedAt = new Date();
      return existing.save();
    }

    return Submission.create({
      assignment: assignmentId as any,
      student: studentId as any,
      ...submitData,
      status,
    });
  }

  async getStudentSubmissions(studentId: string): Promise<ISubmission[]> {
    if (global.isMockDb) {
      return mockSubmissions.filter((s) => s.student === studentId) as any[];
    }
    return Submission.find({ student: studentId }).populate({
      path: 'assignment',
      select: 'title maxPoints course',
      populate: { path: 'course', select: 'title' },
    });
  }

  async getSubmissionsForInstructor(assignmentId: string): Promise<ISubmission[]> {
    if (global.isMockDb) {
      return mockSubmissions.filter((s) => s.assignment._id === assignmentId) as any[];
    }
    return Submission.find({ assignment: assignmentId })
      .populate('student', 'name email avatarUrl')
      .sort({ submittedAt: -1 });
  }

  async gradeSubmission(
    submissionId: string,
    instructorId: string,
    gradeData: { comments: string; pointsAwarded: number[] }
  ): Promise<ISubmission> {
    let submission: any;
    if (global.isMockDb) {
      submission = mockSubmissions.find((s) => s._id === submissionId);
    } else {
      submission = await Submission.findById(submissionId).populate('assignment');
    }
    if (!submission) throw new NotFoundError('Submission record not found');

    const assignment = submission.assignment as any as IAssignment;
    if (gradeData.pointsAwarded.length !== assignment.rubric.length) {
      throw new BadRequestError('Graded scores must match the assignment rubric categories.');
    }

    // Validate values against maximum criteria points
    for (let i = 0; i < gradeData.pointsAwarded.length; i++) {
      if (gradeData.pointsAwarded[i] > assignment.rubric[i].maxPoints) {
        throw new BadRequestError(
          `Rubric Category "${assignment.rubric[i].criteria}" cannot exceed ${assignment.rubric[i].maxPoints} points.`
        );
      }
    }

    const pointsEarned = gradeData.pointsAwarded.reduce((acc, curr) => acc + curr, 0);

    submission.status = 'graded';
    submission.pointsEarned = pointsEarned;
    submission.feedback = {
      instructor: instructorId as any,
      comments: gradeData.comments,
      pointsAwarded: gradeData.pointsAwarded,
      gradedAt: new Date(),
    };

    if (global.isMockDb) {
      return submission as any;
    }
    return submission.save();
  }
}

export const assignmentService = new AssignmentService();
