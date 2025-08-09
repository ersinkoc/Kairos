#!/usr/bin/env node

import kairos from '../index.js';
import chalk from 'chalk';
import { table } from 'table';

console.log(chalk.green.bold('💰 Financial Calculator Examples\n'));
console.log('='.repeat(60));

// 1. Loan Payment Schedule
console.log(chalk.blue.bold('\n📊 Loan Payment Schedule'));
console.log(chalk.gray('─'.repeat(40)));

const loanAmount = 100000;
const annualRate = 0.045; // 4.5%
const termYears = 5;
const monthlyPayment = 1863.41; // Pre-calculated PMT

const loanStart = kairos('2024-01-15');
const payments = [];

// Generate payment schedule
for (let i = 0; i < termYears * 12; i++) {
  const paymentDate = loanStart.add(i, 'months');
  const businessDay = paymentDate.isBusinessDay() ? paymentDate : paymentDate.nextBusinessDay();
  
  payments.push({
    payment: i + 1,
    scheduledDate: paymentDate.format('YYYY-MM-DD'),
    businessDate: businessDay.format('YYYY-MM-DD'),
    daysDiff: businessDay.diff(paymentDate, 'days')
  });
}

// Show first and last few payments
const samplePayments = [...payments.slice(0, 3), '...', ...payments.slice(-3)];
const paymentData = [['Payment #', 'Scheduled', 'Business Day', 'Adjustment']];

samplePayments.forEach(payment => {
  if (payment === '...') {
    paymentData.push(['...', '...', '...', '...']);
  } else {
    paymentData.push([
      payment.payment.toString(),
      payment.scheduledDate,
      payment.businessDate,
      payment.daysDiff === 0 ? 'None' : `+${payment.daysDiff} days`
    ]);
  }
});

console.log(table(paymentData));
console.log(`Total adjustments needed: ${payments.filter(p => p.daysDiff > 0).length} payments`);

// 2. Bond Settlement Analysis
console.log(chalk.blue.bold('\n📈 Bond Settlement Analysis'));
console.log(chalk.gray('─'.repeat(40)));

const bonds = [
  { name: 'US Treasury 10Y', tradeDate: '2024-06-14', settlement: 'T+1' },
  { name: 'Corporate Bond', tradeDate: '2024-06-14', settlement: 'T+3' },
  { name: 'Municipal Bond', tradeDate: '2024-06-17', settlement: 'T+2' },
  { name: 'International Bond', tradeDate: '2024-06-18', settlement: 'T+3' }
];

const bondData = [['Bond Type', 'Trade Date', 'Trade Day', 'Settlement', 'Settlement Date', 'Settlement Day']];

bonds.forEach(bond => {
  const tradeDate = kairos(bond.tradeDate);
  const settlementDays = parseInt(bond.settlement.replace('T+', ''));
  const settlementDate = tradeDate.settlementDate(settlementDays);
  
  bondData.push([
    bond.name,
    bond.tradeDate,
    tradeDate.format('dddd'),
    bond.settlement,
    settlementDate.format('YYYY-MM-DD'),
    settlementDate.format('dddd')
  ]);
});

console.log(table(bondData));

// 3. Interest Accrual Calculator
console.log(chalk.blue.bold('\n💵 Interest Accrual Calculator'));
console.log(chalk.gray('─'.repeat(40)));

const principal = 50000;
const dailyRate = 0.0001; // 3.65% annual / 365 days
const startDate = kairos('2024-01-01');
const endDate = kairos('2024-06-30');

// Calculate business day count for interest accrual
const businessDaysBetween = startDate.businessDaysBetween(endDate);
const totalDays = Math.abs(startDate.diff(endDate, 'days'));
const interestBusinessDays = principal * dailyRate * businessDaysBetween;
const interestAllDays = principal * dailyRate * totalDays;

const interestData = [
  ['Method', 'Days', 'Interest Earned'],
  ['Business Days Only', businessDaysBetween.toString(), `$${interestBusinessDays.toFixed(2)}`],
  ['All Calendar Days', totalDays.toString(), `$${interestAllDays.toFixed(2)}`],
  ['Difference', '', `$${(interestAllDays - interestBusinessDays).toFixed(2)}`]
];

console.log(table(interestData));

// 4. Dividend Payment Schedule
console.log(chalk.blue.bold('\n💎 Dividend Payment Schedule'));
console.log(chalk.gray('─'.repeat(40)));

