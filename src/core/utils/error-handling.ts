/**
 * Advanced Error Handling and Recovery System for Kairos
 * Provides comprehensive error handling, recovery strategies, and monitoring
 */

import { KairosBaseError } from '../types/errors.js';

// Error recovery strategy types
export type RecoveryStrategy =
  | 'ignore'
  | 'retry'
  | 'fallback'
  | 'sanitize'
  | 'transform'
  | 'delegate'
  | 'abort';

// Error severity levels
export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';

// Error context information
export interface ErrorContext {
  operation: string;
  component: string;
  input?: any;
  timestamp: Date;
  userId?: string;
  sessionId?: string;
  requestId?: string;
  metadata?: Record<string, any>;
}

// Error recovery result
export interface ErrorRecoveryResult {
  recovered: boolean;
  strategy: RecoveryStrategy;
  result?: any;
  error?: Error;
  attempts: number;
  duration: number;
  fallbackUsed?: boolean;
}

// Recovery strategy configuration
export interface RecoveryConfig {
  maxAttempts: number;
  baseDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
  jitter: boolean;
  retryableErrors: string[];
  fallbackValue?: any;
  fallbackFunction: (error: Error, context: ErrorContext) => any;
  sanitizeFunction?: (input: any) => any;
  transformFunction?: (input: any) => any;
  delegateFunction?: (error: Error, context: ErrorContext) => Promise<any>;
}

// Error monitoring and metrics
export interface ErrorMetrics {
  totalErrors: number;
  errorsByType: Record<string, number>;
  errorsByComponent: Record<string, number>;
  errorsBySeverity: Record<ErrorSeverity, number>;
  recoveryAttempts: number;
  successfulRecoveries: number;
  failedRecoveries: number;
  averageRecoveryTime: number;
  lastError: Date;
  criticalErrors: number;
}

// Advanced error handler class
export class AdvancedErrorHandler {
  private recoveryConfigs: Map<string, RecoveryConfig> = new Map();
  private errorMetrics: ErrorMetrics;
  private errorHistory: Array<{
    error: Error;
    context: ErrorContext;
    recovery?: ErrorRecoveryResult;
  }> = [];
  private maxHistorySize: number = 1000;
  private monitoringEnabled: boolean = true;

  constructor() {
    this.errorMetrics = this.initializeMetrics();
    this.setupDefaultRecoveryConfigs();
  }

  // Initialize error metrics
  private initializeMetrics(): ErrorMetrics {
    return {
      totalErrors: 0,
      errorsByType: {},
      errorsByComponent: {},
      errorsBySeverity: { low: 0, medium: 0, high: 0, critical: 0 },
      recoveryAttempts: 0,
      successfulRecoveries: 0,
      failedRecoveries: 0,
      averageRecoveryTime: 0,
      lastError: new Date(),
      criticalErrors: 0,
    };
  }

  // Setup default recovery configurations
  private setupDefaultRecoveryConfigs(): void {
    // Date parsing errors
    this.setRecoveryConfig('date_parsing', {
      maxAttempts: 3,
      baseDelay: 100,
      maxDelay: 1000,
      backoffMultiplier: 2,
      jitter: true,
      retryableErrors: ['PARSING_ERROR', 'INVALID_DATE'],
      fallbackValue: new Date(),
      fallbackFunction: () => new Date(),
    });

    // Validation errors
    this.setRecoveryConfig('validation', {
      maxAttempts: 1,
      baseDelay: 0,
      maxDelay: 0,
      backoffMultiplier: 1,
      jitter: false,
      retryableErrors: ['VALIDATION_ERROR'],
      fallbackFunction: () => null,
      sanitizeFunction: (input: any) => {
        // Basic sanitization
        if (typeof input === 'string') {
          return input.trim().replace(/[<>]/g, '');
        }
        return input;
      },
    });

    // Holiday calculation errors
    this.setRecoveryConfig('holiday_calculation', {
      maxAttempts: 2,
      baseDelay: 50,
      maxDelay: 500,
      backoffMultiplier: 1.5,
      jitter: true,
      retryableErrors: ['CALCULATION_ERROR', 'INVALID_HOLIDAY_RULE'],
      fallbackValue: null,
      fallbackFunction: () => null,
    });

    // Plugin errors
    this.setRecoveryConfig('plugin', {
      maxAttempts: 1,
      baseDelay: 0,
      maxDelay: 0,
      backoffMultiplier: 1,
      jitter: false,
      retryableErrors: [],
      fallbackValue: null,
      fallbackFunction: (error: Error, context: ErrorContext) => {
        console.warn(`Plugin error in ${context.component}: ${error.message}`);
        return null;
      },
    });

    // Critical system errors
    this.setRecoveryConfig('critical', {
      maxAttempts: 0,
      baseDelay: 0,
      maxDelay: 0,
      backoffMultiplier: 1,
      jitter: false,
      retryableErrors: [],
      fallbackValue: null,
      fallbackFunction: () => null,
    });
  }

