export class ValidationError extends Error {
  constructor(message, field) {
    super(message);
    this.field = field;
    this.name = "ValidationError";
  }
}

export class ProcessingError extends Error {
  constructor(message, originalText) {
    super(message);
    this.originalText = originalText;
    this.name = "ProcessingError";
  }
}

export class NetworkError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.name = "NetworkError";
  }
}

export class ConfigurationError extends Error {
  constructor(message, configKey) {
    super(message);
    this.configKey = configKey;
    this.name = "ConfigurationError";
  }
}

export function isValidationError(error) {
  return error instanceof ValidationError;
}

export function isProcessingError(error) {
  return error instanceof ProcessingError;
}

export function isNetworkError(error) {
  return error instanceof NetworkError;
}

export function isConfigurationError(error) {
  return error instanceof ConfigurationError;
}
