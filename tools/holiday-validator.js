#!/usr/bin/env node

/**
 * Kairos Holiday Validator
 * Validates holiday definitions and calculations
 */

const fs = require('fs');
const path = require('path');

class HolidayValidator {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.validationRules = {
      fixed: this.validateFixedRule.bind(this),
      'nth-weekday': this.validateNthWeekdayRule.bind(this),
      relative: this.validateRelativeRule.bind(this),
      lunar: this.validateLunarRule.bind(this),
      'easter-based': this.validateEasterRule.bind(this),
      custom: this.validateCustomRule.bind(this)
    };
  }

  validateHolidayFile(filePath) {
    console.log(`🔍 Validating holiday file: ${filePath}`);
    
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const holidays = this.extractHolidays(content);
      
      if (!holidays || holidays.length === 0) {
        this.addError('No holidays found in file');
        return false;
      }
      
      let valid = true;
      
      holidays.forEach((holiday, index) => {
        const holidayValid = this.validateHoliday(holiday, index);
        if (!holidayValid) {
          valid = false;
        }
      });
      
      // Check for duplicate holidays
      this.checkDuplicates(holidays);
      
      // Check for missing common holidays
      this.checkMissingCommonHolidays(holidays, filePath);
      
      return valid;
      
    } catch (error) {
      this.addError(`Failed to read or parse file: ${error.message}`);
      return false;
    }
  }

  extractHolidays(content) {
    try {
      // Extract holidays array from TypeScript file
      const holidaysMatch = content.match(/export\s+const\s+holidays\s*:\s*HolidayRule\[\]\s*=\s*(\[[\s\S]*?\]);/);
      
      if (!holidaysMatch) {
        return [];
      }
      
      // Simple evaluation - in production, use proper AST parsing
      const holidaysString = holidaysMatch[1];
      
      // Replace TypeScript syntax with JavaScript
      const jsString = holidaysString
        .replace(/(\w+):/g, '"$1":')
        .replace(/'/g, '"')
        .replace(/as\s+const/g, '');
      
      return JSON.parse(jsString);
      
    } catch (error) {
      this.addError(`Failed to parse holidays: ${error.message}`);
      return [];
    }
  }

  validateHoliday(holiday, index) {
    const prefix = `Holiday ${index + 1}`;
    let valid = true;
    
    // Check required fields
    if (!holiday.name || typeof holiday.name !== 'string') {
      this.addError(`${prefix}: Missing or invalid name`);
      valid = false;
    }
    
    if (!holiday.type || typeof holiday.type !== 'string') {
      this.addError(`${prefix}: Missing or invalid type`);
      valid = false;
    }
    
    if (!holiday.rule || typeof holiday.rule !== 'object') {
      this.addError(`${prefix}: Missing or invalid rule`);
      valid = false;
    }
    
    // Validate rule based on type
    if (holiday.type && this.validationRules[holiday.type]) {
      const ruleValid = this.validationRules[holiday.type](holiday.rule, prefix);
      if (!ruleValid) {
        valid = false;
      }
    } else if (holiday.type) {
      this.addError(`${prefix}: Unknown holiday type '${holiday.type}'`);
      valid = false;
    }
    
    // Check optional fields
    if (holiday.id && typeof holiday.id !== 'string') {
      this.addError(`${prefix}: ID must be a string`);
      valid = false;
    }
    
    if (holiday.duration && (typeof holiday.duration !== 'number' || holiday.duration < 1)) {
      this.addError(`${prefix}: Duration must be a positive number`);
      valid = false;
    }
    
    if (holiday.regions && !Array.isArray(holiday.regions)) {
      this.addError(`${prefix}: Regions must be an array`);
      valid = false;
    }
    
    if (holiday.active !== undefined && typeof holiday.active !== 'boolean') {
      this.addError(`${prefix}: Active must be a boolean`);
      valid = false;
    }
    
    return valid;
  }

  validateFixedRule(rule, prefix) {
    let valid = true;
    
    if (!rule.month || typeof rule.month !== 'number' || rule.month < 1 || rule.month > 12) {
      this.addError(`${prefix}: Fixed rule month must be 1-12`);
      valid = false;
    }
    
    if (!rule.day || typeof rule.day !== 'number' || rule.day < 1 || rule.day > 31) {
      this.addError(`${prefix}: Fixed rule day must be 1-31`);
      valid = false;
    }
    
    // Check for invalid dates
    if (rule.month && rule.day) {
      if (rule.month === 2 && rule.day > 29) {
        this.addError(`${prefix}: February cannot have day ${rule.day}`);
        valid = false;
      } else if ([4, 6, 9, 11].includes(rule.month) && rule.day > 30) {
        this.addError(`${prefix}: Month ${rule.month} cannot have day ${rule.day}`);
        valid = false;
      }
    }
    
    return valid;
  }

  validateNthWeekdayRule(rule, prefix) {
    let valid = true;
    
    if (!rule.month || typeof rule.month !== 'number' || rule.month < 1 || rule.month > 12) {
      this.addError(`${prefix}: Nth-weekday rule month must be 1-12`);
      valid = false;
    }
    
    if (rule.weekday === undefined || typeof rule.weekday !== 'number' || rule.weekday < 0 || rule.weekday > 6) {
      this.addError(`${prefix}: Nth-weekday rule weekday must be 0-6`);
      valid = false;
    }
    
    if (!rule.nth || typeof rule.nth !== 'number' || (rule.nth < 1 || rule.nth > 5) && rule.nth !== -1) {
      this.addError(`${prefix}: Nth-weekday rule nth must be 1-5 or -1`);
      valid = false;
    }
    
    return valid;
  }

  validateRelativeRule(rule, prefix) {
    let valid = true;
    
    if (!rule.relativeTo || typeof rule.relativeTo !== 'string') {
      this.addError(`${prefix}: Relative rule relativeTo must be a non-empty string`);
      valid = false;
    }
    
    if (rule.offset === undefined || typeof rule.offset !== 'number') {
      this.addError(`${prefix}: Relative rule offset must be a number`);
      valid = false;
    }
    
    return valid;
  }

  validateLunarRule(rule, prefix) {
    let valid = true;
    
    const validCalendars = ['islamic', 'chinese', 'hebrew', 'persian'];
    if (!rule.calendar || !validCalendars.includes(rule.calendar)) {
      this.addError(`${prefix}: Lunar rule calendar must be one of: ${validCalendars.join(', ')}`);
      valid = false;
    }
    
    if (!rule.month || typeof rule.month !== 'number' || rule.month < 1 || rule.month > 12) {
      this.addError(`${prefix}: Lunar rule month must be 1-12`);
      valid = false;
    }
    
    if (!rule.day || typeof rule.day !== 'number' || rule.day < 1 || rule.day > 31) {
      this.addError(`${prefix}: Lunar rule day must be 1-31`);
      valid = false;
    }
    
    return valid;
  }

  validateEasterRule(rule, prefix) {
    let valid = true;
    
    if (rule.offset === undefined || typeof rule.offset !== 'number') {
      this.addError(`${prefix}: Easter rule offset must be a number`);
      valid = false;
    }
    
    if (rule.offset < -60 || rule.offset > 60) {
      this.addWarning(`${prefix}: Easter rule offset ${rule.offset} seems unusual`);
    }
    
    return valid;
  }

  validateCustomRule(rule, prefix) {
    let valid = true;
    
    if (!rule.calculate || typeof rule.calculate !== 'function') {
      this.addError(`${prefix}: Custom rule must have a calculate function`);
      valid = false;
    }
    
    return valid;
  }

  checkDuplicates(holidays) {
    const seen = new Set();
    const duplicates = [];
    
    holidays.forEach((holiday, index) => {
      const key = holiday.name.toLowerCase();
      
      if (seen.has(key)) {
        duplicates.push(`Holiday ${index + 1}: Duplicate name '${holiday.name}'`);
      } else {
        seen.add(key);
      }
    });
    
    duplicates.forEach(duplicate => this.addWarning(duplicate));
  }

  checkMissingCommonHolidays(holidays, filePath) {
    const fileName = path.basename(filePath);
    const holidayNames = holidays.map(h => h.name.toLowerCase());
    
    // Common holidays by locale
    const commonHolidays = {
      'en-US': ['new year', 'independence day', 'thanksgiving', 'christmas'],
      'de-DE': ['neujahr', 'tag der arbeit', 'weihnachten'],
      'tr-TR': ['yılbaşı', 'cumhuriyet'],
      'ja-JP': ['元日', '成人の日']
    };
    
    // Try to detect locale from filename
    const locale = Object.keys(commonHolidays).find(l => fileName.includes(l));
    
    if (locale) {
      const missing = commonHolidays[locale].filter(common => {
        return !holidayNames.some(name => name.includes(common));
      });
      
      if (missing.length > 0) {
        this.addWarning(`Possibly missing common holidays for ${locale}: ${missing.join(', ')}`);
      }
    }
  }

  calculateHolidays(holidays, year) {
    console.log(`📅 Calculating holidays for year ${year}`);
    
    const results = [];
    
    holidays.forEach((holiday, index) => {
      try {
        const dates = this.calculateHoliday(holiday, year);
        results.push({
          name: holiday.name,
          type: holiday.type,
          dates: dates,
          valid: dates.length > 0
        });
      } catch (error) {
        this.addError(`Failed to calculate holiday ${index + 1} (${holiday.name}): ${error.message}`);
        results.push({
          name: holiday.name,
          type: holiday.type,
          dates: [],
          valid: false,
          error: error.message
        });
      }
    });
    
    return results;
  }

  calculateHoliday(holiday, year) {
    switch (holiday.type) {
      case 'fixed':
        return this.calculateFixed(holiday.rule, year);
      case 'nth-weekday':
        return this.calculateNthWeekday(holiday.rule, year);
      case 'easter-based':
        return this.calculateEasterBased(holiday.rule, year);
      default:
        return [];
    }
  }

  calculateFixed(rule, year) {
    const date = new Date(year, rule.month - 1, rule.day);
    
    // Check if date is valid
    if (date.getFullYear() !== year || 
        date.getMonth() !== rule.month - 1 || 
        date.getDate() !== rule.day) {
      return [];
    }
    
    return [date];
  }

  calculateNthWeekday(rule, year) {
    const { month, weekday, nth } = rule;
    
    if (nth > 0) {
      return [this.getNthWeekdayOfMonth(year, month - 1, weekday, nth)];
    } else {
      return [this.getLastNthWeekdayOfMonth(year, month - 1, weekday, Math.abs(nth))];
    }
  }

  calculateEasterBased(rule, year) {
    const easter = this.calculateEaster(year);
    const result = new Date(easter);
    result.setDate(result.getDate() + rule.offset);
    return [result];
  }

  calculateEaster(year) {
    const a = year % 19;
    const b = Math.floor(year / 100);
    const c = year % 100;
    const d = Math.floor(b / 4);
    const e = b % 4;
    const f = Math.floor((b + 8) / 25);
    const g = Math.floor((b - f + 1) / 3);
    const h = (19 * a + b - d - g + 15) % 30;
    const i = Math.floor(c / 4);
    const k = c % 4;
    const l = (32 + 2 * e + 2 * i - h - k) % 7;
    const m = Math.floor((a + 11 * h + 22 * l) / 451);
    const month = Math.floor((h + l - 7 * m + 114) / 31) - 1;
    const day = ((h + l - 7 * m + 114) % 31) + 1;
    
    return new Date(year, month, day);
  }

  getNthWeekdayOfMonth(year, month, weekday, nth) {
    const firstDay = new Date(year, month, 1);
    const firstDayWeekday = firstDay.getDay();
    
    let daysUntilWeekday = weekday - firstDayWeekday;
    if (daysUntilWeekday < 0) {
      daysUntilWeekday += 7;
    }
    
    const date = 1 + daysUntilWeekday + (nth - 1) * 7;
    
    return new Date(year, month, date);
  }

  getLastNthWeekdayOfMonth(year, month, weekday, nth) {
    const lastDay = new Date(year, month + 1, 0);
    const lastDayWeekday = lastDay.getDay();
    
    let daysBack = lastDayWeekday - weekday;
    if (daysBack < 0) {
      daysBack += 7;
    }
    
    const date = lastDay.getDate() - daysBack - (nth - 1) * 7;
    
    return new Date(year, month, date);
  }

  addError(message) {
    this.errors.push(message);
  }

  addWarning(message) {
    this.warnings.push(message);
  }

  printResults() {
    console.log('\n📊 Validation Results:');
    
    if (this.errors.length === 0) {
      console.log('✅ No errors found');
    } else {
      console.log(`❌ ${this.errors.length} error(s) found:`);
      this.errors.forEach(error => console.log(`   ${error}`));
    }
    
    if (this.warnings.length > 0) {
      console.log(`⚠️  ${this.warnings.length} warning(s):`);
      this.warnings.forEach(warning => console.log(`   ${warning}`));
    }
    
    console.log(`\nTotal: ${this.errors.length} errors, ${this.warnings.length} warnings`);
  }

  validateAllHolidayFiles() {
    console.log('🔍 Validating all holiday files...\n');
    
    const localeDir = path.join(process.cwd(), 'src', 'plugins', 'locale');
    
    if (!fs.existsSync(localeDir)) {
      console.log('❌ Locale directory not found');
      return false;
    }
    
    const locales = fs.readdirSync(localeDir, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);
    
    let allValid = true;
    
    locales.forEach(locale => {
      const holidayFile = path.join(localeDir, locale, 'holidays.ts');
      
      if (fs.existsSync(holidayFile)) {
        console.log(`\n--- ${locale} ---`);
        const valid = this.validateHolidayFile(holidayFile);
        
        if (!valid) {
          allValid = false;
        }
        
        this.printResults();
        
        // Reset for next file
        this.errors = [];
        this.warnings = [];
      }
    });
    
    return allValid;
  }

  async run() {
    const args = process.argv.slice(2);
    const command = args[0];
    
    switch (command) {
      case 'validate':
        const filePath = args[1];
        if (!filePath) {
          console.log('❌ Please provide holiday file path');
          process.exit(1);
        }
        
        const valid = this.validateHolidayFile(filePath);
        this.printResults();
        
        if (!valid) {
          process.exit(1);
        }
        break;
        
      case 'calculate':
        const calcFile = args[1];
        const year = parseInt(args[2]) || new Date().getFullYear();
        
        if (!calcFile) {
          console.log('❌ Please provide holiday file path');
          process.exit(1);
        }
        
        const content = fs.readFileSync(calcFile, 'utf8');
        const holidays = this.extractHolidays(content);
        const results = this.calculateHolidays(holidays, year);
        
        results.forEach(result => {
          console.log(`${result.name} (${result.type}): ${result.dates.map(d => d.toISOString().split('T')[0]).join(', ')}`);
        });
        break;
        
      case 'all':
        const allValid = this.validateAllHolidayFiles();
        if (!allValid) {
          process.exit(1);
        }
        break;
        
      default:
        console.log('Kairos Holiday Validator\n');
        console.log('Usage:');
        console.log('  node holiday-validator.js validate <file>     - Validate a specific holiday file');
        console.log('  node holiday-validator.js calculate <file> <year> - Calculate holidays for a year');
        console.log('  node holiday-validator.js all                 - Validate all holiday files');
        break;
    }
  }
}

// Run the validator
const validator = new HolidayValidator();
validator.run().catch(console.error);