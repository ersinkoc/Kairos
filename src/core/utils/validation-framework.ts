/**
 * Advanced Validation Framework for Kairos
 * Provides comprehensive validation with schema definitions, context, and detailed error reporting
 */

import { ErrorFactory } from '../types/errors.js';
import type { DateComponents } from '../types/utilities.js';

// Validation context interface
export interface ValidationContext {
  operation: string;
  path?: string;
  strict?: boolean;
  sanitize?: boolean;
  transform?: boolean;
  stopOnFirstError?: boolean;
  locale?: string;
  timezone?: string;
  partial?: boolean;
}

// Validation rule interface
export interface ValidationRule<T = any> {
  name: string;
  required?: boolean;
  type: 'string' | 'number' | 'boolean' | 'date' | 'object' | 'array' | 'function';
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  enum?: T[];
  custom?: (value: any, context: ValidationContext) => boolean | string;
  message?: string;
  transform?: (value: any) => any;
  sanitize?: boolean;
}

// Validation result with enhanced details
export interface EnhancedValidationResult<T = any> {
  valid: boolean;
  data?: T;
  errors: ValidationErrorDetail[];
  warnings: ValidationWarning[];
  context: ValidationContext;
  sanitized: boolean;
  transformed: boolean;
  performance: {
    duration: number;
    rulesChecked: number;
    rulesSkipped: number;
  };
}

// Validation error detail
export interface ValidationErrorDetail {
  field: string;
  value: any;
  rule: string;
  message: string;
  code: string;
  severity: 'error' | 'warning' | 'info';
  path: string;
  context: ValidationContext;
}

// Validation warning
export interface ValidationWarning {
  field: string;
  value: any;
  message: string;
  code: string;
  suggestion?: string;
}

// Validation schema with enhanced features
export interface EnhancedValidationSchema<T = any> {
  name: string;
  description?: string;
  version: string;
  rules: Record<keyof T, ValidationRule>;
  strict?: boolean;
  sanitize?: boolean;
  transform?: boolean;
  stopOnFirstError?: boolean;
  customValidators?: Record<string, (value: any, context: ValidationContext) => boolean | string>;
}

// Date validation schema
export const DateValidationSchema: EnhancedValidationSchema<DateComponents> = {
  name: 'DateComponents',
  description: 'Validation schema for date components',
  version: '1.0.0',
  strict: false,
  sanitize: true,
  transform: true,
  stopOnFirstError: false,
  rules: {
    year: {
      name: 'year',
      required: true,
      type: 'number',
      min: 1000,
      max: 9999,
      message: 'Year must be between 1000 and 9999',
      custom: (value: number, context: ValidationContext) => {
        if (context.strict && value < 1900) {
          return 'Years before 1900 are not supported in strict mode';
        }
        return true;
      },
    },
    month: {
      name: 'month',
      required: true,
      type: 'number',
      min: 1,
      max: 12,
      message: 'Month must be between 1 and 12',
    },
    day: {
      name: 'day',
      required: true,
      type: 'number',
      min: 1,
      max: 31,
      message: 'Day must be between 1 and 31',
      custom: (value: number, context: ValidationContext) => {
        // Additional validation for days based on month and year
        if (context.partial) return true;

        const { year, month } = context as any;
        if (year && month) {
          const daysInMonth = new Date(year, month, 0).getDate();
          if (value > daysInMonth) {
            return `${month === 2 ? 'February' : `Month ${month}`} in ${year} has only ${daysInMonth} days`;
          }
        }
        return true;
      },
    },
    hour: {
      name: 'hour',
      required: false,
      type: 'number',
      min: 0,
      max: 23,
      message: 'Hour must be between 0 and 23',
      transform: (value: number) => Math.floor(value),
    },
    minute: {
      name: 'minute',
      required: false,
      type: 'number',
      min: 0,
      max: 59,
      message: 'Minute must be between 0 and 59',
      transform: (value: number) => Math.floor(value),
    },
    second: {
      name: 'second',
      required: false,
      type: 'number',
      min: 0,
      max: 59,
      message: 'Second must be between 0 and 59',
      transform: (value: number) => Math.floor(value),
    },
    millisecond: {
      name: 'millisecond',
      required: false,
      type: 'number',
      min: 0,
      max: 999,
      message: 'Millisecond must be between 0 and 999',
      transform: (value: number) => Math.floor(value),
    },
  },
};

