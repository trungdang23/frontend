export type ApiSuccess<TData> = {
  success: true;
  data: TData;
};

export type ApiFailure = {
  success: false;
  error: {
    code: string;
    message: string;
    details?: string;
    path?: string;
    timestamp?: string;
  };
};

export type ApiResponse<TData> = ApiSuccess<TData> | ApiFailure;
