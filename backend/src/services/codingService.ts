import { CodingProblem, ICodingProblem } from '../models/CodingProblem';
import { CodeSubmission } from '../models/CodeSubmission';
import { NotFoundError } from '../utils/customErrors';
import { mockCodingProblems, mockCodeSubmissions } from '../repositories/mockMemoryDb';
import { judge0CompilerService } from './judge0CompilerService';
import { submissionQueue } from './submissionQueue';

export class CodingService {
  async getProblems(): Promise<ICodingProblem[]> {
    if (global.isMockDb) {
      return mockCodingProblems as any[];
    }
    return CodingProblem.find({});
  }

  async getProblemById(id: string): Promise<ICodingProblem> {
    if (global.isMockDb) {
      const problem = mockCodingProblems.find((p) => p._id === id);
      if (!problem) throw new NotFoundError('Coding problem not found');
      return problem as any;
    }
    const problem = await CodingProblem.findById(id);
    if (!problem) throw new NotFoundError('Coding problem not found');
    return problem;
  }

  // Executing code using the secure sandbox environment (non-blocking, direct compilation run)
  async runCode(problemId: string, code: string, language: string, customInput?: string): Promise<any> {
    let problem: any;
    if (global.isMockDb) {
      problem = mockCodingProblems.find((p) => p._id === problemId);
    } else {
      problem = await CodingProblem.findById(problemId);
    }
    if (!problem) throw new NotFoundError('Coding problem not found');

    // Run against custom input if supplied, otherwise run against first public test case
    const input = customInput !== undefined ? customInput : (problem.testCases[0]?.input || '');
    const expected = problem.testCases[0]?.expectedOutput || '';

    const startTime = Date.now();
    const result = await judge0CompilerService.executeCode(code, language, input, expected);
    const runtimeMs = Date.now() - startTime;

    return {
      status: result.status,
      stdout: result.stdout,
      stderr: result.stderr,
      compileOutput: result.compileOutput,
      runtimeMs: result.timeMs || runtimeMs,
      memoryKb: result.memoryKb,
    };
  }

  // Submits the code asynchronously to the queue to prevent event loop blocks under high load (60-70 users)
  async submitCodeAsync(studentId: string, problemId: string, code: string, language: string): Promise<{ jobId: string }> {
    const jobId = submissionQueue.addJob(studentId, problemId, code, language);
    return { jobId };
  }

  // Get current status of an async submission job
  async getSubmissionStatus(jobId: string): Promise<any> {
    const job = submissionQueue.getJobStatus(jobId);
    if (!job) {
      // Check if it's already persisted in database
      let dbSub: any;
      if (global.isMockDb) {
        dbSub = mockCodeSubmissions.find(s => s._id === jobId);
      } else {
        dbSub = await CodeSubmission.findById(jobId);
      }

      if (dbSub) {
        return {
          id: jobId,
          status: 'completed',
          result: {
            status: dbSub.status,
            passedCount: dbSub.passedCount,
            totalCount: dbSub.totalCount,
            runtimeMs: dbSub.runtimeMs,
            memoryKb: dbSub.memoryKb,
            errorMessage: dbSub.errorMessage,
          }
        };
      }
      throw new NotFoundError('Submission job not found');
    }

    return {
      id: job.id,
      status: job.status,
      result: job.result,
    };
  }

  // Backwards compatibility for existing routers calling submitCode synchronously
  async submitCode(studentId: string, problemId: string, code: string, language: string): Promise<any> {
    const { jobId } = await this.submitCodeAsync(studentId, problemId, code, language);
    
    // Poll synchronously for backwards compatibility helper (max 5 seconds wait)
    let retries = 0;
    while (retries < 10) {
      await new Promise(resolve => setTimeout(resolve, 500));
      const status = await this.getSubmissionStatus(jobId);
      if (status.status === 'completed' || status.status === 'failed') {
        return {
          submission: {
            _id: jobId,
            status: status.result.status,
            passedCount: status.result.passedCount,
            totalCount: status.result.totalCount,
            runtimeMs: status.result.runtimeMs,
            memoryKb: status.result.memoryKb,
            errorMessage: status.result.errorMessage,
          },
          xpEarned: status.result.status === 'accepted' ? 100 : 0
        };
      }
      retries++;
    }

    return {
      submission: {
        _id: jobId,
        status: 'queued',
        passedCount: 0,
        totalCount: 0,
        runtimeMs: 0,
        memoryKb: 0
      },
      xpEarned: 0
    };
  }
}

export const codingService = new CodingService();
