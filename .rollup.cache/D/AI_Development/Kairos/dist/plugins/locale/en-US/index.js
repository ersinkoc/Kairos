import { holidays, federalHolidays, stateHolidays, allHolidays } from './holidays.js';
import { localeManager } from '../../../core/locale-manager.js';
const locale = {
    name: 'English (United States)',
    code: 'en-US',
    months: [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December',
    ],
    monthsShort: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    weekdays: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    weekdaysShort: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    weekdaysMin: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
    formats: {
        LT: 'h:mm A',
        LTS: 'h:mm:ss A',
        L: 'MM/DD/YYYY',
        LL: 'MMMM D, YYYY',
        LLL: 'MMMM D, YYYY h:mm A',
        LLLL: 'dddd, MMMM D, YYYY h:mm A',
    },
    ordinal: (n) => {
        if (n >= 11 && n <= 13)
            return `${n}th`;
        switch (n % 10) {
            case 1:
                return `${n}st`;
            case 2:
                return `${n}nd`;
            case 3:
                return `${n}rd`;
            default:
                return `${n}th`;
        }
    },
    meridiem: (hour, _minute, isLower) => {
        const suffix = hour < 12 ? 'AM' : 'PM';
        return isLower ? suffix.toLowerCase() : suffix;
    },
};
export default {
    name: 'locale-en-US',
    version: '1.0.0',
    size: 1024,
    dependencies: ['holiday-engine'],
    locale,
    install(kairos, _utils) {
        localeManager.register('en-US', {
            ...locale,
            holidays,
            federalHolidays,
            stateHolidays: stateHolidays,
        });
        kairos.locales = kairos.locales || {};
        kairos.locales['en-US'] = locale;
        kairos.extend({
            getUSHolidays(state) {
                if (state) {
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
                return stateHolidays[state.toLowerCase()] || [];
            },
            getAllUSHolidays() {
                return allHolidays;
            },
        });
        kairos.addStatic?.({
            locale(name) {
                if (name === undefined) {
                    return localeManager.getCurrentLocale();
                }
                if (localeManager.setLocale(name)) {
                    kairos.currentLocale = name;
                    return kairos;
                }
                throw new Error(`Locale '${name}' not found`);
            },
            getAvailableLocales() {
                return Object.keys(kairos.locales || {});
            },
        });
        kairos.currentLocale = 'en-US';
    },
};
//# sourceMappingURL=index.js.map