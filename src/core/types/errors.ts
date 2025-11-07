/**
 * Advanced Error Type System for Kairos
 * Provides comprehensive error handling with type safety and internationalization
 */

import type { KairosErrorType } from './utilities.js';

// Base error class with type safety
export abstract class KairosBaseError extends Error {
  public readonly type: KairosErrorType;
  public readonly code: string;
  public readonly input?: any;
  public readonly timestamp: Date;
  public readonly context?: Record<string, any>;
  public readonly locale: string;

  constructor(
    type: KairosErrorType,
    message: string,
    code?: string,
    input?: any,
    context?: Record<string, any>,
    locale: string = 'en-US'
  ) {
    super(message);
    this.name = this.constructor.name;
    this.type = type;
    this.code = code || type;
    this.input = input;
    this.timestamp = new Date();
    if (context !== undefined) {
      this.context = context;
    }
    this.locale = locale;

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    // Type guard for V8-specific Error.captureStackTrace
    if (typeof (Error as any).captureStackTrace === 'function') {
      (Error as any).captureStackTrace(this, this.constructor);
    }
  }

  // Get localized error message
  getLocalizedMessage(locale?: string): string {
    const targetLocale = locale || this.locale;
    return this.translateMessage(targetLocale);
  }

  // Translate error message based on locale
  protected abstract translateMessage(locale: string): string;

  // Convert to JSON for logging/serialization
  toJSON() {
    return {
      name: this.name,
      type: this.type,
      code: this.code,
      message: this.message,
      localizedMessage: this.getLocalizedMessage(),
      input: this.input,
      context: this.context,
      timestamp: this.timestamp.toISOString(),
      locale: this.locale,
      stack: this.stack,
    };
  }

  // Check if error is of specific type
  isType<T extends KairosErrorType>(type: T): this is KairosBaseError & { type: T } {
    return this.type === type;
  }

  // Check if error has specific code
  hasCode(code: string): boolean {
    return this.code === code;
  }

  // Get user-friendly error description
  getDescription(): string {
    return `${this.code}: ${this.getLocalizedMessage()}`;
  }
}

// Invalid Date Error
export class InvalidDateError extends KairosBaseError {
  constructor(
    message: string,
    input?: any,
    context?: Record<string, any>,
    locale: string = 'en-US'
  ) {
    super('INVALID_DATE', message, 'INVALID_DATE', input, context, locale);
  }

  protected translateMessage(locale: string): string {
    const messages = {
      'en-US': 'Invalid date provided',
      'es-ES': 'Fecha inválida proporcionada',
      'fr-FR': 'Date invalide fournie',
      'de-DE': 'Ungültiges Datum angegeben',
      'it-IT': 'Data non valida fornita',
      'pt-BR': 'Data inválida fornecida',
      'ru-RU': 'Предоставлена недействительная дата',
      'zh-CN': '提供的日期无效',
      'ja-JP': '無効な日付が提供されました',
      'tr-TR': 'Geçersiz tarih sağlandı',
    };
    return messages[locale as keyof typeof messages] || messages['en-US'];
  }
}

// Invalid Format Error
export class InvalidFormatError extends KairosBaseError {
  constructor(
    message: string,
    input?: any,
    context?: Record<string, any>,
    locale: string = 'en-US'
  ) {
    super('INVALID_FORMAT', message, 'INVALID_FORMAT', input, context, locale);
  }

  protected translateMessage(locale: string): string {
    const messages = {
      'en-US': 'Invalid format string',
      'es-ES': 'Cadena de formato inválida',
      'fr-FR': 'Chaîne de format invalide',
      'de-DE': 'Ungültige Formatzeichenfolge',
      'it-IT': 'Stringa di formato non valida',
      'pt-BR': 'String de formato inválido',
      'ru-RU': 'Недопустимая строка формата',
      'zh-CN': '无效的格式字符串',
      'ja-JP': '無効なフォーマット文字列',
      'tr-TR': 'Geçersiz format dizesi',
    };
    return messages[locale as keyof typeof messages] || messages['en-US'];
  }
}

