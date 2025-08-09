#!/usr/bin/env node

import kairos from '../index.js';
import chalk from 'chalk';
import { table } from 'table';

console.log(chalk.cyan.bold('👥 Payroll System Examples\n'));
console.log('='.repeat(60));

// Mock employee data
const employees = [
  { id: 1, name: 'Alice Johnson', type: 'salary', annual: 75000, startDate: '2023-03-15' },
  { id: 2, name: 'Bob Smith', type: 'hourly', rate: 25.50, startDate: '2023-06-01' },
  { id: 3, name: 'Carol Davis', type: 'salary', annual: 95000, startDate: '2022-11-10' },
  { id: 4, name: 'David Wilson', type: 'hourly', rate: 32.75, startDate: '2024-01-08' }
];

// 1. Pay Period Calendar
console.log(chalk.blue.bold('\n📅 Bi-Weekly Pay Period Calendar'));
console.log(chalk.gray('─'.repeat(50)));

const payPeriodStart = kairos('2024-01-01'); // First Monday of year
const payPeriods = [];

// Generate 12 bi-weekly pay periods
for (let i = 0; i < 12; i++) {
  const periodStart = payPeriodStart.add(i * 14, 'days');
  const periodEnd = periodStart.add(13, 'days');
  const payDate = periodEnd.add(3, 'days'); // Pay 3 days after period ends
  
  // Ensure pay date is a business day
  const actualPayDate = payDate.isBusinessDay() ? payDate : payDate.nextBusinessDay();
  
  payPeriods.push({
    period: i + 1,
    start: periodStart,
    end: periodEnd,
    scheduledPay: payDate,
    actualPay: actualPayDate,
    businessDays: periodStart.businessDaysBetween(periodEnd.add(1, 'day'))
  });
}

// Display first 6 pay periods
const payData = [['Period', 'Start Date', 'End Date', 'Scheduled Pay', 'Actual Pay', 'Business Days']];

payPeriods.slice(0, 6).forEach(period => {
  const adjustment = period.scheduledPay.isSame(period.actualPay, 'day') ? '' : ' (adjusted)';
  
  payData.push([
    period.period.toString(),
    period.start.format('YYYY-MM-DD'),
    period.end.format('YYYY-MM-DD'),
    period.scheduledPay.format('YYYY-MM-DD'),
    period.actualPay.format('YYYY-MM-DD') + chalk.yellow(adjustment),
    period.businessDays.toString()
  ]);
});

console.log(table(payData));

// 2. Employee Anniversary and Service Time
console.log(chalk.blue.bold('\n🎉 Employee Service Analysis'));
console.log(chalk.gray('─'.repeat(50)));

const today = kairos();
const serviceData = [['Employee', 'Start Date', 'Service Time', 'Next Anniversary', 'Days Until']];

employees.forEach(emp => {
  const startDate = kairos(emp.startDate);
  const serviceDuration = startDate.duration(today);
  const nextAnniversary = startDate.add(Math.ceil(serviceDuration.asYears()), 'years');
  const daysUntil = today.diff(nextAnniversary, 'days');
  
  serviceData.push([
    emp.name,
    startDate.format('YYYY-MM-DD'),
    serviceDuration.humanize(),
    nextAnniversary.format('YYYY-MM-DD'),
    Math.abs(daysUntil).toString()
  ]);
});

console.log(table(serviceData));

// 3. Vacation Accrual Calculator
console.log(chalk.blue.bold('\n🏖️  Vacation Accrual System'));
console.log(chalk.gray('─'.repeat(50)));

function calculateVacationAccrual(employee, asOfDate = kairos()) {
  const startDate = kairos(employee.startDate);
  const yearsOfService = startDate.duration(asOfDate).asYears();
  
  // Vacation policy: 10 days year 1, 15 days years 2-5, 20 days 5+
  let annualDays;
  if (yearsOfService < 1) {
    annualDays = 10;
  } else if (yearsOfService < 5) {
    annualDays = 15;
  } else {
    annualDays = 20;
  }
  
  const monthsWorked = Math.floor(startDate.duration(asOfDate).asMonths());
  const accruedDays = (annualDays / 12) * monthsWorked;
  
  return {
    yearsOfService: yearsOfService.toFixed(1),
    annualEntitlement: annualDays,
    monthsWorked,
    accruedDays: accruedDays.toFixed(1),
    nextAccrualDate: startDate.add(monthsWorked + 1, 'months')
  };
}

