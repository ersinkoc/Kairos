import type { KairosPlugin } from '../../../core/types/plugin.js';
import { holidays, observances, regionalHolidays, allHolidays } from './holidays.js';
import { localeManager } from '../../../core/locale-manager.js';

const locale = {
  name: '中文 (简体，中国)',
  code: 'zh-CN',
  months: [
    '一月',
    '二月',
    '三月',
    '四月',
    '五月',
    '六月',
    '七月',
    '八月',
    '九月',
    '十月',
    '十一月',
    '十二月',
  ],
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
  weekdays: ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'],
  weekdaysShort: ['周日', '周一', '周二', '周三', '周四', '周五', '周六'],
  weekdaysMin: ['日', '一', '二', '三', '四', '五', '六'],
  formats: {
    LT: 'HH:mm',
    LTS: 'HH:mm:ss',
    L: 'YYYY/MM/DD',
    LL: 'YYYY年M月D日',
    LLL: 'YYYY年M月D日 HH:mm',
    LLLL: 'dddd YYYY年M月D日 HH:mm',
  },
  ordinal: (n: number): string => {
    return `第${n}`;
  },
  meridiem: (hour: number, _minute: number, _isLower: boolean): string => {
    if (hour < 6) {
      return '凌晨';
    } else if (hour < 9) {
      return '早上';
    } else if (hour < 12) {
      return '上午';
    } else if (hour < 13) {
      return '中午';
    } else if (hour < 18) {
      return '下午';
    } else {
      return '晚上';
    }
  },
  relativeTime: {
    future: '%s后',
    past: '%s前',
    s: '几秒',
    ss: '%d秒',
    m: '1分钟',
    mm: '%d分钟',
    h: '1小时',
    hh: '%d小时',
    d: '1天',
    dd: '%d天',
    M: '1个月',
    MM: '%d个月',
    y: '1年',
    yy: '%d年',
  },
};

export default {
  name: 'locale-zh-CN',
  version: '1.0.0',
  size: 1024,
  dependencies: ['holiday-engine'],
  locale,
  install(kairos, _utils) {
    // Register the locale with the locale manager
    localeManager.register('zh-CN', {
      ...locale,
      holidays,
      observances,
      regionalHolidays,
    });

    // Register with legacy system for backward compatibility
    kairos.locales = kairos.locales || {};
    kairos.locales['zh-CN'] = locale;

    // Add Chinese-specific holiday methods
    kairos.extend({
      getChineseHolidays(region?: string): any[] {
        if (region) {
          const regionLower = region.toLowerCase();
          const regionHols = regionalHolidays[regionLower];
          if (regionHols) {
            return [...holidays, ...regionHols];
          }
        }
        return holidays;
      },

      getChineseObservances(): any[] {
        return observances;
      },

      getRegionalChineseHolidays(region: string): any[] {
        return regionalHolidays[region.toLowerCase()] || [];
      },

      getAllChineseHolidays(): any[] {
        return allHolidays;
      },
    });
  },
} as KairosPlugin;
