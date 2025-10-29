/**
 * Centralized Error Management System for Kairos
 * Integrates validation, error handling, and recovery into a unified system
 */

import { KairosBaseError } from '../types/errors.js';
import type { ErrorContext, ErrorRecoveryResult, ErrorBoundary } from './error-handling.js';
import type { ValidationContext, EnhancedValidationResult } from './validation-framework.js';
import { AdvancedValidator, globalValidator } from './validation-framework.js';
import {
  AdvancedErrorHandler,
  globalErrorHandler,
  ErrorBoundary as ErrorHandlerBoundary,
} from './error-handling.js';
import { ErrorFactory } from '../types/errors.js';

// Error management configuration
export interface ErrorManagerConfig {
  validation: {
    strict: boolean;
    sanitize: boolean;
    transform: boolean;
    stopOnFirstError: boolean;
    cacheResults: boolean;
  };
  handling: {
    enableRecovery: boolean;
    maxRecoveryAttempts: number;
    enableMonitoring: boolean;
    enableAlerts: boolean;
  };
  reporting: {
    logLevel: 'none' | 'error' | 'warn' | 'info' | 'debug';
    includeStackTrace: boolean;
    includeContext: boolean;
    maxHistorySize: number;
  };
}

// Error management result
export interface ErrorManagerResult<T = any> {
  success: boolean;
  data?: T;
  error?: KairosBaseError;
  validation?: EnhancedValidationResult;
  recovery?: ErrorRecoveryResult;
  performance: {
    validationTime: number;
    handlingTime: number;
    totalTime: number;
  };
  context: {
    operation: string;
    component: string;
    steps: string[];
  };
}

// Operation configuration
export interface OperationConfig<TInput = any, TOutput = any> {
  name: string;
  component: string;
  input?: TInput;
  schema?: string;
  validation?: Partial<ValidationContext>;
  operation?: (input: TInput) => TOutput | Promise<TOutput>;
  fallback?: (error: KairosBaseError, input: TInput) => TOutput | Promise<TOutput>;
  timeout?: number;
  retries?: number;
  skipValidation?: boolean;
}

// Error manager class
export class ErrorManager {
  private validator: AdvancedValidator;
  private errorHandler: AdvancedErrorHandler;
  private config: ErrorManagerConfig;
  private boundaries: Map<string, ErrorBoundary> = new Map();

  constructor(config?: Partial<ErrorManagerConfig>) {
    this.validator = globalValidator;
    this.errorHandler = globalErrorHandler;
    this.config = this.mergeConfig(config);
    this.setupErrorHandling();
  }

  // Merge configuration with defaults
  private mergeConfig(config?: Partial<ErrorManagerConfig>): ErrorManagerConfig {
    return {
      validation: {
        strict: false,
        sanitize: true,
        transform: true,
        stopOnFirstError: false,
        cacheResults: true,
        ...config?.validation,
      },
      handling: {
        enableRecovery: true,
        maxRecoveryAttempts: 3,
        enableMonitoring: true,
        enableAlerts: true,
        ...config?.handling,
      },
      reporting: {
        logLevel: 'warn',
        includeStackTrace: true,
        includeContext: true,
        maxHistorySize: 1000,
        ...config?.reporting,
      },
    };
  }

  // Setup error handling configuration
  private setupErrorHandling(): void {
    // Configure error handler based on manager config
    this.errorHandler.setMonitoringEnabled(this.config.handling.enableMonitoring);
    this.errorHandler.setMaxHistorySize(this.config.reporting.maxHistorySize);
  }