  // Set recovery configuration for an error type
  setRecoveryConfig(errorType: string, config: RecoveryConfig): void {
    this.recoveryConfigs.set(errorType, config);
  }

  // Get recovery configuration for an error
  private getRecoveryConfig(error: Error): RecoveryConfig {
    // Determine error type
    let errorType = 'unknown';

    if (error instanceof KairosBaseError) {
      errorType = error.type.toLowerCase();
    } else if (error.name === 'TypeError') {
      errorType = 'type_error';
    } else if (error.name === 'RangeError') {
      errorType = 'range_error';
    } else if (error.name === 'ReferenceError') {
      errorType = 'reference_error';
    }

    return (
      this.recoveryConfigs.get(errorType) ||
      this.recoveryConfigs.get('unknown') || {
        maxAttempts: 0,
        baseDelay: 0,
        maxDelay: 0,
        backoffMultiplier: 1,
        jitter: false,
        retryableErrors: [],
        fallbackFunction: () => null,
        fallbackValue: null,
      }
    );
  }

  // Handle an error with recovery
  async handleError(
    error: Error,
    context: ErrorContext,
    originalFunction?: () => any
  ): Promise<ErrorRecoveryResult> {
    const startTime = performance.now();

    // Update metrics
    this.updateErrorMetrics(error, context);

    // Determine error severity
    const severity = this.determineErrorSeverity(error, context);

    // Log error
    this.logError(error, context, severity);

    // Get recovery configuration
    const config = this.getRecoveryConfig(error);

    // If no recovery attempts allowed, return immediately
    if (config.maxAttempts === 0) {
      return {
        recovered: false,
        strategy: 'abort',
        error,
        attempts: 0,
        duration: performance.now() - startTime,
      };
    }

    // Attempt recovery
    let lastError: Error = error;
    let strategy: RecoveryStrategy = 'retry';

    for (let attempt = 1; attempt <= config.maxAttempts; attempt++) {
      this.errorMetrics.recoveryAttempts++;

      try {
        // Calculate delay with exponential backoff
        const delay = this.calculateDelay(attempt, config);
        if (delay > 0) {
          await this.sleep(delay);
        }

        let result: any;

        // Try different recovery strategies
        if (
          config.retryableErrors.includes(error.name) ||
          config.retryableErrors.some((pattern) => error.message.includes(pattern))
        ) {
          // Retry strategy
          if (originalFunction) {
            result = await originalFunction();
            strategy = 'retry';
          }
        }

        if (result === undefined && config.sanitizeFunction && context.input !== undefined) {
          // Sanitize strategy - capture return value and update context
          const sanitizedInput = config.sanitizeFunction(context.input);
          context.input = sanitizedInput;
          if (originalFunction) {
            result = await originalFunction();
          }
          strategy = 'sanitize';
        }

        if (result === undefined && config.transformFunction && context.input !== undefined) {
          // Transform strategy - capture return value and update context
          const transformedInput = config.transformFunction(context.input);
          context.input = transformedInput;
          if (originalFunction) {
            result = await originalFunction();
          }
          strategy = 'transform';
        }

        if (result === undefined && config.fallbackFunction) {
          // Fallback strategy
          result = config.fallbackFunction(lastError, context);
          strategy = 'fallback';
        }

        if (result === undefined && config.fallbackValue !== undefined) {
          // Fallback value strategy
          result = config.fallbackValue;
          strategy = 'fallback';
        }

        if (result === undefined && config.delegateFunction) {
          // Delegate strategy
          result = await config.delegateFunction(lastError, context);
          strategy = 'delegate';
        }

        if (result !== undefined) {
          // Recovery successful
          this.errorMetrics.successfulRecoveries++;
          const duration = performance.now() - startTime;

          return {
            recovered: true,
            strategy,
            result,
            attempts: attempt,
            duration,
            fallbackUsed: strategy === 'fallback' || strategy === 'delegate',
          };
        }
      } catch (recoveryError) {
        lastError =
          recoveryError instanceof Error ? recoveryError : new Error(String(recoveryError));
      }
    }

    // All recovery attempts failed
    this.errorMetrics.failedRecoveries++;
    const duration = performance.now() - startTime;

    return {
      recovered: false,
      strategy: strategy || 'abort',
      error: lastError,
      attempts: config.maxAttempts,
      duration,
    };
  }

