export function isValidDate(date: any): date is Date {
  return date instanceof Date && !isNaN(date.getTime());
}

export function isValidNumber(value: any): value is number {
  return typeof value === 'number' && !isNaN(value) && isFinite(value);
}

export function isValidString(value: any): value is string {
  return typeof value === 'string' && value.length > 0;
}

export function isValidYear(year: any): year is number {
  return isValidNumber(year) && year >= 1 && year <= 9999;
}

export function isValidMonth(month: any): month is number {
  return isValidNumber(month) && month >= 1 && month <= 12;
}

export function isValidDay(day: any): day is number {
  return isValidNumber(day) && day >= 1 && day <= 31;
}

export function isValidWeekday(weekday: any): weekday is number {
  return isValidNumber(weekday) && weekday >= 0 && weekday <= 6;
}

export function isValidNth(nth: any): nth is number {
  return isValidNumber(nth) && ((nth >= 1 && nth <= 5) || nth === -1);
}

export function validateHolidayRule(rule: any): string[] {
  const errors: string[] = [];

  if (!rule || typeof rule !== 'object') {
    errors.push('Rule must be an object');
    return errors;
  }

  if (!isValidString(rule.name)) {
    errors.push('Rule name must be a non-empty string');
  }

  const validTypes = ['fixed', 'nth-weekday', 'relative', 'lunar', 'easter-based', 'custom'];
  if (!validTypes.includes(rule.type)) {
    errors.push(`Rule type must be one of: ${validTypes.join(', ')}`);
  }

  if (!rule.rule || typeof rule.rule !== 'object') {
    errors.push('Rule must have a rule property');
    return errors;
  }

  switch (rule.type) {
    case 'fixed':
      if (!isValidMonth(rule.rule.month)) {
        errors.push('Fixed rule month must be 1-12');
      }
      if (!isValidDay(rule.rule.day)) {
        errors.push('Fixed rule day must be 1-31');
      }
      break;

    case 'nth-weekday':
      if (!isValidMonth(rule.rule.month)) {
        errors.push('Nth-weekday rule month must be 1-12');
      }
      if (!isValidWeekday(rule.rule.weekday)) {
        errors.push('Nth-weekday rule weekday must be 0-6');
      }
      if (!isValidNth(rule.rule.nth)) {
        errors.push('Nth-weekday rule nth must be 1-5 or -1');
      }
      break;

    case 'relative':
      if (!isValidString(rule.rule.relativeTo)) {
        errors.push('Relative rule relativeTo must be a non-empty string');
      }
      if (!isValidNumber(rule.rule.offset)) {
        errors.push('Relative rule offset must be a number');
      }
      break;

    case 'lunar': {
      const validCalendars = ['islamic', 'chinese', 'hebrew', 'persian'];
      if (!validCalendars.includes(rule.rule.calendar)) {
        errors.push(`Lunar rule calendar must be one of: ${validCalendars.join(', ')}`);
      }
      if (!isValidMonth(rule.rule.month)) {
        errors.push('Lunar rule month must be 1-12');
      }
      if (!isValidDay(rule.rule.day)) {
        errors.push('Lunar rule day must be 1-31');
      }
      break;
    }

    case 'easter-based':
      if (!isValidNumber(rule.rule.offset)) {
        errors.push('Easter-based rule offset must be a number');
      }
      break;

    case 'custom':
      if (typeof rule.rule.calculate !== 'function') {
        errors.push('Custom rule must have a calculate function');
      }
      break;
  }

  return errors;
}

export function throwError(message: string, code?: string): never {
  const error = new Error(message);
  if (code) {
    (error as any).code = code;
  }
  throw error;
}

// BUG FIX (BUG-006): Safe parseInt that validates the result
export function safeParseInt(value: string, radix: number = 10): number | null {
  const parsed = parseInt(value, radix);
  return isNaN(parsed) ? null : parsed;
}

// BUG FIX (BUG-006): Safe parseFloat that validates the result
export function safeParseFloat(value: string): number | null {
  const parsed = parseFloat(value);
  return isNaN(parsed) ? null : parsed;
}