  // Execute an operation with comprehensive error management
  async execute<TInput = any, TOutput = any>(
    operationConfig: OperationConfig<TInput, TOutput>
  ): Promise<ErrorManagerResult<TOutput>> {
    const startTime = performance.now();
    const context = {
      operation: operationConfig.name,
      component: operationConfig.component,
      steps: [] as string[],
    };

    const result: ErrorManagerResult<TOutput> = {
      success: false,
      performance: {
        validationTime: 0,
        handlingTime: 0,
        totalTime: 0,
      },
      context,
    };

    try {
      context.steps.push('started');

      // Step 1: Validation (if enabled)
      if (!operationConfig.skipValidation && operationConfig.schema) {
        const validationStart = performance.now();
        context.steps.push('validation');

        const validationContext: ValidationContext = {
          operation: operationConfig.name,
          path: operationConfig.component,
          strict: this.config.validation.strict,
          sanitize: this.config.validation.sanitize,
          transform: this.config.validation.transform,
          stopOnFirstError: this.config.validation.stopOnFirstError,
          ...operationConfig.validation,
        };

        result.validation = this.validator.validate(
          operationConfig.schema,
          operationConfig.input,
          validationContext
        );

        result.performance.validationTime = performance.now() - validationStart;

        if (!result.validation.valid) {
          const validationError = ErrorFactory.createValidationError(
            operationConfig.schema,
            operationConfig.input,
            result.validation.errors.map((e) => e.message).join(', ')
          );

          if (this.config.reporting.logLevel !== 'none') {
            this.logError(validationError, context, 'validation_failed');
          }

          result.error = validationError;
          result.performance.totalTime = performance.now() - startTime;
          return result;
        }

        // Use validated/transformed data
        operationConfig.input = result.validation.data;
      }

      // Step 2: Execute operation
      if (operationConfig.operation) {
        const operationStart = performance.now();
        context.steps.push('execution');

        // Create error boundary for this operation
        const boundary = this.getBoundary(operationConfig.component);

        // Execute with timeout if specified
        let operationPromise = boundary.execute(
          () => operationConfig.operation!(operationConfig.input!),
          this.createErrorContext(operationConfig)
        );

        if (operationConfig.timeout) {
          operationPromise = this.withTimeout(
            operationPromise,
            operationConfig.timeout,
            `Operation ${operationConfig.name} timed out`
          );
        }

        try {
          result.data = await operationPromise;
          context.steps.push('completed');
          result.success = true;
        } catch (error) {
          context.steps.push('failed');
          const kairosError = this.normalizeError(error);

          if (this.config.reporting.logLevel !== 'none') {
            this.logError(kairosError, context, 'operation_failed');
          }

          result.error = kairosError;

          // Step 3: Error recovery (if enabled)
          if (this.config.handling.enableRecovery) {
            context.steps.push('recovery');

            result.recovery = await this.errorHandler.handleError(
              kairosError,
              this.createErrorContext(operationConfig),
              () => operationConfig.operation!(operationConfig.input!)
            );

            if (result.recovery.recovered) {
              result.data = result.recovery.result;
              result.success = true;
              context.steps.push('recovered');
              this.logInfo(context, 'operation_recovered');
            } else if (operationConfig.fallback) {
              context.steps.push('fallback');
              try {
                result.data = await operationConfig.fallback(kairosError, operationConfig.input!);
                result.success = true;
                context.steps.push('fallback_succeeded');
                this.logInfo(context, 'fallback_succeeded');
              } catch (fallbackError) {
                result.error = this.normalizeError(fallbackError);
                context.steps.push('fallback_failed');
                this.logError(result.error, context, 'fallback_failed');
              }
            }
          }

          result.performance.handlingTime = performance.now() - operationStart;
        }
      }
    } catch (error) {
      context.steps.push('system_error');
      result.error = this.normalizeError(error);
      this.logError(result.error, context, 'system_error');
    }

    result.performance.totalTime = performance.now() - startTime;
    return result;
  }