  // Calculate delay with exponential backoff and jitter
  private calculateDelay(attempt: number, config: RecoveryConfig): number {
    let delay = config.baseDelay * Math.pow(config.backoffMultiplier, attempt - 1);
    delay = Math.min(delay, config.maxDelay);

    if (config.jitter) {
      // Add random jitter (±25%)
      const jitterFactor = 0.75 + Math.random() * 0.5;
      delay = delay * jitterFactor;
    }

    return Math.floor(delay);
  }

  // Sleep helper
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // Determine error severity
  private determineErrorSeverity(error: Error, context: ErrorContext): ErrorSeverity {
    // Critical errors
    if (
      error.message.includes('out of memory') ||
      error.message.includes('stack overflow') ||
      (error.name === 'RangeError' && error.message.includes('Maximum call stack'))
    ) {
      return 'critical';
    }

    // High severity errors
    if (
      (error instanceof KairosBaseError && error.type === 'CONFIGURATION_ERROR') ||
      context.component === 'core' ||
      (error.name === 'TypeError' && error.message.includes('Cannot read property'))
    ) {
      return 'high';
    }

    // Medium severity errors
    if (
      error instanceof KairosBaseError &&
      ['PARSING_ERROR', 'VALIDATION_ERROR', 'PLUGIN_ERROR'].includes(error.type)
    ) {
      return 'medium';
    }

    // Low severity errors
    return 'low';
  }

  // Update error metrics
  private updateErrorMetrics(error: Error, context: ErrorContext): void {
    this.errorMetrics.totalErrors++;
    this.errorMetrics.lastError = new Date();

    // Update errors by type
    const errorType = error instanceof KairosBaseError ? error.type : error.name;
    this.errorMetrics.errorsByType[errorType] =
      (this.errorMetrics.errorsByType[errorType] || 0) + 1;

    // Update errors by component
    this.errorMetrics.errorsByComponent[context.component] =
      (this.errorMetrics.errorsByComponent[context.component] || 0) + 1;

    // Determine severity and update
    const severity = this.determineErrorSeverity(error, context);
    this.errorMetrics.errorsBySeverity[severity]++;

    if (severity === 'critical') {
      this.errorMetrics.criticalErrors++;
    }

    // Add to history
    this.addToHistory(error, context);
  }

  // Add error to history
  private addToHistory(error: Error, context: ErrorContext): void {
    this.errorHistory.push({
      error,
      context,
    });

    // Limit history size
    if (this.errorHistory.length > this.maxHistorySize) {
      this.errorHistory = this.errorHistory.slice(-this.maxHistorySize);
    }
  }

  // Log error
  private logError(error: Error, context: ErrorContext, severity: ErrorSeverity): void {
    if (!this.monitoringEnabled) return;

    const logLevel =
      severity === 'critical'
        ? 'error'
        : severity === 'high'
          ? 'warn'
          : severity === 'medium'
            ? 'info'
            : 'debug';

    const logMessage = `[${severity.toUpperCase()}] ${context.component}.${context.operation}: ${error.message}`;

    // eslint-disable-next-line no-console
    console[logLevel](logMessage, {
      error: error.name,
      type: (error as any).type,
      context: context.component,
      operation: context.operation,
      timestamp: context.timestamp.toISOString(),
      stack: error.stack,
    });
  }

