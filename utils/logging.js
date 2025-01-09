// logging.js

module.exports = {
    logInfo: (message) => {
      console.log(`INFO: ${message}`);
    },
    logError: (message, error) => {
      console.error(`ERROR: ${message}`, error);
    },
    logDebug: (message) => {
      console.debug(`DEBUG: ${message}`);
    },
  };
  