// Holiday validation schema
export const HolidayValidationSchema: EnhancedValidationSchema = {
  name: 'HolidayRule',
  description: 'Validation schema for holiday rules',
  version: '1.0.0',
  strict: true,
  sanitize: false,
  transform: false,
  stopOnFirstError: false,
  rules: {
    name: {
      name: 'name',
      required: true,
      type: 'string',
      minLength: 1,
      maxLength: 100,
      pattern: /^[a-zA-Z0-9\s\-_]+$/,
      message:
        'Holiday name must be 1-100 characters and contain only letters, numbers, spaces, hyphens, and underscores',
      sanitize: true,
    },
    type: {
      name: 'type',
      required: true,
      type: 'string',
      enum: ['fixed', 'nth-weekday', 'relative', 'lunar', 'easter-based', 'custom'],
      message:
        'Holiday type must be one of: fixed, nth-weekday, relative, lunar, easter-based, custom',
    },
    active: {
      name: 'active',
      required: false,
      type: 'boolean',
      transform: (value: any) => Boolean(value),
    },
  },
  customValidators: {
    validateHolidayRule: (value: any) => {
      if (!value.rule || typeof value.rule !== 'object') {
        return 'Holiday rule must have a rule property';
      }

      switch (value.type) {
        case 'fixed':
          if (!value.rule.month || !value.rule.day) {
            return 'Fixed holiday must have month and day';
          }
          break;
        case 'nth-weekday':
          if (!value.rule.month || !value.rule.weekday || !value.rule.nth) {
            return 'Nth-weekday holiday must have month, weekday, and nth';
          }
          break;
        // Add other cases as needed
      }

      return true;
    },
  },
};

// Advanced validator class
export class AdvancedValidator {
  private schemas: Map<string, EnhancedValidationSchema> = new Map();
  private cache: Map<string, EnhancedValidationResult> = new Map();
  private performanceMetrics: {
    validations: number;
    totalDuration: number;
    cacheHits: number;
    cacheMisses: number;
  } = {
    validations: 0,
    totalDuration: 0,
    cacheHits: 0,
    cacheMisses: 0,
  };

  constructor() {
    // Register default schemas
    this.registerSchema(DateValidationSchema);
    this.registerSchema(HolidayValidationSchema);
  }

  // Register a validation schema
  registerSchema<T = any>(schema: EnhancedValidationSchema<T>): void {
    this.schemas.set(schema.name, schema);
    this.clearCache(); // Clear cache when schemas change
  }

  // Validate data against a schema
  validate<T = any>(
    schemaName: string,
    data: any,
    context: Partial<ValidationContext> = {}
  ): EnhancedValidationResult<T> {
    const startTime = performance.now();

    // Check cache first
    const cacheKey = this.generateCacheKey(schemaName, data, context);
    const cached = this.cache.get(cacheKey);
    if (cached) {
      this.performanceMetrics.cacheHits++;
      return cached as EnhancedValidationResult<T>;
    }
    this.performanceMetrics.cacheMisses++;

    const schema = this.schemas.get(schemaName);
    if (!schema) {
      throw ErrorFactory.createConfigurationError(
        schemaName,
        `Validation schema '${schemaName}' not found`
      );
    }

    const fullContext: ValidationContext = {
      operation: 'validate',
      strict: schema.strict || false,
      sanitize: schema.sanitize || false,
      transform: schema.transform || false,
      stopOnFirstError: schema.stopOnFirstError || false,
      ...context,
    };

    const result = this.performValidation<T>(schema, data, fullContext);

    // Update performance metrics
    const endTime = performance.now();
    result.performance.duration = endTime - startTime;
    this.performanceMetrics.validations++;
    this.performanceMetrics.totalDuration += result.performance.duration;

    // Cache result
    this.cache.set(cacheKey, result);

    return result;
  }