  // Get error metrics
  getErrorMetrics(): ErrorMetrics {
    return { ...this.errorMetrics };
  }

  // Get error history
  getErrorHistory(limit?: number): Array<{
    error: Error;
    context: ErrorContext;
    recovery?: ErrorRecoveryResult;
  }> {
    if (limit) {
      return this.errorHistory.slice(-limit);
    }
    return [...this.errorHistory];
  }

  // Clear error history and metrics
  clearHistory(): void {
    this.errorHistory = [];
    this.errorMetrics = this.initializeMetrics();
  }

  // Enable/disable monitoring
  setMonitoringEnabled(enabled: boolean): void {
    this.monitoringEnabled = enabled;
  }

  // Set maximum history size
  setMaxHistorySize(size: number): void {
    this.maxHistorySize = size;
    if (this.errorHistory.length > size) {
      this.errorHistory = this.errorHistory.slice(-size);
    }
  }

  // Get error recovery suggestions
  getRecoverySuggestions(error: Error, context: ErrorContext): string[] {
    const suggestions: string[] = [];
    const config = this.getRecoveryConfig(error);

    if (error instanceof KairosBaseError) {
      switch (error.type) {
        case 'INVALID_DATE':
          suggestions.push('Check if the date format is correct');
          suggestions.push('Verify the date string is not empty');
          suggestions.push('Consider using a different date format');
          break;

        case 'PARSING_ERROR':
          suggestions.push('Verify the input format matches the expected pattern');
          suggestions.push('Check for special characters in the input');
          suggestions.push('Try a more lenient parsing approach');
          break;

        case 'VALIDATION_ERROR':
          suggestions.push('Review the validation rules');
          suggestions.push('Check if all required fields are provided');
          suggestions.push('Verify field values are within allowed ranges');
          break;

        case 'INVALID_TIMEZONE':
          suggestions.push('Verify the timezone identifier is valid');
          suggestions.push('Use standard IANA timezone names');
          break;

        case 'PLUGIN_ERROR':
          suggestions.push('Check if the plugin is properly loaded');
          suggestions.push('Verify plugin configuration');
          suggestions.push('Try reloading the plugin');
          break;
      }
    }

    // General suggestions based on context
    if (context.component === 'parser') {
      suggestions.push('Consider using a different parsing strategy');
      suggestions.push('Check if locale settings are correct');
    }

    if (context.component === 'validator') {
      suggestions.push('Review validation schema');
      suggestions.push('Consider enabling sanitization');
    }

    // Add recovery strategy suggestions
    if (config.maxAttempts > 0) {
      suggestions.push(`System will attempt up to ${config.maxAttempts} recovery attempts`);
    }

    if (config.fallbackFunction !== undefined || config.fallbackValue !== undefined) {
      suggestions.push('Fallback behavior is configured for this error type');
    }

    return suggestions;
  }
}

// Global error handler instance
export const globalErrorHandler = new AdvancedErrorHandler();

// Convenience function for handling errors
export async function handleError(
  error: Error,
  context: ErrorContext,
  originalFunction?: () => any
): Promise<ErrorRecoveryResult> {
  return globalErrorHandler.handleError(error, context, originalFunction);
}

// Error boundary class for React-like error handling
export class ErrorBoundary {
  private errorHandler: AdvancedErrorHandler;
  private fallbackComponent: ((error: Error, context: ErrorContext) => any) | undefined;

  constructor(config?: {
    errorHandler?: AdvancedErrorHandler;
    fallbackComponent?: (error: Error, context: ErrorContext) => any;
  }) {
    this.errorHandler = config?.errorHandler || globalErrorHandler;
    this.fallbackComponent = config?.fallbackComponent;
  }

