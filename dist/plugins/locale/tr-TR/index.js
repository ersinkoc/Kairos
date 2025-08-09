import { holidays, observances, historicalHolidays, allHolidays, publicHolidays, } from './holidays.js';
import { localeManager } from '../../../core/locale-manager.js';
const locale = {
    name: 'Türkçe (Türkiye)',
    code: 'tr-TR',
    months: [
        'Ocak',
        'Şubat',
        'Mart',
        'Nisan',
        'Mayıs',
        'Haziran',
        'Temmuz',
        'Ağustos',
        'Eylül',
        'Ekim',
        'Kasım',
        'Aralık',
    ],
    monthsShort: ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'],
    weekdays: ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'],
    weekdaysShort: ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'],
    weekdaysMin: ['Pz', 'Pt', 'Sa', 'Ça', 'Pe', 'Cu', 'Ct'],
    formats: {
        LT: 'HH:mm',
        LTS: 'HH:mm:ss',
        L: 'DD.MM.YYYY',
        LL: 'D MMMM YYYY',
        LLL: 'D MMMM YYYY HH:mm',
        LLLL: 'dddd, D MMMM YYYY HH:mm',
    },
    ordinal: (n) => {
        if (n === 1)
            return `${n}'inci`;
        if (n === 2)
            return `${n}'nci`;
        if (n === 3)
            return `${n}'üncü`;
        if (n === 4)
            return `${n}'üncü`;
        if (n === 5)
            return `${n}'inci`;
        if (n === 6)
            return `${n}'ncı`;
        if (n === 7)
            return `${n}'nci`;
        if (n === 8)
            return `${n}'inci`;
        if (n === 9)
            return `${n}'uncu`;
        if (n === 10)
            return `${n}'uncu`;
        const lastDigit = n % 10;
        const lastTwoDigits = n % 100;
        if (lastTwoDigits >= 11 && lastTwoDigits <= 13) {
            return `${n}'üncü`;
        }
        switch (lastDigit) {
            case 1:
                return `${n}'inci`;
            case 2:
                return `${n}'nci`;
            case 3:
                return `${n}'üncü`;
            case 4:
                return `${n}'üncü`;
            case 5:
                return `${n}'inci`;
            case 6:
                return `${n}'ncı`;
            case 7:
                return `${n}'nci`;
            case 8:
                return `${n}'inci`;
            case 9:
                return `${n}'uncu`;
            case 0:
                return `${n}'uncu`;
            default:
                return `${n}'üncü`;
        }
    },
    meridiem: (_hour, _minute, _isLower) => {
        return '';
    },
};
export default {
    name: 'locale-tr-TR',
    version: '1.0.0',
    size: 1536,
    dependencies: ['holiday-engine'],
    locale,
    install(kairos, _utils) {
        localeManager.register('tr-TR', {
            ...locale,
            holidays,
            publicHolidays,
            observances,
            historicalHolidays,
        });
        kairos.locales = kairos.locales || {};
        kairos.locales['tr-TR'] = locale;
        kairos.extend({
            getTurkishHolidays(type) {
                switch (type) {
                    case 'public':
                        return publicHolidays;
                    case 'religious':
                        return holidays.filter((h) => h.type === 'lunar' || h.type === 'custom');
                    case 'historical':
                        return historicalHolidays;
                    case 'all':
                        return allHolidays;
                    default:
                        return holidays;
                }
            },
            getPublicHolidays() {
                return publicHolidays;
            },
            getReligiousHolidays() {
                return holidays.filter((h) => h.type === 'lunar' || h.type === 'custom');
            },
            getObservances() {
                return observances;
            },
            isReligiousHoliday() {
                const holidayInfo = this.getHolidayInfo();
                return holidayInfo ? holidayInfo.type === 'lunar' || holidayInfo.type === 'custom' : false;
            },
            isPublicHoliday() {
                const holidayInfo = this.getHolidayInfo(publicHolidays);
                return holidayInfo !== null;
            },
            formatTurkish(template) {
                const turkishTemplate = template || 'D MMMM YYYY, dddd';
                return this.format(turkishTemplate);
            },
        });
        kairos.addStatic?.({
            getRamazanBayrami(year) {
                const ramadanFeast = holidays.find((h) => h.id === 'ramadan-feast');
                if (ramadanFeast) {
                    const dates = kairos.holidayEngine.calculate(ramadanFeast, year);
                    return dates.map((date) => kairos(date));
                }
                return [];
            },
            getKurbanBayrami(year) {
                const sacrificeFeast = holidays.find((h) => h.id === 'sacrifice-feast');
                if (sacrificeFeast) {
                    const dates = kairos.holidayEngine.calculate(sacrificeFeast, year);
                    return dates.map((date) => kairos(date));
                }
                return [];
            },
            getKandilGecesi(year) {
                const kandilNights = holidays.filter((h) => h.name.includes('Kandil') || h.name.includes('Kadir'));
                const result = [];
                for (const kandil of kandilNights) {
                    const dates = kairos.holidayEngine.calculate(kandil, year);
                    result.push(...dates.map((date) => ({
                        date: kairos(date),
                        name: kandil.name,
                    })));
                }
                return result.sort((a, b) => a.date.valueOf() - b.date.valueOf());
            },
        });
    },
};
//# sourceMappingURL=index.js.map