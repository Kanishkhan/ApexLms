export interface ExecutionResult {
  status: 'accepted' | 'wrong_answer' | 'compilation_error' | 'runtime_error' | 'time_limit_exceeded' | 'memory_limit_exceeded' | 'internal_error';
  stdout: string | null;
  stderr: string | null;
  compileOutput: string | null;
  timeMs: number;
  memoryKb: number;
}

export interface ICompilerService {
  executeCode(
    code: string,
    language: string,
    input: string,
    expectedOutput: string,
    timeLimitMs?: number,
    memoryLimitKb?: number
  ): Promise<ExecutionResult>;
}
