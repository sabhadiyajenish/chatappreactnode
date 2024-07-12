class ApiError extends Error {
  constructor(
    statusCode,
    message = "something is wrong",
    error = [],
    stack = ""
  ) {
    super(message, statusCode);
    this.message = message;
    (this.data = null), (this.sucess = false), (this.error = error);
    this.statusCode = statusCode;
    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export { ApiError };
