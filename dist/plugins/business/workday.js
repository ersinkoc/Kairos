export class BusinessDayCalculator {
    constructor(config = {}) {
        this.cache = new Map();
        this.config = {
            weekends: [0, 6],
            holidays: [],
            customRules: [],
            ...config,
        };
    }
    updateConfig(config) {
        this.config = { ...this.config, ...config };
        this.cache.clear();
    }
    isBusinessDay(date) {
        const cacheKey = date.toISOString().split('T')[0];
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }
        const result = this.calculateIsBusinessDay(date);
        this.cache.set(cacheKey, result);
        return result;
    }
    calculateIsBusinessDay(date) {
        const dayOfWeek = date.getDay();
        if (this.config.weekends?.includes(dayOfWeek)) {
            return false;
        }
        if (this.config.holidays && this.config.holidays.length > 0) {
            const holidayEngine = globalThis.kairos?.holidayEngine;
            if (holidayEngine) {
                const holidayInfo = holidayEngine.isHoliday(date, this.config.holidays);
                if (holidayInfo) {
                    return false;
                }
            }
        }
        if (this.config.customRules) {
            for (const rule of this.config.customRules) {
                if (!rule(date)) {
                    return false;
                }
            }
        }
        return true;
    }
    nextBusinessDay(date, maxIterations = 1000) {
        const next = new Date(date);
        next.setDate(next.getDate() + 1);
        let iterations = 0;
        while (!this.isBusinessDay(next)) {
            if (++iterations > maxIterations) {
                throw new Error('No business day found within reasonable range (1000 days). Check your business day configuration.');
            }
            next.setDate(next.getDate() + 1);
        }
        return next;
    }
    previousBusinessDay(date, maxIterations = 1000) {
        const prev = new Date(date);
        prev.setDate(prev.getDate() - 1);
        let iterations = 0;
        while (!this.isBusinessDay(prev)) {
            if (++iterations > maxIterations) {
                throw new Error('No business day found within reasonable range (1000 days). Check your business day configuration.');
            }
            prev.setDate(prev.getDate() - 1);
        }
        return prev;
    }
    addBusinessDays(date, days, maxIterations = 10000) {
        if (days === 0)
            return new Date(date);
        const current = new Date(date);
        let count = 0;
        const direction = days > 0 ? 1 : -1;
        const target = Math.abs(days);
        let iterations = 0;
        while (count < target) {
            if (++iterations > maxIterations) {
                throw new Error(`Unable to add ${days} business days within ${maxIterations} iterations. Check your business day configuration.`);
            }
            current.setDate(current.getDate() + direction);
            if (this.isBusinessDay(current)) {
                count++;
            }
        }
        return current;
    }
    businessDaysBetween(start, end) {
        const startDate = new Date(start);
        startDate.setHours(0, 0, 0, 0);
        const endDate = new Date(end);
        endDate.setHours(0, 0, 0, 0);
        if (startDate.getTime() === endDate.getTime()) {
            return 0;
        }
        const isForward = startDate < endDate;
        const direction = isForward ? 1 : -1;
        let count = 0;
        const current = new Date(startDate);
        current.setDate(current.getDate() + direction);
        while (isForward ? current.getTime() <= endDate.getTime() : current.getTime() >= endDate.getTime()) {
            if (this.isBusinessDay(current)) {
                count++;
            }
            current.setDate(current.getDate() + direction);
        }
        return isForward ? count : -count;
    }
    businessDaysInMonth(year, month) {
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        let count = 0;
        const current = new Date(firstDay);
        while (current <= lastDay) {
            if (this.isBusinessDay(current)) {
                count++;
            }
            current.setDate(current.getDate() + 1);
        }
        return count;
    }
    businessDaysInYear(year) {
        const firstDay = new Date(year, 0, 1);
        const lastDay = new Date(year, 11, 31);
        let count = 0;
        const current = new Date(firstDay);
        while (current <= lastDay) {
            if (this.isBusinessDay(current)) {
                count++;
            }
            current.setDate(current.getDate() + 1);
        }
        return count;
    }
    settlementDate(date, days) {
        return this.addBusinessDays(date, days);
    }
    getBusinessDaysInMonth(year, month) {
        const result = [];
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const current = new Date(firstDay);
        while (current <= lastDay) {
            if (this.isBusinessDay(current)) {
                result.push(new Date(current));
            }
            current.setDate(current.getDate() + 1);
        }
        return result;
    }
    getBusinessDaysInRange(start, end) {
        const result = [];
        const current = new Date(start);
        while (current <= end) {
            if (this.isBusinessDay(current)) {
                result.push(new Date(current));
            }
            current.setDate(current.getDate() + 1);
        }
        return result;
    }
    getNthBusinessDay(year, month, nth) {
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const current = new Date(firstDay);
        let count = 0;
        while (current <= lastDay) {
            if (this.isBusinessDay(current)) {
                count++;
                if (count === nth) {
                    return new Date(current);
                }
            }
            current.setDate(current.getDate() + 1);
        }
        return null;
    }
    getLastBusinessDay(year, month) {
        const lastDay = new Date(year, month + 1, 0);
        const current = new Date(lastDay);
        while (current.getMonth() === month) {
            if (this.isBusinessDay(current)) {
                return new Date(current);
            }
            current.setDate(current.getDate() - 1);
        }
        return null;
    }
    clearCache() {
        this.cache.clear();
    }
}
const defaultCalculator = new BusinessDayCalculator();
export default {
    name: 'business-workday',
    version: '1.0.0',
    size: 2048,
    dependencies: ['holiday-engine'],
    install(kairos, _utils) {
        kairos.extend({
            isBusinessDay(config) {
                const calculator = config ? new BusinessDayCalculator(config) : defaultCalculator;
                if (!config?.holidays && this.getHolidays) {
                    const holidays = this.getHolidays();
                    calculator.updateConfig({ holidays });
                }
                return calculator.isBusinessDay(this.toDate());
            },
            isWeekend() {
                const dayOfWeek = this.day();
                return dayOfWeek === 0 || dayOfWeek === 6;
            },
            nextBusinessDay(config) {
                const calculator = config ? new BusinessDayCalculator(config) : defaultCalculator;
                if (!config?.holidays && this.getHolidays) {
                    const holidays = this.getHolidays();
                    calculator.updateConfig({ holidays });
                }
                const nextDate = calculator.nextBusinessDay(this.toDate());
                return kairos(nextDate);
            },
            previousBusinessDay(config) {
                const calculator = config ? new BusinessDayCalculator(config) : defaultCalculator;
                if (!config?.holidays && this.getHolidays) {
                    const holidays = this.getHolidays();
                    calculator.updateConfig({ holidays });
                }
                const prevDate = calculator.previousBusinessDay(this.toDate());
                return kairos(prevDate);
            },
            addBusinessDays(days, config) {
                const calculator = config ? new BusinessDayCalculator(config) : defaultCalculator;
                if (!config?.holidays && this.getHolidays) {
                    const holidays = this.getHolidays();
                    calculator.updateConfig({ holidays });
                }
                const resultDate = calculator.addBusinessDays(this.toDate(), days);
                return kairos(resultDate);
            },
            businessDaysBetween(other, config) {
                const calculator = config ? new BusinessDayCalculator(config) : defaultCalculator;
                if (!config?.holidays && this.getHolidays) {
                    const holidays = this.getHolidays();
                    calculator.updateConfig({ holidays });
                }
                return calculator.businessDaysBetween(this.toDate(), other.toDate());
            },
            businessDaysInMonth(config) {
                const calculator = config ? new BusinessDayCalculator(config) : defaultCalculator;
                if (!config?.holidays && this.getHolidays) {
                    const holidays = this.getHolidays();
                    calculator.updateConfig({ holidays });
                }
                return calculator.businessDaysInMonth(this.year(), this.month() - 1);
            },
            settlementDate(days, config) {
                const calculator = config ? new BusinessDayCalculator(config) : defaultCalculator;
                if (!config?.holidays && this.getHolidays) {
                    const holidays = this.getHolidays();
                    calculator.updateConfig({ holidays });
                }
                const settlementDate = calculator.settlementDate(this.toDate(), days);
                return kairos(settlementDate);
            },
            isWorkingHour(startHour = 9, endHour = 17) {
                const hour = this.hour();
                return this.isBusinessDay() && hour >= startHour && hour < endHour;
            },
        });
        kairos.addStatic?.({
            businessDayCalculator: defaultCalculator,
            createBusinessDayCalculator(config) {
                return new BusinessDayCalculator(config);
            },
            getBusinessDaysInMonth(year, month, config) {
                const calculator = config ? new BusinessDayCalculator(config) : defaultCalculator;
                const dates = calculator.getBusinessDaysInMonth(year, month - 1);
                return dates.map((date) => kairos(date));
            },
            getBusinessDaysInRange(start, end, config) {
                const calculator = config ? new BusinessDayCalculator(config) : defaultCalculator;
                const startDate = kairos(start).toDate();
                const endDate = kairos(end).toDate();
                const dates = calculator.getBusinessDaysInRange(startDate, endDate);
                return dates.map((date) => kairos(date));
            },
            getNthBusinessDay(year, month, nth, config) {
                const calculator = config ? new BusinessDayCalculator(config) : defaultCalculator;
                const date = calculator.getNthBusinessDay(year, month - 1, nth);
                return date ? kairos(date) : null;
            },
            getLastBusinessDay(year, month, config) {
                const calculator = config ? new BusinessDayCalculator(config) : defaultCalculator;
                const date = calculator.getLastBusinessDay(year, month - 1);
                return date ? kairos(date) : null;
            },
            businessDaysInYear(year, config) {
                const calculator = config ? new BusinessDayCalculator(config) : defaultCalculator;
                return calculator.businessDaysInYear(year);
            },
        });
    },
};
//# sourceMappingURL=workday.js.map