// Invalid Locale Error
export class InvalidLocaleError extends KairosBaseError {
  constructor(
    message: string,
    input?: any,
    context?: Record<string, any>,
    locale: string = 'en-US'
  ) {
    super('INVALID_LOCALE', message, 'INVALID_LOCALE', input, context, locale);
  }

  protected translateMessage(locale: string): string {
    const messages = {
      'en-US': 'Invalid locale specified',
      'es-ES': 'Configuración regional inválida especificada',
      'fr-FR': 'Locale invalide spécifiée',
      'de-DE': 'Ungültiges Gebietsschema angegeben',
      'it-IT': 'Locale non valido specificato',
      'pt-BR': 'Localidade inválida especificada',
      'ru-RU': 'Указан недопустимый язык',
      'zh-CN': '指定的区域设置无效',
      'ja-JP': '無効なロケールが指定されました',
      'tr-TR': 'Geçersiz yerel ayarı belirtildi',
    };
    return messages[locale as keyof typeof messages] || messages['en-US'];
  }
}

// Invalid Timezone Error
export class InvalidTimezoneError extends KairosBaseError {
  constructor(
    message: string,
    input?: any,
    context?: Record<string, any>,
    locale: string = 'en-US'
  ) {
    super('INVALID_TIMEZONE', message, 'INVALID_TIMEZONE', input, context, locale);
  }

  protected translateMessage(locale: string): string {
    const messages = {
      'en-US': 'Invalid timezone specified',
      'es-ES': 'Zona horaria inválida especificada',
      'fr-FR': 'Fuseau horaire invalide spécifié',
      'de-DE': 'Ungültige Zeitzone angegeben',
      'it-IT': 'Fuso orario non valido specificato',
      'pt-BR': 'Fuso horário inválido especificado',
      'ru-RU': 'Указан недопустимый часовой пояс',
      'zh-CN': '指定的时区无效',
      'ja-JP': '無効なタイムゾーンが指定されました',
      'tr-TR': 'Geçersiz saat dilimi belirtildi',
    };
    return messages[locale as keyof typeof messages] || messages['en-US'];
  }
}

// Parsing Error
export class ParsingError extends KairosBaseError {
  constructor(
    message: string,
    input?: any,
    context?: Record<string, any>,
    locale: string = 'en-US'
  ) {
    super('PARSING_ERROR', message, 'PARSING_ERROR', input, context, locale);
  }

  protected translateMessage(locale: string): string {
    const messages = {
      'en-US': 'Failed to parse date/time',
      'es-ES': 'Error al analizar fecha/hora',
      'fr-FR': "Échec de l'analyse de la date/heure",
      'de-DE': 'Fehler beim Parsen von Datum/Uhrzeit',
      'it-IT': "Errore nell'analisi di data/ora",
      'pt-BR': 'Falha ao analisar data/hora',
      'ru-RU': 'Ошибка анализа даты/времени',
      'zh-CN': '解析日期/时间失败',
      'ja-JP': '日付/時刻の解析に失敗しました',
      'tr-TR': 'Tarih/saat ayrıştırma başarısız',
    };
    return messages[locale as keyof typeof messages] || messages['en-US'];
  }
}

// Validation Error
export class ValidationError extends KairosBaseError {
  public readonly field: string;
  public readonly value: any;
  public readonly constraint: string;

  constructor(
    field: string,
    message: string,
    value: any,
    constraint: string,
    context?: Record<string, any>,
    locale: string = 'en-US'
  ) {
    super('VALIDATION_ERROR', message, 'VALIDATION_ERROR', value, context, locale);
    this.field = field;
    this.value = value;
    this.constraint = constraint;
  }

  protected translateMessage(locale: string): string {
    const messages = {
      'en-US': `Validation failed for field '${this.field}'`,
      'es-ES': `Validación fallida para el campo '${this.field}'`,
      'fr-FR': `Échec de la validation pour le champ '${this.field}'`,
      'de-DE': `Validierung fehlgeschlagen für Feld '${this.field}'`,
      'it-IT': `Validazione fallita per il campo '${this.field}'`,
      'pt-BR': `Validação falhou para o campo '${this.field}'`,
      'ru-RU': `Ошибка валидации для поля '${this.field}'`,
      'zh-CN': `字段'${this.field}'验证失败`,
      'ja-JP': `フィールド'${this.field}'の検証に失敗しました`,
      'tr-TR': `'${this.field}' alanı için doğrulama başarısız`,
    };
    return messages[locale as keyof typeof messages] || messages['en-US'];
  }

