

module.exports = {
    handleValidationError: (errors) => {
      const errorMessages = errors.array().map((error) => error.msg);
      return {
        success: false,
        message: errorMessages.join(", "),
      };
    },
    handleServerError: (message, errorDetails = "") => {
      console.error(message, errorDetails);
      return {
        success: false,
        message: "An error occurred. Please try again later.",
        errorDetails,
      };
    },
    handleUnauthorizedError: (message = "Unauthorized access") => {
      return {
        success: false,
        message,
      };
    },
    handleNotFoundError: (message = "Resource not found") => {
      return {
        success: false,
        message,
      };
    },
  };
  