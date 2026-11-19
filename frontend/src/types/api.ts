export interface ApiErrorResponse {
  success: false;
  code: string;
  message: string;
}

export interface ApiSuccess<T> {
  success: true;
  data: T;
}