  toJSON() {
    return {
      ...super.toJSON(),
      field: this.field,
      value: this.value,
      constraint: this.constraint,
    };
  }
}

// Plugin Error
export class PluginError extends KairosBaseError {
  public readonly pluginName: string;
  public readonly pluginType: string;

  constructor(
    pluginName: string,
    pluginType: string,
    message: string,
    context?: Record<string, any>,
    locale: string = 'en-US'
  ) {
    super('PLUGIN_ERROR', message, 'PLUGIN_ERROR', pluginName, context, locale);
    this.pluginName = pluginName;
    this.pluginType = pluginType;
  }

  protected translateMessage(locale: string): string {
    const messages = {
      'en-US': `Plugin '${this.pluginName}' error`,
      'es-ES': `Error del plugin '${this.pluginName}'`,
      'fr-FR': `Erreur du plugin '${this.pluginName}'`,
      'de-DE': `Plugin '${this.pluginName}' Fehler`,
      'it-IT': `Errore del plugin '${this.pluginName}'`,
      'pt-BR': `Erro do plugin '${this.pluginName}'`,
      'ru-RU': `Ошибка плагина '${this.pluginName}'`,
      'zh-CN': `插件'${this.pluginName}'错误`,
      'ja-JP': `プラグイン'${this.pluginName}'エラー`,
      'tr-TR': `'${this.pluginName}' eklenti hatası`,
    };
    return messages[locale as keyof typeof messages] || messages['en-US'];
  }

  toJSON() {
    return {
      ...super.toJSON(),
      pluginName: this.pluginName,
      pluginType: this.pluginType,
    };
  }
}

// Configuration Error
export class ConfigurationError extends KairosBaseError {
  public readonly configKey: string;
  public readonly configValue: any;

  constructor(
    configKey: string,
    message: string,
    configValue?: any,
    context?: Record<string, any>,
    locale: string = 'en-US'
  ) {
    super('CONFIGURATION_ERROR', message, 'CONFIGURATION_ERROR', configKey, context, locale);
    this.configKey = configKey;
    this.configValue = configValue;
  }

  protected translateMessage(locale: string): string {
    const messages = {
      'en-US': `Configuration error for '${this.configKey}'`,
      'es-ES': `Error de configuración para '${this.configKey}'`,
      'fr-FR': `Erreur de configuration pour '${this.configKey}'`,
      'de-DE': `Konfigurationsfehler für '${this.configKey}'`,
      'it-IT': `Errore di configurazione per '${this.configKey}'`,
      'pt-BR': `Erro de configuração para '${this.configKey}'`,
      'ru-RU': `Ошибка конфигурации для '${this.configKey}'`,
      'zh-CN': `'${this.configKey}'配置错误`,
      'ja-JP': `'${this.configKey}'設定エラー`,
      'tr-TR': `'${this.configKey}' yapılandırma hatası`,
    };
    return messages[locale as keyof typeof messages] || messages['en-US'];
  }

  toJSON() {
    return {
      ...super.toJSON(),
      configKey: this.configKey,
      configValue: this.configValue,
    };
  }
}

// Error factory utilities
export class ErrorFactory {
  private static defaultLocale = 'en-US';

  static setDefaultLocale(locale: string): void {
    this.defaultLocale = locale;
  }

  static createInvalidDate(input?: any, context?: Record<string, any>): InvalidDateError {
    return new InvalidDateError('Invalid date provided', input, context, this.defaultLocale);
  }

  static createInvalidFormat(format: string, context?: Record<string, any>): InvalidFormatError {
    return new InvalidFormatError(
      `Invalid format string: ${format}`,
      format,
      context,
      this.defaultLocale
    );
  }

