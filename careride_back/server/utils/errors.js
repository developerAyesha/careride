
class ExtendableError extends Error {
  constructor(message) {
    super(message);
    this.name = this.constructor.name;
    if (typeof Error.captureStackTrace === 'function') {
//      Error.captureStackTrace(this, this.constructor);
    } else {
//      this.stack = new Error(message).stack;
    }
  }
}

class CustomError extends ExtendableError {
  // eslint-disable-next-line
  errorMessage(status) {
    switch (status) {
      case 404:
        return 'Not Found';
      case 401:
        return 'Unauthorized';
      case 400:
        return 'Bad Request';
      case 403:
        return 'Forbidden';
      default:
        return 'Error';
    }
  }
  constructor(status, message) {
    super();
    this.name = this.errorMessage(status);
    this.status = status || 500;
    this.message = message || this.errorMessage(status);
  }
}

module.exports = {
  CustomError
};
