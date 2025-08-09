import { holidays, observances, historicalHolidays, goldenWeekHolidays, publicHolidays, allHolidays, reiwaHolidays, heiseiHolidays, olympics2020Holidays, } from './holidays.js';
import { localeManager } from '../../../core/locale-manager.js';
const locale = {
    name: '日本語 (日本)',
    code: 'ja-JP',
    months: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
    monthsShort: [
        '1月',
        '2月',
        '3月',
        '4月',
        '5月',
        '6月',
        '7月',
        '8月',
        '9月',
        '10月',
        '11月',
        '12月',
    ],
    weekdays: ['日曜日', '月曜日', '火曜日', '水曜日', '木曜日', '金曜日', '土曜日'],
    weekdaysShort: ['日', '月', '火', '水', '木', '金', '土'],
    weekdaysMin: ['日', '月', '火', '水', '木', '金', '土'],
    formats: {
        LT: 'HH:mm',
        LTS: 'HH:mm:ss',
        L: 'YYYY/MM/DD',
        LL: 'YYYY年M月D日',
        LLL: 'YYYY年M月D日 HH:mm',
        LLLL: 'YYYY年M月D日 dddd HH:mm',
    },
    ordinal: (n) => {
        return `${n}日`;
    },
    meridiem: (hour, _minute, _isLower) => {
        const suffix = hour < 12 ? '午前' : '午後';
        return suffix;
    },
};
export default {
    name: 'locale-ja-JP',
    version: '1.0.0',
    size: 2048,
    dependencies: ['holiday-engine', 'holiday-custom-calculator'],
    locale,
    install(kairos, _utils) {
        localeManager.register('ja-JP', {
            ...locale,
            holidays,
            publicHolidays,
            observances,
            historicalHolidays,
            goldenWeekHolidays,
            reiwaHolidays,
            heiseiHolidays,
        });
        kairos.locales = kairos.locales || {};
        kairos.locales['ja-JP'] = locale;
        kairos.extend({
            getJapaneseHolidays(type) {
                switch (type) {
                    case 'public':
                        return publicHolidays;
                    case 'observances':
                        return observances;
                    case 'historical':
                        return historicalHolidays;
                    case 'golden-week':
                        return goldenWeekHolidays;
                    case 'reiwa':
                        return reiwaHolidays;
                    case 'heisei':
                        return heiseiHolidays;
                    case 'olympics2020':
                        return olympics2020Holidays;
                    case 'all':
                        return allHolidays;
                    default:
                        return holidays;
                }
            },
            getPublicHolidays() {
                return publicHolidays;
            },
            getObservances() {
                return observances;
            },
            getGoldenWeekHolidays() {
                return goldenWeekHolidays;
            },
            isGoldenWeekHoliday() {
                const holidayInfo = this.getHolidayInfo(goldenWeekHolidays);
                return holidayInfo !== null;
            },
            isPublicHoliday() {
                const holidayInfo = this.getHolidayInfo(publicHolidays);
                return holidayInfo !== null;
            },
            isObservance() {
                const holidayInfo = this.getHolidayInfo(observances);
                return holidayInfo !== null;
            },
            isEquinoxHoliday() {
                const holidayInfo = this.getHolidayInfo();
                return holidayInfo
                    ? ['vernal-equinox-day', 'autumnal-equinox-day'].includes(holidayInfo.id)
                    : false;
            },
            formatJapanese(template) {
                const japaneseTemplate = template || 'YYYY年M月D日（ddd）';
                return this.format(japaneseTemplate);
            },
            getJapaneseEra() {
                const year = this.year();
                if (year >= 2019)
                    return '令和';
                if (year >= 1989)
                    return '平成';
                if (year >= 1926)
                    return '昭和';
                if (year >= 1912)
                    return '大正';
                if (year >= 1868)
                    return '明治';
                return '不明';
            },
            getJapaneseEraYear() {
                const year = this.year();
                if (year >= 2019)
                    return year - 2018;
                if (year >= 1989)
                    return year - 1988;
                if (year >= 1926)
                    return year - 1925;
                if (year >= 1912)
                    return year - 1911;
                if (year >= 1868)
                    return year - 1867;
                return year;
            },
            formatWithEra() {
                const era = this.getJapaneseEra();
                const eraYear = this.getJapaneseEraYear();
                const month = this.month();
                const day = this.date();
                return `${era}${eraYear}年${month}月${day}日`;
            },
        });
        kairos.addStatic?.({
            getGoldenWeek(year) {
                const result = [];
                for (const holiday of goldenWeekHolidays) {
                    const dates = kairos.holidayEngine.calculate(holiday, year);
                    result.push(...dates.map((date) => ({
                        date: kairos(date),
                        name: holiday.name,
                        id: holiday.id,
                    })));
                }
                return result.sort((a, b) => a.date.valueOf() - b.date.valueOf());
            },
            getEquinoxDays(year) {
                const equinoxHolidays = holidays.filter((h) => ['vernal-equinox-day', 'autumnal-equinox-day'].includes(h.id));
                const result = [];
                for (const holiday of equinoxHolidays) {
                    const dates = kairos.holidayEngine.calculate(holiday, year);
                    result.push(...dates.map((date) => ({
                        date: kairos(date),
                        name: holiday.name,
                        id: holiday.id,
                    })));
                }
                return result.sort((a, b) => a.date.valueOf() - b.date.valueOf());
            },
            getObon(year) {
                const obon = observances.find((h) => h.id === 'obon');
                if (obon) {
                    const dates = kairos.holidayEngine.calculate(obon, year);
                    return dates.map((date) => kairos(date));
                }
                return [];
            },
            isReiwaEra(year) {
                return year >= 2019;
            },
            isHeiseiEra(year) {
                return year >= 1989 && year <= 2019;
            },
            isShowaEra(year) {
                return year >= 1926 && year <= 1989;
            },
            toJapaneseEra(year) {
                if (year >= 2019)
                    return { era: '令和', year: year - 2018 };
                if (year >= 1989)
                    return { era: '平成', year: year - 1988 };
                if (year >= 1926)
                    return { era: '昭和', year: year - 1925 };
                if (year >= 1912)
                    return { era: '大正', year: year - 1911 };
                if (year >= 1868)
                    return { era: '明治', year: year - 1867 };
                return { era: '不明', year: year };
            },
            getHolidaysForEra(era) {
                switch (era) {
                    case 'reiwa':
                        return reiwaHolidays;
                    case 'heisei':
                        return heiseiHolidays;
                    case 'showa':
                        return holidays;
                    default:
                        return holidays;
                }
            },
        });
    },
};
//# sourceMappingURL=index.js.map