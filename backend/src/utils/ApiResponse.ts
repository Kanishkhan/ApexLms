export class ApiResponse<T = any> {
  public readonly success: boolean;
  public readonly message: string;
  public readonly data: T;

  constructor(success: boolean, message: string, data: T) {
    this.success = success;
    this.message = message;
    this.data = data;
  }

  static success<T>(data: T, message = 'Success'): ApiResponse<T> {
    return new ApiResponse<T>(true, message, data);
  }

  static error(message = 'An error occurred', data: any = null): ApiResponse<any> {
    return new ApiResponse<any>(false, message, data);
  }
}