const vacationData = [['Employee', 'Years Service', 'Annual Days', 'Accrued', 'Next Accrual']];

employees.forEach(emp => {
  const accrual = calculateVacationAccrual(emp);
  
  vacationData.push([
    emp.name,
    accrual.yearsOfService,
    accrual.annualEntitlement.toString(),
    accrual.accruedDays,
    accrual.nextAccrualDate.format('YYYY-MM-DD')
  ]);
});

console.log(table(vacationData));

// 4. Overtime Calculation (40-hour work week)
console.log(chalk.blue.bold('\n⏰ Overtime Calculation Example'));
console.log(chalk.gray('─'.repeat(50)));

// Sample timesheet data for Bob Smith (hourly employee)
const timesheetWeek = kairos('2024-06-03'); // Monday
const timeEntries = [
  { date: timesheetWeek, hours: 8.5 },
  { date: timesheetWeek.add(1, 'day'), hours: 9.0 },
  { date: timesheetWeek.add(2, 'day'), hours: 8.0 },
  { date: timesheetWeek.add(3, 'day'), hours: 10.5 },
  { date: timesheetWeek.add(4, 'day'), hours: 8.0 },
  { date: timesheetWeek.add(5, 'day'), hours: 4.0 } // Saturday
];

const bobHourlyRate = 25.50;
const overtimeRate = bobHourlyRate * 1.5;

let regularHours = 0;
let overtimeHours = 0;
let totalHours = 0;

const timesheetData = [['Date', 'Day', 'Hours', 'Type', 'Rate', 'Earnings']];

timeEntries.forEach(entry => {
  totalHours += entry.hours;
  
  let regularForDay = 0;
  let overtimeForDay = 0;
  let rate = bobHourlyRate;
  
  if (totalHours <= 40) {
    regularForDay = entry.hours;
    regularHours += entry.hours;
  } else if (totalHours - entry.hours < 40) {
    regularForDay = 40 - (totalHours - entry.hours);
    overtimeForDay = entry.hours - regularForDay;
    regularHours += regularForDay;
    overtimeHours += overtimeForDay;
  } else {
    overtimeForDay = entry.hours;
    overtimeHours += overtimeForDay;
    rate = overtimeRate;
  }
  
  const earnings = (regularForDay * bobHourlyRate) + (overtimeForDay * overtimeRate);
  const type = overtimeForDay > 0 ? `Reg: ${regularForDay}, OT: ${overtimeForDay}` : 'Regular';
  
  timesheetData.push([
    entry.date.format('YYYY-MM-DD'),
    entry.date.format('dddd'),
    entry.hours.toString(),
    type,
    overtimeForDay > 0 ? `$${bobHourlyRate}/$${overtimeRate}` : `$${bobHourlyRate}`,
    `$${earnings.toFixed(2)}`
  ]);
});

const totalRegularPay = regularHours * bobHourlyRate;
const totalOvertimePay = overtimeHours * overtimeRate;
const totalPay = totalRegularPay + totalOvertimePay;

timesheetData.push(['', '', '', '', '', '']);
timesheetData.push(['TOTALS', '', totalHours.toString(), `${regularHours}/${overtimeHours}`, '', `$${totalPay.toFixed(2)}`]);

console.log(table(timesheetData));

// 5. Holiday Pay Calculation
console.log(chalk.blue.bold('\n🎊 Holiday Pay Analysis'));
console.log(chalk.gray('─'.repeat(50)));