  // Perform the actual validation
  private performValidation<T = any>(
    schema: EnhancedValidationSchema,
    data: any,
    context: ValidationContext
  ): EnhancedValidationResult<T> {
    const errors: ValidationErrorDetail[] = [];
    const warnings: ValidationWarning[] = [];
    let sanitized = false;
    let transformed = false;
    let rulesChecked = 0;
    let rulesSkipped = 0;

    // Create a copy of data for transformation
    const result = { ...data };

    // Validate each field
    for (const [fieldName, rule] of Object.entries(schema.rules)) {
      rulesChecked++;
      const value = result[fieldName];
      const fieldPath = context.path ? `${context.path}.${fieldName}` : fieldName;

      try {
        // Check required fields
        if (rule.required && (value === undefined || value === null || value === '')) {
          errors.push({
            field: fieldName,
            value,
            rule: 'required',
            message: rule.message || `${fieldName} is required`,
            code: 'REQUIRED_FIELD',
            severity: 'error',
            path: fieldPath,
            context,
          });

          if (schema.stopOnFirstError) {
            break;
          }
          continue;
        }

        // Skip validation for optional fields that are empty
        if (!rule.required && (value === undefined || value === null || value === '')) {
          rulesSkipped++;
          continue;
        }

        // Type validation
        if (!this.validateType(value, rule.type)) {
          errors.push({
            field: fieldName,
            value,
            rule: 'type',
            message: `${fieldName} must be of type ${rule.type}`,
            code: 'INVALID_TYPE',
            severity: 'error',
            path: fieldPath,
            context,
          });

          if (schema.stopOnFirstError) {
            break;
          }
          continue;
        }

        // Range validation for numbers
        if (rule.type === 'number') {
          if (rule.min !== undefined && value < rule.min) {
            errors.push({
              field: fieldName,
              value,
              rule: 'min',
              message: rule.message || `${fieldName} must be at least ${rule.min}`,
              code: 'MIN_VALUE',
              severity: 'error',
              path: fieldPath,
              context,
            });
          }

          if (rule.max !== undefined && value > rule.max) {
            errors.push({
              field: fieldName,
              value,
              rule: 'max',
              message: rule.message || `${fieldName} must be at most ${rule.max}`,
              code: 'MAX_VALUE',
              severity: 'error',
              path: fieldPath,
              context,
            });
          }
        }

        // Length validation for strings
        if (rule.type === 'string') {
          if (rule.minLength !== undefined && value.length < rule.minLength) {
            errors.push({
              field: fieldName,
              value,
              rule: 'minLength',
              message: rule.message || `${fieldName} must be at least ${rule.minLength} characters`,
              code: 'MIN_LENGTH',
              severity: 'error',
              path: fieldPath,
              context,
            });
          }

          if (rule.maxLength !== undefined && value.length > rule.maxLength) {
            errors.push({
              field: fieldName,
              value,
              rule: 'maxLength',
              message: rule.message || `${fieldName} must be at most ${rule.maxLength} characters`,
              code: 'MAX_LENGTH',
              severity: 'error',
              path: fieldPath,
              context,
            });
          }

          // Pattern validation
          if (rule.pattern && !rule.pattern.test(value)) {
            errors.push({
              field: fieldName,
              value,
              rule: 'pattern',
              message: rule.message || `${fieldName} format is invalid`,
              code: 'INVALID_PATTERN',
              severity: 'error',
              path: fieldPath,
              context,
            });
          }

          // Sanitization
          if (rule.sanitize) {
            result[fieldName] = this.sanitizeString(value);
            sanitized = true;
          }
        }

        // Enum validation
        if (rule.enum && !rule.enum.includes(value)) {
          errors.push({
            field: fieldName,
            value,
            rule: 'enum',
            message: rule.message || `${fieldName} must be one of: ${rule.enum.join(', ')}`,
            code: 'INVALID_ENUM',
            severity: 'error',
            path: fieldPath,
            context,
          });
        }

        // Custom validation
        if (rule.custom) {
          const customResult = rule.custom(value, { ...context, path: fieldPath });
          if (customResult !== true) {
            const message =
              typeof customResult === 'string'
                ? customResult
                : rule.message || `${fieldName} is invalid`;
            errors.push({
              field: fieldName,
              value,
              rule: 'custom',
              message,
              code: 'CUSTOM_VALIDATION',
              severity: 'error',
              path: fieldPath,
              context,
            });
          }
        }

        // Transformation
        if (rule.transform && value !== undefined) {
          result[fieldName] = rule.transform(value);
          transformed = true;
        }
      } catch (error) {
        errors.push({
          field: fieldName,
          value,
          rule: 'system',
          message: `Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`,
          code: 'SYSTEM_ERROR',
          severity: 'error',
          path: fieldPath,
          context,
        });
      }
    }

    // Run custom validators
    if (schema.customValidators) {
      for (const [validatorName, validator] of Object.entries(schema.customValidators)) {
        try {
          const customResult = validator(data, context);
          if (customResult !== true) {
            errors.push({
              field: 'root',
              value: data,
              rule: validatorName,
              message: typeof customResult === 'string' ? customResult : 'Custom validation failed',
              code: 'CUSTOM_VALIDATOR',
              severity: 'error',
              path: context.path || 'root',
              context,
            });
          }
        } catch (error) {
          errors.push({
            field: 'root',
            value: data,
            rule: validatorName,
            message: `Custom validator error: ${error instanceof Error ? error.message : 'Unknown error'}`,
            code: 'CUSTOM_VALIDATOR_ERROR',
            severity: 'error',
            path: context.path || 'root',
            context,
          });
        }
      }
    }

    const success = errors.length === 0;

    return {
      valid: success,
      data: success ? result : undefined,
      errors,
      warnings,
      context,
      sanitized,
      transformed,
      performance: {
        duration: 0, // Will be set by validate method
        rulesChecked,
        rulesSkipped,
      },
    };
  }