  static createInvalidLocale(locale: string, context?: Record<string, any>): InvalidLocaleError {
    return new InvalidLocaleError(`Invalid locale: ${locale}`, locale, context, this.defaultLocale);
  }

  static createInvalidTimezone(
    timezone: string,
    context?: Record<string, any>
  ): InvalidTimezoneError {
    return new InvalidTimezoneError(
      `Invalid timezone: ${timezone}`,
      timezone,
      context,
      this.defaultLocale
    );
  }

  static createParsingError(
    input: any,
    originalError?: Error,
    context?: Record<string, any>
  ): ParsingError {
    const message = originalError
      ? `Failed to parse: ${originalError.message}`
      : `Failed to parse input: ${JSON.stringify(input)}`;

    return new ParsingError(
      message,
      input,
      { ...context, originalError: originalError?.message },
      this.defaultLocale
    );
  }

  static createValidationError(
    field: string,
    value: any,
    constraint: string,
    context?: Record<string, any>
  ): ValidationError {
    return new ValidationError(
      field,
      `Validation failed: ${constraint}`,
      value,
      constraint,
      context,
      this.defaultLocale
    );
  }

  static createPluginError(
    pluginName: string,
    pluginType: string,
    error: Error | string,
    context?: Record<string, any>
  ): PluginError {
    const message = typeof error === 'string' ? error : error.message;
    return new PluginError(
      pluginName,
      pluginType,
      message,
      { ...context, originalError: typeof error === 'string' ? undefined : error.message },
      this.defaultLocale
    );
  }

  static createConfigurationError(
    configKey: string,
    message: string,
    configValue?: any,
    context?: Record<string, any>
  ): ConfigurationError {
    return new ConfigurationError(configKey, message, configValue, context, this.defaultLocale);
  }
}

// Error handling utilities
export class ErrorHandler {
  static isKairosError(error: unknown): error is KairosBaseError {
    return error instanceof KairosBaseError;
  }

  static wrapError(
    error: unknown,
    fallbackMessage: string = 'Unknown error occurred'
  ): KairosBaseError {
    if (error instanceof KairosBaseError) {
      return error;
    }

    if (error instanceof Error) {
      return new ParsingError(fallbackMessage, error.message, {
        originalError: error.message,
        stack: error.stack,
      });
    }

    return new ParsingError(fallbackMessage, error);
  }

  static getErrorDetails(error: unknown): {
    type: string;
    message: string;
    code: string;
    input?: any;
    context?: Record<string, any>;
    stack?: string;
  } {
    if (error instanceof KairosBaseError) {
      const result: {
        type: string;
        message: string;
        code: string;
        input?: any;
        context?: Record<string, any>;
        stack?: string;
      } = {
        type: error.type,
        message: error.getLocalizedMessage(),
        code: error.code,
      };

      if (error.input !== undefined) {
        result.input = error.input;
      }

      if (error.context !== undefined) {
        result.context = error.context;
      }

      if (error.stack !== undefined) {
        result.stack = error.stack;
      }

      return result;
    }

    if (error instanceof Error) {
      const result: {
        type: string;
        message: string;
        code: string;
        input?: any;
        context?: Record<string, any>;
        stack?: string;
      } = {
        type: 'GENERIC_ERROR',
        message: error.message,
        code: 'GENERIC',
      };

      if (error.stack !== undefined) {
        result.stack = error.stack;
      }

      return result;
    }

    return {
      type: 'UNKNOWN_ERROR',
      message: String(error),
      code: 'UNKNOWN',
      input: error,
    };
  }

  static formatErrorForUser(error: unknown, locale?: string): string {
    const details = this.getErrorDetails(error);
    const targetLocale = locale || 'en-US';

    if (error instanceof KairosBaseError) {
      return error.getLocalizedMessage(targetLocale);
    }

    return details.message;
  }

  static formatErrorForLogging(error: unknown): string {
    const details = this.getErrorDetails(error);
    return `[${details.type}] ${details.message} (${details.code})`;
  }
}

// Note: Classes and types are already exported individually throughout the file
// No duplicate export block needed to avoid conflicts