const holidayPeriod = kairos('2024-01-01').range(kairos('2024-12-31'));
const holidays2024 = [
  { name: "New Year's Day", date: kairos('2024-01-01') },
  { name: "Martin Luther King Jr. Day", date: kairos('2024-01-15') },
  { name: "Presidents Day", date: kairos('2024-02-19') },
  { name: "Memorial Day", date: kairos('2024-05-27') },
  { name: "Independence Day", date: kairos('2024-07-04') },
  { name: "Labor Day", date: kairos('2024-09-02') },
  { name: "Columbus Day", date: kairos('2024-10-14') },
  { name: "Veterans Day", date: kairos('2024-11-11') },
  { name: "Thanksgiving", date: kairos('2024-11-28') },
  { name: "Christmas Day", date: kairos('2024-12-25') }
];

const holidayData = [['Holiday', 'Date', 'Day of Week', 'Observed', 'Effect on Payroll']];

holidays2024.forEach(holiday => {
  let observed = holiday.date;
  let effect = 'Paid holiday';
  
  if (holiday.date.day() === 6) { // Saturday
    observed = holiday.date.subtract(1, 'day'); // Friday
    effect = 'Observed Friday';
  } else if (holiday.date.day() === 0) { // Sunday
    observed = holiday.date.add(1, 'day'); // Monday
    effect = 'Observed Monday';
  }
  
  holidayData.push([
    holiday.name,
    holiday.date.format('YYYY-MM-DD'),
    holiday.date.format('dddd'),
    observed.format('YYYY-MM-DD'),
    effect
  ]);
});

console.log(table(holidayData));

// 6. Quarterly Bonus Calculation Dates
console.log(chalk.blue.bold('\n💰 Quarterly Bonus Schedule'));
console.log(chalk.gray('─'.repeat(50)));

const quarters = [
  { quarter: 'Q1 2024', end: kairos('2024-03-31'), bonus: 0.03 },
  { quarter: 'Q2 2024', end: kairos('2024-06-30'), bonus: 0.035 },
  { quarter: 'Q3 2024', end: kairos('2024-09-30'), bonus: 0.04 },
  { quarter: 'Q4 2024', end: kairos('2024-12-31'), bonus: 0.045 }
];

const bonusData = [['Quarter', 'Period End', 'Review Period', 'Pay Date', 'Bonus %']];

quarters.forEach(q => {
  // Bonus calculations happen 30 days after quarter end
  const reviewStart = q.end.add(1, 'day');
  const reviewEnd = q.end.add(30, 'days');
  const payDate = reviewEnd.isBusinessDay() ? reviewEnd : reviewEnd.nextBusinessDay();
  
  bonusData.push([
    q.quarter,
    q.end.format('YYYY-MM-DD'),
    `${reviewStart.format('MMM D')} - ${reviewEnd.format('MMM D')}`,
    payDate.format('YYYY-MM-DD dddd'),
    `${(q.bonus * 100).toFixed(1)}%`
  ]);
});

console.log(table(bonusData));

// 7. Performance Metrics
console.log(chalk.blue.bold('\n⚡ Payroll Processing Performance'));
console.log(chalk.gray('─'.repeat(50)));

console.time('Pay period calculations (1000x)');
for (let i = 0; i < 1000; i++) {
  const randomStart = kairos().add(Math.floor(Math.random() * 365) - 180, 'days');
  const periodEnd = randomStart.add(13, 'days');
  const payDate = periodEnd.add(3, 'days').isBusinessDay() ? 
    periodEnd.add(3, 'days') : 
    periodEnd.add(3, 'days').nextBusinessDay();
}
console.timeEnd('Pay period calculations (1000x)');

console.time('Service time calculations (1000x)');
for (let i = 0; i < 1000; i++) {
  const startDate = kairos().subtract(Math.floor(Math.random() * 365 * 5), 'days');
  const duration = startDate.duration(kairos());
  duration.humanize();
}
console.timeEnd('Service time calculations (1000x)');

console.log('\n' + '='.repeat(60));
console.log(chalk.green('✅ Payroll system examples completed successfully!'));
console.log(chalk.gray('Use these patterns for:'));
console.log(chalk.gray('  • Bi-weekly and monthly payroll systems'));
console.log(chalk.gray('  • Employee service time tracking'));
console.log(chalk.gray('  • Vacation accrual calculations'));
console.log(chalk.gray('  • Overtime and holiday pay logic'));
console.log(chalk.gray('  • Bonus and incentive scheduling'));