  // Type validation helper
  private validateType(value: any, expectedType: string): boolean {
    switch (expectedType) {
      case 'string':
        return typeof value === 'string';
      case 'number':
        return typeof value === 'number' && !isNaN(value) && isFinite(value);
      case 'boolean':
        return typeof value === 'boolean';
      case 'date':
        return value instanceof Date && !isNaN(value.getTime());
      case 'object':
        return typeof value === 'object' && value !== null && !Array.isArray(value);
      case 'array':
        return Array.isArray(value);
      case 'function':
        return typeof value === 'function';
      default:
        return true;
    }
  }

  // String sanitization helper
  // BUG FIX (BUG-004): Improved XSS sanitization with additional protection
  // NOTE: This library is designed for date/time parsing, not HTML content.
  // For comprehensive XSS protection, use a dedicated library like DOMPurify.
  // This method provides basic protection against common XSS vectors.
  private sanitizeString(value: string): string {
    return (
      value
        .trim()
        // Remove JavaScript event handlers (onclick, onerror, etc.)
        .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
        .replace(/on\w+\s*=\s*[^\s>]*/gi, '')
        // Remove JavaScript protocol
        .replace(/javascript:/gi, '')
        // Remove data URIs (can contain JavaScript)
        .replace(/data:text\/html[^,]*,/gi, '')
        // Remove script tags (with nested tag protection)
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        // Remove iframe, object, embed tags
        .replace(/<(iframe|object|embed|link|style)\b[^<]*(?:(?!<\/\1>)<[^<]*)*<\/\1>/gi, '')
        // Remove all remaining HTML tags
        .replace(/<[^>]*>/g, '')
        // Remove remaining angle brackets and backticks
        .replace(/[<>`]/g, '')
        // Remove null bytes
        .replace(/\0/g, '')
    );
  }

  // Generate cache key
  private generateCacheKey(
    schemaName: string,
    data: any,
    context: Partial<ValidationContext>
  ): string {
    const dataHash = JSON.stringify(data);
    const contextHash = JSON.stringify(context);
    return `${schemaName}:${dataHash}:${contextHash}`;
  }

  // Clear validation cache
  clearCache(): void {
    this.cache.clear();
  }

  // Get performance metrics
  getPerformanceMetrics() {
    return {
      ...this.performanceMetrics,
      averageDuration:
        this.performanceMetrics.validations > 0
          ? this.performanceMetrics.totalDuration / this.performanceMetrics.validations
          : 0,
      cacheHitRate:
        this.performanceMetrics.cacheHits + this.performanceMetrics.cacheMisses > 0
          ? this.performanceMetrics.cacheHits /
            (this.performanceMetrics.cacheHits + this.performanceMetrics.cacheMisses)
          : 0,
    };
  }

  // Reset performance metrics
  resetPerformanceMetrics(): void {
    this.performanceMetrics = {
      validations: 0,
      totalDuration: 0,
      cacheHits: 0,
      cacheMisses: 0,
    };
  }
}

// Global validator instance
export const globalValidator = new AdvancedValidator();

// Convenience functions
export function validateDateComponents(
  data: any,
  context?: Partial<ValidationContext>
): EnhancedValidationResult<DateComponents> {
  return globalValidator.validate('DateComponents', data, context);
}

export function validateHolidayRule(
  data: any,
  context?: Partial<ValidationContext>
): EnhancedValidationResult {
  return globalValidator.validate('HolidayRule', data, context);
}

export function createCustomValidator<T = any>(
  schema: EnhancedValidationSchema<T>
): (data: any, context?: Partial<ValidationContext>) => EnhancedValidationResult<T> {
  const validator = new AdvancedValidator();
  validator.registerSchema(schema);

  return (data: any, context?: Partial<ValidationContext>) => {
    return validator.validate(schema.name, data, context);
  };
}
