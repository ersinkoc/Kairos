export class FixedCalculator {
    calculate(rule, year) {
        const { month, day } = rule.rule;
        const date = new Date(year, month - 1, day);
        if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
            return [];
        }
        return [date];
    }
}
export default {
    name: 'holiday-fixed-calculator',
    version: '1.0.0',
    size: 256,
    dependencies: ['holiday-engine'],
    install(kairos, _utils) {
        const engine = kairos.holidayEngine;
        if (engine) {
            engine.registerCalculator('fixed', new FixedCalculator());
        }
    },
};
//# sourceMappingURL=fixed.js.map