import type { KairosPlugin } from '../../core/types/plugin';

interface FiscalConfig {
  startMonth?: number; // 1-12
}

const fiscalPlugin: KairosPlugin = {
  name: 'fiscal',
  install(kairos) {
    // Add instance methods
    kairos.extend({
      fiscalYear(config?: FiscalConfig): number {
        const startMonth = config?.startMonth || 1;
        const currentMonth = this.month();
        const currentYear = this.year();
        
        if (currentMonth >= startMonth) {
          return currentYear;
        } else {
          return currentYear - 1;
        }
      },

      fiscalQuarter(config?: FiscalConfig): number {
        const startMonth = config?.startMonth || 1;
        const currentMonth = this.month();
        
        // Adjust month relative to fiscal year start
        let adjustedMonth = currentMonth - startMonth + 1;
        if (adjustedMonth <= 0) {
          adjustedMonth += 12;
        }
        
        return Math.ceil(adjustedMonth / 3);
      },

      fiscalMonth(config?: FiscalConfig): number {
        const startMonth = config?.startMonth || 1;
        const currentMonth = this.month();
        
        let adjustedMonth = currentMonth - startMonth + 1;
        if (adjustedMonth <= 0) {
          adjustedMonth += 12;
        }
        
        return adjustedMonth;
      },

      startOfFiscalYear(config?: FiscalConfig): any {
        const startMonth = config?.startMonth || 1;
        const fiscalYear = this.fiscalYear(config);
        
        return kairos()
          .year(fiscalYear)
          .month(startMonth)
          .date(1)
          .startOf('day');
      },

      endOfFiscalYear(config?: FiscalConfig): any {
        const startMonth = config?.startMonth || 1;
        const fiscalYear = this.fiscalYear(config);
        
        const endYear = startMonth === 1 ? fiscalYear : fiscalYear + 1;
        const endMonth = startMonth === 1 ? 12 : startMonth - 1;
        
        return kairos()
          .year(endYear)
          .month(endMonth)
          .endOf('month');
      },

      startOfFiscalQuarter(config?: FiscalConfig): any {
        const startMonth = config?.startMonth || 1;
        const quarter = this.fiscalQuarter(config);
        const fiscalYear = this.fiscalYear(config);
        
        const quarterStartMonth = startMonth + (quarter - 1) * 3;
        const year = quarterStartMonth > 12 ? fiscalYear + 1 : fiscalYear;
        const month = quarterStartMonth > 12 ? quarterStartMonth - 12 : quarterStartMonth;
        
        return kairos()
          .year(year)
          .month(month)
          .date(1)
          .startOf('day');
      },

      endOfFiscalQuarter(config?: FiscalConfig): any {
        const startMonth = config?.startMonth || 1;
        const quarter = this.fiscalQuarter(config);
        const fiscalYear = this.fiscalYear(config);
        
        const quarterEndMonth = startMonth + quarter * 3 - 1;
        const year = quarterEndMonth > 12 ? fiscalYear + 1 : fiscalYear;
        const month = quarterEndMonth > 12 ? quarterEndMonth - 12 : quarterEndMonth;
        
        return kairos()
          .year(year)
          .month(month)
          .endOf('month');
      }
    });

    // Add static methods
    kairos.addStatic({
      fiscalYear(date: any, config?: FiscalConfig): number {
        return kairos(date).fiscalYear(config);
      },

      fiscalQuarter(date: any, config?: FiscalConfig): number {
        return kairos(date).fiscalQuarter(config);
      },

      createFiscalCalendar(config?: FiscalConfig): any {
        return {
          startMonth: config?.startMonth || 1,
          getYear: (date: any) => kairos(date).fiscalYear(config),
          getQuarter: (date: any) => kairos(date).fiscalQuarter(config),
          getMonth: (date: any) => kairos(date).fiscalMonth(config)
        };
      }
    });
  }
};

export default fiscalPlugin;