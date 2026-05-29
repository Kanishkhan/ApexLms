import { Assignment, IAssignment } from '../models/Assignment';
import { Submission, ISubmission } from '../models/Submission';
import { NotFoundError, BadRequestError } from '../utils/customErrors';

export class AssignmentService {
  async getAssignmentsByCourse(courseId: string): Promise<IAssignment[]> {
    return Assignment.find({ course: courseId }).populate('module', 'title');
  }

  async getAssignmentById(id: string): Promise<IAssignment> {
    const assignment = await Assignment.findById(id);
    if (!assignment) throw new NotFoundError('Assignment details not found');
    return assignment;
  }

  async createAssignment(assignmentData: Partial<IAssignment>): Promise<IAssignment> {
    const maxPoints = assignmentData.rubric?.reduce((acc, curr) => acc + curr.maxPoints, 0) || 0;
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
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) throw new NotFoundError('Assignment not found');

    // Check if deadline passed
    const status = new Date() > new Date(assignment.deadline) ? 'late' : 'submitted';

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
    return Submission.find({ student: studentId }).populate({
      path: 'assignment',
      select: 'title maxPoints course',
      populate: { path: 'course', select: 'title' },
    });
  }

  async getSubmissionsForInstructor(assignmentId: string): Promise<ISubmission[]> {
    return Submission.find({ assignment: assignmentId })
      .populate('student', 'name email avatarUrl')
      .sort({ submittedAt: -1 });
  }

  async gradeSubmission(
    submissionId: string,
    instructorId: string,
    gradeData: { comments: string; pointsAwarded: number[] }
  ): Promise<ISubmission> {
    const submission = await Submission.findById(submissionId).populate('assignment');
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

    return submission.save();
  }
}

export const assignmentService = new AssignmentService();
