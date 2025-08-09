export class LocaleManager {
    constructor() {
        this.locales = new Map();
        this.currentLocale = 'en-US';
        this.defaultLocale = 'en-US';
    }
    static getInstance() {
        if (!LocaleManager.instance) {
            LocaleManager.instance = new LocaleManager();
        }
        return LocaleManager.instance;
    }
    register(code, locale) {
        this.locales.set(code, locale);
        if (this.locales.size === 1) {
            this.defaultLocale = code;
            this.currentLocale = code;
        }
    }
    setLocale(code) {
        if (this.locales.has(code)) {
            this.currentLocale = code;
            return true;
        }
        return false;
    }
    getLocale(code) {
        const targetCode = code || this.currentLocale;
        return this.locales.get(targetCode);
    }
    getCurrentLocale() {
        return this.currentLocale;
    }
    getDefaultLocale() {
        return this.defaultLocale;
    }
    setDefaultLocale(code) {
        if (this.locales.has(code)) {
            this.defaultLocale = code;
            return true;
        }
        return false;
    }
    getHolidays(localeCode, type) {
        const locale = this.getLocale(localeCode);
        if (!locale) {
            return [];
        }
        if (type) {
            switch (type) {
                case 'federal':
                    return locale.federalHolidays || [];
                case 'state':
                    return locale.stateHolidays ? Object.values(locale.stateHolidays).flat() : [];
                case 'public':
                    return locale.publicHolidays || [];
                case 'observances':
                    return locale.observances || [];
                default:
                    if (locale[type] && Array.isArray(locale[type])) {
                        return locale[type];
                    }
            }
        }
        return locale.holidays || [];
    }
    getStateHolidays(state, localeCode) {
        const locale = this.getLocale(localeCode);
        if (!locale || !locale.stateHolidays) {
            return [];
        }
        const stateLower = state.toLowerCase();
        return locale.stateHolidays[stateLower] || [];
    }
    getAllHolidays(localeCode) {
        const locale = this.getLocale(localeCode);
        if (!locale) {
            return [];
        }
        const allHolidays = [];
        if (locale.holidays) {
            allHolidays.push(...locale.holidays);
        }
        if (locale.federalHolidays) {
            allHolidays.push(...locale.federalHolidays);
        }
        if (locale.stateHolidays) {
            for (const stateHols of Object.values(locale.stateHolidays)) {
                allHolidays.push(...stateHols);
            }
        }
        if (locale.publicHolidays) {
            allHolidays.push(...locale.publicHolidays);
        }
        if (locale.observances) {
            allHolidays.push(...locale.observances);
        }
        const uniqueHolidays = new Map();
        for (const holiday of allHolidays) {
            if (!uniqueHolidays.has(holiday.name)) {
                uniqueHolidays.set(holiday.name, holiday);
            }
        }
        return Array.from(uniqueHolidays.values());
    }
    getAvailableLocales() {
        return Array.from(this.locales.keys());
    }
    hasLocale(code) {
        return this.locales.has(code);
    }
    clear() {
        this.locales.clear();
        this.currentLocale = 'en-US';
        this.defaultLocale = 'en-US';
    }
}
export const localeManager = LocaleManager.getInstance();
//# sourceMappingURL=locale-manager.js.map