  // Validate data with enhanced error management
  validate<T = any>(
    schemaName: string,
    data: any,
    context?: Partial<ValidationContext>
  ): ErrorManagerResult<T> {
    const startTime = performance.now();
    const operationContext = {
      operation: 'validate',
      component: 'validator',
      steps: [] as string[],
    };

    const result: ErrorManagerResult<T> = {
      success: false,
      performance: {
        validationTime: 0,
        handlingTime: 0,
        totalTime: 0,
      },
      context: operationContext,
    };

    try {
      operationContext.steps.push('validation_started');

      const validationContext: ValidationContext = {
        operation: 'validate',
        strict: this.config.validation.strict,
        sanitize: this.config.validation.sanitize,
        transform: this.config.validation.transform,
        stopOnFirstError: this.config.validation.stopOnFirstError,
        ...context,
      };

      result.validation = this.validator.validate(schemaName, data, validationContext);
      result.performance.validationTime = performance.now() - startTime;

      if (result.validation.valid) {
        result.success = true;
        result.data = result.validation.data as T;
        operationContext.steps.push('validation_succeeded');
      } else {
        result.error = ErrorFactory.createValidationError(
          schemaName,
          data,
          result.validation.errors.map((e) => e.message).join(', ')
        );
        operationContext.steps.push('validation_failed');
        this.logError(result.error, operationContext, 'validation_failed');
      }
    } catch (error) {
      result.error = this.normalizeError(error);
      operationContext.steps.push('validation_system_error');
      this.logError(result.error, operationContext, 'validation_system_error');
    }

    result.performance.totalTime = performance.now() - startTime;
    return result;
  }

  // Handle error with comprehensive recovery
  async handleError(
    error: Error,
    context: ErrorContext,
    originalFunction?: () => any
  ): Promise<ErrorManagerResult> {
    const startTime = performance.now();
    const operationContext = {
      operation: context.operation,
      component: context.component,
      steps: ['error_handling_started'] as string[],
    };

    const result: ErrorManagerResult = {
      success: false,
      performance: {
        validationTime: 0,
        handlingTime: 0,
        totalTime: 0,
      },
      context: operationContext,
    };

    try {
      const kairosError = this.normalizeError(error);
      result.error = kairosError;

      if (this.config.handling.enableRecovery) {
        operationContext.steps.push('recovery_attempted');
        result.recovery = await this.errorHandler.handleError(
          kairosError,
          context,
          originalFunction
        );

        result.performance.handlingTime = performance.now() - startTime;

        if (result.recovery.recovered) {
          result.success = true;
          result.data = result.recovery.result;
          operationContext.steps.push('recovery_succeeded');
          this.logInfo(operationContext, 'error_recovery_succeeded');
        } else {
          operationContext.steps.push('recovery_failed');
          this.logError(kairosError, operationContext, 'error_recovery_failed');
        }
      } else {
        operationContext.steps.push('recovery_disabled');
        this.logError(kairosError, operationContext, 'recovery_disabled');
      }
    } catch (handlingError) {
      result.error = this.normalizeError(handlingError);
      operationContext.steps.push('error_handling_failed');
      this.logError(result.error, operationContext, 'error_handling_failed');
    }

    result.performance.totalTime = performance.now() - startTime;
    return result;
  }

  // Get or create error boundary for a component
  private getBoundary(component: string): ErrorBoundary {
    if (!this.boundaries.has(component)) {
      this.boundaries.set(
        component,
        new ErrorHandlerBoundary({
          errorHandler: this.errorHandler,
        })
      );
    }
    return this.boundaries.get(component)!;
  }

  // Create error context from operation config
  private createErrorContext(operationConfig: OperationConfig): ErrorContext {
    return {
      operation: operationConfig.name,
      component: operationConfig.component,
      input: operationConfig.input,
      timestamp: new Date(),
      metadata: {
        schema: operationConfig.schema,
        timeout: operationConfig.timeout,
        retries: operationConfig.retries,
      },
    };
  }

  // Normalize error to KairosBaseError
  private normalizeError(error: any): KairosBaseError {
    if (error instanceof KairosBaseError) {
      return error;
    }

    if (error instanceof Error) {
      // Determine error type based on error properties
      if (error.name === 'TypeError') {
        return ErrorFactory.createValidationError('unknown', {}, error.message);
      }

      if (error.name === 'RangeError') {
        return ErrorFactory.createValidationError('range', {}, error.message);
      }

      return ErrorFactory.createParsingError(error.message, error);
    }

    return ErrorFactory.createParsingError(String(error), new Error(String(error)));
  }

