const API_ERROR_MESSAGES = {
  NOT_FOUND:
    "No account found. Please check for errors or register a new account.",
  WRONG_AUTH: "Incorrect phone number or password. Please try again.",
  WRONG_PASSWORD: "Current password is incorrect.",
  USER_BLOCKED: "Your account has been blocked. Please contact support.",
  USER_NOT_ACTIVATED: "Your account is not activated yet.",
  PROFILE_BLOCKED: "Your profile has been blocked. Please contact support.",
  TOKEN_EXPIRED: "Your session has expired. Please log in again.",
  TOKEN_IS_INVALID: "Your session is invalid. Please log in again.",
  WRONG_TOKEN: "This link has expired or is invalid. Please request a new one.",
  LOGIN_USED: "This phone number is already registered.",
  WRONG_CODE: "Invalid verification code. Please try again.",
  ACCESS_DENIED: "You don't have permission to perform this action.",
  NO_PERMISSION: "You don't have permission to perform this action.",
  ORDER_NOT_FOUND: "Order not found.",
  ORDER_NOT_PENDING: "This order can no longer be accepted.",
  LIMIT_REACHED: "You have reached the request limit. Please try again later.",
  PLATE_NUMBER_USED: "This license plate number is already in use.",
  NOT_ALLOWED: "This action is not available.",
};

function isErrorCode(value) {
  return typeof value === "string" && /^[A-Z][A-Z0-9_]+$/.test(value);
}

export function getApiErrorMessage(
  error,
  fallback = "Something went wrong. Please try again."
) {
  if (!error?.response) {
    return "Network error. Please check your connection and try again.";
  }

  const code = error.response.data?.error;
  const detail = error.response.data?.detail;

  if (code && API_ERROR_MESSAGES[code]) {
    return API_ERROR_MESSAGES[code];
  }

  if (detail && typeof detail === "string" && detail.length > 0) {
    return detail;
  }

  if (code && typeof code === "string" && !isErrorCode(code)) {
    return code;
  }

  return fallback;
}
