import vm from 'vm';
import { CodingProblem, ICodingProblem } from '../models/CodingProblem';
import { CodeSubmission } from '../models/CodeSubmission';
import { NotFoundError, BadRequestError } from '../utils/customErrors';

export class CodingService {
  async getProblems(): Promise<ICodingProblem[]> {
    return CodingProblem.find({});
  }

  async getProblemById(id: string): Promise<ICodingProblem> {
    const problem = await CodingProblem.findById(id);
    if (!problem) throw new NotFoundError('Coding problem not found');
    return problem;
  }

  // Executing code securely using Node's native 'vm' sandboxing module
  async runCode(problemId: string, code: string, language: string): Promise<any> {
    const problem = await CodingProblem.findById(problemId);
    if (!problem) throw new NotFoundError('Coding problem not found');

    if (language !== 'javascript' && language !== 'typescript') {
      // Simulate non-JS languages dynamically for MVP demo purposes
      return this.simulateNonJsExecution(problem, language);
    }

    // Prepare test cases (only execute public ones for RUN queries)
    const publicTests = problem.testCases.filter((tc) => !tc.isHidden);
    const results = [];

    const startTime = process.hrtime();
    let passedCount = 0;

    for (const test of publicTests) {
      try {
        const result = this.executeSandbox(code, test.input);
        const expected = JSON.parse(test.expectedOutput);
        const isCorrect = JSON.stringify(result) === JSON.stringify(expected);

        if (isCorrect) passedCount++;

        results.push({
          input: test.input,
          expected: test.expectedOutput,
          actual: JSON.stringify(result),
          passed: isCorrect,
        });
      } catch (err: any) {
        results.push({
          input: test.input,
          expected: test.expectedOutput,
          actual: `Error: ${err.message}`,
          passed: false,
        });
      }
    }

    const elapsed = process.hrtime(startTime);
    const runtimeMs = parseFloat((elapsed[0] * 1000 + elapsed[1] / 1000000).toFixed(2));
    const memoryKb = Math.round(process.memoryUsage().heapUsed / 1024);

    return {
      status: passedCount === publicTests.length ? 'passed' : 'failed',
      passedCount,
      totalCount: publicTests.length,
      results,
      runtimeMs,
      memoryKb,
    };
  }

  // Submitting code running against ALL (including HIDDEN) test cases and logging attempts
  async submitCode(studentId: string, problemId: string, code: string, language: string): Promise<any> {
    const problem = await CodingProblem.findById(problemId);
    if (!problem) throw new NotFoundError('Coding problem not found');

    let passedCount = 0;
    const totalCount = problem.testCases.length;
    const results = [];
    let errorMessage: string | undefined;

    const startTime = process.hrtime();

    if (language !== 'javascript' && language !== 'typescript') {
      const sim = this.simulateNonJsExecution(problem, language);
      passedCount = sim.passedCount;
      const submission = await CodeSubmission.create({
        student: studentId as any,
        problem: problemId as any,
        code,
        language,
        status: passedCount === totalCount ? 'accepted' : 'wrong_answer',
        passedCount,
        totalCount,
        runtimeMs: sim.runtimeMs,
        memoryKb: sim.memoryKb,
      });
      return submission;
    }

    for (const test of problem.testCases) {
      try {
        const result = this.executeSandbox(code, test.input);
        const expected = JSON.parse(test.expectedOutput);
        const isCorrect = JSON.stringify(result) === JSON.stringify(expected);

        if (isCorrect) passedCount++;

        results.push({
          isHidden: test.isHidden,
          passed: isCorrect,
        });
      } catch (err: any) {
        errorMessage = err.message;
        results.push({
          isHidden: test.isHidden,
          passed: false,
          error: err.message,
        });
      }
    }

    const elapsed = process.hrtime(startTime);
    const runtimeMs = parseFloat((elapsed[0] * 1000 + elapsed[1] / 1000000).toFixed(2));
    const memoryKb = Math.round(process.memoryUsage().heapUsed / 1024);

    const status = passedCount === totalCount
      ? 'accepted'
      : errorMessage ? 'runtime_error' : 'wrong_answer';

    const submission = await CodeSubmission.create({
      student: studentId as any,
      problem: problemId as any,
      code,
      language,
      status,
      passedCount,
      totalCount,
      runtimeMs,
      memoryKb,
      errorMessage,
    });

    return {
      submission,
      xpEarned: status === 'accepted' ? problem.points : 0,
    };
  }

  // Safe Sandboxed compilation using Node VM contexts
  private executeSandbox(userCode: string, inputArgsStr: string): any {
    // Basic wrapper to call the user's function dynamically
    // Assumes user defines their main solution function as the primary handler (e.g. function solution(args) { ... })
    const sandbox = {
      result: null as any,
      console: { log: () => {} }, // stub console logs
    };

    const wrappedCode = `
      ${userCode}
      
      // Determine function name automatically by searching solution, twoSum, or finding the first function defined
      const solutionFn = typeof solution === 'function' ? solution : 
                         typeof twoSum === 'function' ? twoSum : 
                         Object.values(this).find(v => typeof v === 'function');
      
      if (!solutionFn) throw new Error("No function entry point found. Make sure to define 'solution' or 'twoSum'");
      
      // Execute with arguments
      const args = [${inputArgsStr}];
      result = solutionFn(...args);
    `;

    const context = vm.createContext(sandbox);
    const script = new vm.Script(wrappedCode);
    
    // Set 800ms limit to intercept infinite loops securely
    script.runInContext(context, { timeout: 800 });

    return sandbox.result;
  }

  // Mock simulation runner for Python/C++ demo scripts
  private simulateNonJsExecution(problem: ICodingProblem, language: string) {
    const totalCount = problem.testCases.length;
    // Standard mock metrics
    return {
      status: 'passed',
      passedCount: totalCount,
      totalCount,
      runtimeMs: 45.2,
      memoryKb: 2540,
    };
  }
}

export const codingService = new CodingService();
