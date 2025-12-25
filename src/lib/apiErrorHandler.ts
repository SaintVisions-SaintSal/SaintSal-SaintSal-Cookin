/**
 * Centralized API error handling utility
 * Provides consistent error handling across all API calls
 */

import { logger } from './logger';

export interface ApiError {
  message: string;
  status: number;
  code?: string;
  retryable: boolean;
}

export class ApiErrorHandler {
  /**
   * Handle fetch errors with retry logic and proper error formatting
   */
  static async handleResponse<T>(
    response: Response,
    context: string
  ): Promise<T> {
    if (!response.ok) {
      const error = await this.parseErrorResponse(response, context);
      throw error;
    }

    try {
      return await response.json();
    } catch (parseError) {
      logger.error('Failed to parse response JSON', parseError, { context });
      throw new Error(`Invalid response format from ${context}`);
    }
  }

  /**
   * Parse error response from API
   */
  private static async parseErrorResponse(
    response: Response,
    context: string
  ): Promise<ApiError> {
    let errorMessage = `Request failed: ${response.status} ${response.statusText}`;
    let errorCode: string | undefined;
    let retryable = false;

    try {
      const errorData = await response.json();
      errorMessage = errorData.error || errorData.message || errorMessage;
      errorCode = errorData.code;
    } catch {
      // If we can't parse JSON, use the status text
      logger.warn('Could not parse error response', { context, status: response.status });
    }

    // Determine if error is retryable
    retryable = [408, 429, 500, 502, 503, 504].includes(response.status);

    // Log error with context
    logger.error(`API Error in ${context}`, undefined, {
      status: response.status,
      message: errorMessage,
      code: errorCode,
      retryable,
    });

    return {
      message: this.getUserFriendlyMessage(response.status, errorMessage),
      status: response.status,
      code: errorCode,
      retryable,
    };
  }

  /**
   * Get user-friendly error messages
   */
  private static getUserFriendlyMessage(status: number, originalMessage: string): string {
    switch (status) {
      case 401:
        return 'Your session has expired. Please log in again.';
      case 403:
        return 'You don\'t have permission to perform this action.';
      case 404:
        return 'The requested resource was not found.';
      case 408:
        return 'Request timed out. Please try again.';
      case 429:
        return 'Too many requests. Please wait a moment and try again.';
      case 500:
        return 'Server error. Our team has been notified.';
      case 502:
      case 503:
      case 504:
        return 'Service temporarily unavailable. Please try again in a moment.';
      default:
        return originalMessage;
    }
  }

  /**
   * Retry a fetch request with exponential backoff
   */
  static async fetchWithRetry(
    url: string,
    options: RequestInit,
    maxRetries = 3,
    context = 'API call'
  ): Promise<Response> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const response = await fetch(url, options);

        // If successful or non-retryable error, return immediately
        if (response.ok || !this.isRetryableError(response.status)) {
          return response;
        }

        // If last attempt, throw error
        if (attempt === maxRetries) {
          throw await this.parseErrorResponse(response, context);
        }

        // Wait before retrying (exponential backoff)
        const delay = Math.min(1000 * Math.pow(2, attempt), 10000);
        logger.info(`Retrying ${context}`, { attempt: attempt + 1, delay });
        await new Promise(resolve => setTimeout(resolve, delay));

      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        // If last attempt, throw error
        if (attempt === maxRetries) {
          throw lastError;
        }

        // Wait before retrying
        const delay = Math.min(1000 * Math.pow(2, attempt), 10000);
        logger.info(`Retrying ${context} after error`, { attempt: attempt + 1, delay });
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw lastError || new Error(`Failed after ${maxRetries} retries`);
  }

  /**
   * Check if an HTTP status code is retryable
   */
  private static isRetryableError(status: number): boolean {
    return [408, 429, 500, 502, 503, 504].includes(status);
  }
}

