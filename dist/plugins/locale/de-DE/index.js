import { holidays, stateHolidays, federalHolidays, allHolidays, historicalHolidays, } from './holidays.js';
import { localeManager } from '../../../core/locale-manager.js';
const locale = {
    name: 'Deutsch (Deutschland)',
    code: 'de-DE',
    months: [
        'Januar',
        'Februar',
        'März',
        'April',
        'Mai',
        'Juni',
        'Juli',
        'August',
        'September',
        'Oktober',
        'November',
        'Dezember',
    ],
    monthsShort: ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'],
    weekdays: ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'],
    weekdaysShort: ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'],
    weekdaysMin: ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'],
    formats: {
        LT: 'HH:mm',
        LTS: 'HH:mm:ss',
        L: 'DD.MM.YYYY',
        LL: 'D. MMMM YYYY',
        LLL: 'D. MMMM YYYY HH:mm',
        LLLL: 'dddd, D. MMMM YYYY HH:mm',
    },
    ordinal: (n) => {
        return `${n}.`;
    },
    meridiem: (_hour, _minute, _isLower) => {
        return '';
    },
};
export default {
    name: 'locale-de-DE',
    version: '1.0.0',
    size: 2048,
    dependencies: ['holiday-engine'],
    locale,
    install(kairos, _utils) {
        localeManager.register('de-DE', {
            ...locale,
            holidays,
            federalHolidays,
            stateHolidays: stateHolidays,
            historicalHolidays,
        });
        kairos.locales = kairos.locales || {};
        kairos.locales['de-DE'] = locale;
        kairos.extend({
            getGermanHolidays(state) {
                if (state && typeof state === 'string') {
                    const stateLower = state.toLowerCase();
                    const stateHols = stateHolidays[stateLower];
                    if (stateHols) {
                        return [...federalHolidays, ...stateHols];
                    }
                }
                return holidays;
            },
            getFederalHolidays() {
                return federalHolidays;
            },
            getStateHolidays(state) {
                if (!state || typeof state !== 'string') {
                    return [];
                }
                return stateHolidays[state.toLowerCase()] || [];
            },
            getAllHolidays() {
                return allHolidays;
            },
            getHistoricalHolidays() {
                return historicalHolidays;
            },
            isEasterHoliday() {
                const holidayInfo = this.getHolidayInfo();
                return holidayInfo ? holidayInfo.type === 'easter-based' : false;
            },
            isCatholicHoliday() {
                const holidayInfo = this.getHolidayInfo();
                const catholicHolidays = ['epiphany', 'corpus-christi', 'assumption-day', 'all-saints-day'];
                return holidayInfo ? catholicHolidays.includes(holidayInfo.id) : false;
            },
            isProtestantHoliday() {
                const holidayInfo = this.getHolidayInfo();
                const protestantHolidays = ['reformation-day', 'repentance-day'];
                return holidayInfo ? protestantHolidays.includes(holidayInfo.id) : false;
            },
            formatGerman(template) {
                const germanTemplate = template || 'dddd, D. MMMM YYYY';
                return this.format(germanTemplate);
            },
        });
        kairos.addStatic?.({
            getEasterHolidays(year) {
                const easterHolidays = holidays.filter((h) => h.type === 'easter-based');
                const result = [];
                for (const holiday of easterHolidays) {
                    const dates = kairos.holidayEngine.calculate(holiday, year);
                    result.push(...dates.map((date) => ({
                        date: kairos(date),
                        name: holiday.name,
                        id: holiday.id,
                    })));
                }
                return result.sort((a, b) => a.date.valueOf() - b.date.valueOf());
            },
            getBusBettag(year) {
                const repentanceDay = stateHolidays.saxony.find((h) => h.id === 'repentance-day');
                if (repentanceDay) {
                    const dates = kairos.holidayEngine.calculate(repentanceDay, year);
                    return dates.length > 0 ? kairos(dates[0]) : null;
                }
                return null;
            },
            getStateHolidaysForYear(state, year) {
                if (!state || typeof state !== 'string') {
                    return [];
                }
                const stateHols = stateHolidays[state.toLowerCase()];
                if (!stateHols)
                    return [];
                const result = [];
                for (const holiday of stateHols) {
                    const dates = kairos.holidayEngine.calculate(holiday, year);
                    result.push(...dates.map((date) => ({
                        date: kairos(date),
                        name: holiday.name,
                        id: holiday.id,
                    })));
                }
                return result.sort((a, b) => a.date.valueOf() - b.date.valueOf());
            },
            getAvailableStates() {
                return Object.keys(stateHolidays);
            },
        });
    },
};
//# sourceMappingURL=index.js.map