const dividendSchedule = [
  { quarter: 'Q1 2024', exDate: '2024-03-15', recordDate: '2024-03-18', payDate: '2024-04-01' },
  { quarter: 'Q2 2024', exDate: '2024-06-14', recordDate: '2024-06-17', payDate: '2024-07-01' },
  { quarter: 'Q3 2024', exDate: '2024-09-13', recordDate: '2024-09-16', payDate: '2024-10-01' },
  { quarter: 'Q4 2024', exDate: '2024-12-13', recordDate: '2024-12-16', payDate: '2025-01-01' }
];

const divData = [['Quarter', 'Ex-Date', 'Ex-Day', 'Record Date', 'Pay Date', 'Pay Day']];

dividendSchedule.forEach(div => {
  const exDate = kairos(div.exDate);
  const payDate = kairos(div.payDate);
  
  divData.push([
    div.quarter,
    div.exDate,
    exDate.format('dddd'),
    div.recordDate,
    div.payDate,
    payDate.format('dddd')
  ]);
});

console.log(table(divData));

// 5. Options Expiration Calendar
console.log(chalk.blue.bold('\n📅 Options Expiration Analysis'));
console.log(chalk.gray('─'.repeat(40)));

// Third Friday of each month (standard equity options)
const expirationMonths = [1, 2, 3, 4, 5, 6];
const optionsData = [['Month', 'Third Friday', 'Is Holiday?', 'Actual Expiration', 'Days to Expiry']];

const today = kairos();

expirationMonths.forEach(month => {
  const firstOfMonth = kairos(`2024-${month.toString().padStart(2, '0')}-01`);
  const thirdFriday = firstOfMonth.nthWeekdayOfMonth(3, 5); // 3rd Friday (5 = Friday)
  
  // If third Friday is a holiday, move to Thursday
  let actualExpiration = thirdFriday;
  if (thirdFriday.isHoliday()) {
    actualExpiration = thirdFriday.subtract(1, 'day');
  }
  
  const daysToExpiry = today.diff(actualExpiration, 'days');
  
  optionsData.push([
    firstOfMonth.format('MMMM'),
    thirdFriday.format('YYYY-MM-DD'),
    thirdFriday.isHoliday() ? 'Yes' : 'No',
    actualExpiration.format('YYYY-MM-DD'),
    daysToExpiry > 0 ? 'Expired' : Math.abs(daysToExpiry).toString()
  ]);
});

console.log(table(optionsData));

// 6. Currency Settlement Windows
console.log(chalk.blue.bold('\n🌍 FX Settlement Windows'));
console.log(chalk.gray('─'.repeat(40)));

const fxTrades = [
  { pair: 'USD/EUR', tradeTime: '2024-06-14T09:00:00', spot: true },
  { pair: 'GBP/JPY', tradeTime: '2024-06-14T15:30:00', spot: true },
  { pair: 'AUD/CAD', tradeTime: '2024-06-14T22:00:00', spot: true },
  { pair: 'USD/CHF', tradeTime: '2024-06-17T10:15:00', spot: false } // Forward
];

const fxData = [['Currency Pair', 'Trade Time', 'Type', 'Value Date', 'Settlement Day']];

fxTrades.forEach(trade => {
  const tradeTime = kairos(trade.tradeTime);
  const valueDate = trade.spot ? tradeTime.addBusinessDays(2) : tradeTime.addBusinessDays(3);
  
  fxData.push([
    trade.pair,
    tradeTime.format('YYYY-MM-DD HH:mm'),
    trade.spot ? 'Spot' : 'Forward',
    valueDate.format('YYYY-MM-DD'),
    valueDate.format('dddd')
  ]);
});

console.log(table(fxData));

// 7. Performance Benchmark
console.log(chalk.blue.bold('\n⚡ Financial Calculations Performance'));
console.log(chalk.gray('─'.repeat(40)));

console.time('Settlement date calculations (1000x)');
for (let i = 0; i < 1000; i++) {
  const randomDate = kairos().add(Math.floor(Math.random() * 365) - 180, 'days');
  randomDate.settlementDate(1);
  randomDate.settlementDate(3);
}
console.timeEnd('Settlement date calculations (1000x)');

console.time('Business day counting (1000x)');
for (let i = 0; i < 1000; i++) {
  const start = kairos().add(Math.floor(Math.random() * 365) - 180, 'days');
  const end = start.add(30, 'days');
  start.businessDaysBetween(end);
}
console.timeEnd('Business day counting (1000x)');

console.log('\n' + '='.repeat(60));
console.log(chalk.green('✅ Financial calculations completed successfully!'));
console.log(chalk.gray('Use these patterns for:'));
console.log(chalk.gray('  • Loan and mortgage systems'));
console.log(chalk.gray('  • Trading and settlement platforms'));
console.log(chalk.gray('  • Interest accrual calculations'));
console.log(chalk.gray('  • Dividend and options systems'));
console.log(chalk.gray('  • FX and currency platforms'));