  // Add timeout to promise
  private async withTimeout<T>(
    promise: Promise<T>,
    timeoutMs: number,
    timeoutMessage: string
  ): Promise<T> {
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => {
        reject(new Error(timeoutMessage));
      }, timeoutMs);
    });

    return Promise.race([promise, timeoutPromise]);
  }

  // Log error
  private logError(error: KairosBaseError, context: any, step: string): void {
    if (this.config.reporting.logLevel === 'none') return;

    const logData: any = {
      step,
      component: context.component,
      operation: context.operation,
      timestamp: new Date().toISOString(),
    };

    if (this.config.reporting.includeStackTrace) {
      logData.stack = error.stack;
    }

    if (this.config.reporting.includeContext) {
      logData.context = context;
    }

    console.error(`[ERROR] ${context.component}.${context.operation}: ${error.message}`, logData);
  }

  // Log info
  private logInfo(context: any, message: string): void {
    if (this.config.reporting.logLevel !== 'debug') return;

    // eslint-disable-next-line no-console
    console.info(`[INFO] ${context.component}.${context.operation}: ${message}`, {
      steps: context.steps,
      timestamp: new Date().toISOString(),
    });
  }

  // Get error statistics
  getErrorStatistics() {
    return {
      handler: this.errorHandler.getErrorMetrics(),
      validator: this.validator.getPerformanceMetrics(),
      boundaries: this.boundaries.size,
      config: this.config,
    };
  }

  // Update configuration
  updateConfig(config: Partial<ErrorManagerConfig>): void {
    this.config = this.mergeConfig({ ...this.config, ...config });
    this.setupErrorHandling();
  }

  // Clear all error history
  clearHistory(): void {
    this.errorHandler.clearHistory();
    this.validator.clearCache();
  }

  // Create a safe wrapper for any function
  createSafeWrapper<TInput extends any[], TOutput>(
    fn: (...args: TInput) => TOutput | Promise<TOutput>,
    operationConfig: Omit<OperationConfig, 'input' | 'operation'>
  ) {
    return async (...args: TInput): Promise<TOutput> => {
      const result = await this.execute({
        ...operationConfig,
        input: args,
        operation: () => fn(...args),
      });

      if (result.success && result.data !== undefined) {
        return result.data;
      }

      throw result.error || new Error('Operation failed');
    };
  }

  // Batch execute multiple operations
  async executeBatch<TInput = any, TOutput = any>(
    operations: Array<OperationConfig<TInput, TOutput>>,
    options: {
      parallel?: boolean;
      failFast?: boolean;
      continueOnError?: boolean;
    } = {}
  ): Promise<ErrorManagerResult<TOutput>[]> {
    const { parallel = false, failFast = true, continueOnError = false } = options;

    if (parallel) {
      const promises = operations.map((op) => this.execute(op));
      const results = await Promise.allSettled(promises);

      return results.map((result, index) => {
        if (result.status === 'fulfilled') {
          return result.value;
        } else {
          const errorResult: ErrorManagerResult<TOutput> = {
            success: false,
            error: this.normalizeError(result.reason),
            performance: { validationTime: 0, handlingTime: 0, totalTime: 0 },
            context: {
              operation: operations[index].name,
              component: operations[index].component,
              steps: ['batch_failed'],
            },
          };

          if (failFast) {
            throw errorResult.error;
          }

          return errorResult;
        }
      });
    } else {
      const results: ErrorManagerResult<TOutput>[] = [];

      for (const operation of operations) {
        const result = await this.execute(operation);
        results.push(result);

        if (!result.success && !continueOnError && failFast) {
          throw result.error;
        }
      }

      return results;
    }
  }
}

// Global error manager instance
export const globalErrorManager = new ErrorManager();

// Convenience functions
export async function executeWithErrorHandling<TInput = any, TOutput = any>(
  config: OperationConfig<TInput, TOutput>
): Promise<ErrorManagerResult<TOutput>> {
  return globalErrorManager.execute(config);
}

export function validateWithErrorHandling<T = any>(
  schema: string,
  data: any,
  context?: Partial<ValidationContext>
): ErrorManagerResult<T> {
  return globalErrorManager.validate(schema, data, context);
}

export async function handleWithErrorRecovery(
  error: Error,
  context: ErrorContext,
  originalFunction?: () => any
): Promise<ErrorManagerResult> {
  return globalErrorManager.handleError(error, context, originalFunction);
}