  // Execute function with error handling
  async execute<T = any>(fn: () => T | Promise<T>, context: ErrorContext): Promise<T> {
    try {
      return await fn();
    } catch (error) {
      const kairosError = error instanceof Error ? error : new Error(String(error));

      const recoveryResult = await this.errorHandler.handleError(kairosError, context, fn);

      if (recoveryResult.recovered && recoveryResult.result !== undefined) {
        return recoveryResult.result;
      }

      if (this.fallbackComponent) {
        return this.fallbackComponent(kairosError, context);
      }

      throw kairosError;
    }
  }
}

// Error monitoring and alerting
export class ErrorMonitor {
  private errorHandler: AdvancedErrorHandler;
  private alertThresholds: {
    errorRate: number;
    criticalErrors: number;
    recoveryFailureRate: number;
  };
  private alertCallbacks: Array<(alert: ErrorAlert) => void> = [];

  constructor(config?: {
    errorHandler?: AdvancedErrorHandler;
    alertThresholds?: {
      errorRate?: number;
      criticalErrors?: number;
      recoveryFailureRate?: number;
    };
  }) {
    this.errorHandler = config?.errorHandler || globalErrorHandler;
    this.alertThresholds = {
      errorRate: config?.alertThresholds?.errorRate || 0.1, // 10% error rate
      criticalErrors: config?.alertThresholds?.criticalErrors || 5,
      recoveryFailureRate: config?.alertThresholds?.recoveryFailureRate || 0.5, // 50% failure rate
    };
  }

  // Check for alert conditions
  checkAlerts(): ErrorAlert[] {
    const metrics = this.errorHandler.getErrorMetrics();
    const alerts: ErrorAlert[] = [];

    // Check error rate
    const totalOperations = metrics.totalErrors + metrics.successfulRecoveries;
    if (totalOperations > 0) {
      const errorRate = metrics.totalErrors / totalOperations;
      if (errorRate > this.alertThresholds.errorRate) {
        alerts.push({
          type: 'error_rate',
          severity: 'high',
          message: `Error rate (${(errorRate * 100).toFixed(2)}%) exceeds threshold (${(this.alertThresholds.errorRate * 100).toFixed(2)}%)`,
          metrics,
          timestamp: new Date(),
        });
      }
    }

    // Check critical errors
    if (metrics.criticalErrors > this.alertThresholds.criticalErrors) {
      alerts.push({
        type: 'critical_errors',
        severity: 'critical',
        message: `Critical errors (${metrics.criticalErrors}) exceed threshold (${this.alertThresholds.criticalErrors})`,
        metrics,
        timestamp: new Date(),
      });
    }

    // Check recovery failure rate
    const totalRecoveries = metrics.successfulRecoveries + metrics.failedRecoveries;
    if (totalRecoveries > 0) {
      const failureRate = metrics.failedRecoveries / totalRecoveries;
      if (failureRate > this.alertThresholds.recoveryFailureRate) {
        alerts.push({
          type: 'recovery_failure',
          severity: 'medium',
          message: `Recovery failure rate (${(failureRate * 100).toFixed(2)}%) exceeds threshold (${(this.alertThresholds.recoveryFailureRate * 100).toFixed(2)}%)`,
          metrics,
          timestamp: new Date(),
        });
      }
    }

    // Trigger alert callbacks
    alerts.forEach((alert) => {
      this.alertCallbacks.forEach((callback) => {
        try {
          callback(alert);
        } catch (error) {
          console.error('Error in alert callback:', error);
        }
      });
    });

    return alerts;
  }

  // Add alert callback
  addAlertCallback(callback: (alert: ErrorAlert) => void): void {
    this.alertCallbacks.push(callback);
  }

  // Remove alert callback
  removeAlertCallback(callback: (alert: ErrorAlert) => void): void {
    const index = this.alertCallbacks.indexOf(callback);
    if (index > -1) {
      this.alertCallbacks.splice(index, 1);
    }
  }
}

// Error alert interface
export interface ErrorAlert {
  type: 'error_rate' | 'critical_errors' | 'recovery_failure';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  metrics: ErrorMetrics;
  timestamp: Date;
}

// Global error monitor
export const globalErrorMonitor = new ErrorMonitor();
