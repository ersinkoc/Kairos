#!/usr/bin/env node

import kairos from '../index.js';
import chalk from 'chalk';
import { table } from 'table';
import fs from 'fs';

console.log(chalk.green.bold('📊 Report Generator Examples\n'));
console.log('='.repeat(60));

// Mock data generators
function generateSalesData(startDate, endDate) {
  const sales = [];
  const range = kairos(startDate).range(kairos(endDate));
  const dates = range.toArray();
  
  dates.forEach(date => {
    const kDate = kairos(date);
    // Higher sales on business days, lower on weekends, none on holidays
    let baseSales = 0;
    
    if (kDate.isHoliday()) {
      baseSales = 0;
    } else if (kDate.isWeekend()) {
      baseSales = Math.random() * 5000 + 2000;
    } else {
      baseSales = Math.random() * 15000 + 8000;
    }
    
    sales.push({
      date: kDate,
      amount: Math.round(baseSales * 100) / 100,
      dayType: kDate.isHoliday() ? 'Holiday' : 
               kDate.isWeekend() ? 'Weekend' : 'Business Day'
    });
  });
  
  return sales;
}

// 1. Monthly Sales Report
console.log(chalk.blue.bold('\n📈 Monthly Sales Report - June 2024'));
console.log(chalk.gray('─'.repeat(60)));

const juneStart = kairos('2024-06-01');
const juneEnd = kairos('2024-06-30');
const juneSales = generateSalesData(juneStart, juneEnd);

// Weekly breakdown
const weeklyData = [['Week', 'Date Range', 'Business Days', 'Sales', 'Avg/Day']];
const weeks = [];

for (let i = 0; i < 5; i++) {
  const weekStart = juneStart.add(i * 7, 'days').startOf('week');
  const weekEnd = weekStart.add(6, 'days');
  
  // Ensure we don't go past June
  const actualEnd = weekEnd.isAfter(juneEnd) ? juneEnd : weekEnd;
  
  const weekSales = juneSales.filter(sale => 
    sale.date.isBetween(weekStart, actualEnd, null, '[]')
  );
  
  const totalSales = weekSales.reduce((sum, sale) => sum + sale.amount, 0);
  const businessDays = weekSales.filter(sale => sale.dayType === 'Business Day').length;
  const avgPerDay = businessDays > 0 ? totalSales / businessDays : 0;
  
  weeklyData.push([
    `Week ${i + 1}`,
    `${weekStart.format('MMM D')} - ${actualEnd.format('MMM D')}`,
    businessDays.toString(),
    `$${totalSales.toLocaleString('en-US', { maximumFractionDigits: 0 })}`,
    `$${avgPerDay.toLocaleString('en-US', { maximumFractionDigits: 0 })}`
  ]);
}

console.log(table(weeklyData));

// Monthly summary
const totalSales = juneSales.reduce((sum, sale) => sum + sale.amount, 0);
const businessDaySales = juneSales.filter(sale => sale.dayType === 'Business Day');
const businessDayTotal = businessDaySales.reduce((sum, sale) => sum + sale.amount, 0);
const businessDayCount = businessDaySales.length;

const summaryData = [
  ['Metric', 'Value'],
  ['Total Sales', `$${totalSales.toLocaleString('en-US', { maximumFractionDigits: 0 })}`],
  ['Business Day Sales', `$${businessDayTotal.toLocaleString('en-US', { maximumFractionDigits: 0 })}`],
  ['Weekend Sales', `$${(totalSales - businessDayTotal).toLocaleString('en-US', { maximumFractionDigits: 0 })}`],
  ['Business Days', businessDayCount.toString()],
  ['Average per Business Day', `$${(businessDayTotal / businessDayCount).toLocaleString('en-US', { maximumFractionDigits: 0 })}`],
  ['Best Day', businessDaySales.reduce((best, sale) => sale.amount > best.amount ? sale : best).date.format('YYYY-MM-DD dddd')],
  ['Worst Day', businessDaySales.reduce((worst, sale) => sale.amount < worst.amount ? sale : worst).date.format('YYYY-MM-DD dddd')]
];

console.log('\nMonthly Summary:');
console.log(table(summaryData));

// 2. Quarterly Business Analysis
console.log(chalk.blue.bold('\n📊 Q2 2024 Business Analysis'));
console.log(chalk.gray('─'.repeat(60)));

const q2Start = kairos('2024-04-01');
const q2End = kairos('2024-06-30');
const q2Range = q2Start.range(q2End);

const monthlyAnalysis = [['Month', 'Business Days', 'Weekend Days', 'Holidays', 'Total Days', 'Workday %']];

[4, 5, 6].forEach(month => {
  const monthStart = kairos(`2024-${month.toString().padStart(2, '0')}-01`);
  const monthEnd = monthStart.endOf('month');
  const monthRange = monthStart.range(monthEnd);
  
  const businessDays = monthRange.businessDays();
  const weekends = monthRange.weekends();
  const allDates = monthRange.toArray();
  const holidays = allDates.length - businessDays.length - weekends.length;
  const workdayPercentage = ((businessDays.length / allDates.length) * 100).toFixed(1);
  
  monthlyAnalysis.push([
    monthStart.format('MMMM'),
    businessDays.length.toString(),
    weekends.length.toString(),
    holidays.toString(),
    allDates.length.toString(),
    `${workdayPercentage}%`
  ]);
});

console.log(table(monthlyAnalysis));

// 3. Employee Attendance Report
console.log(chalk.blue.bold('\n👥 Employee Attendance Analysis'));
console.log(chalk.gray('─'.repeat(60)));

const employees = [
  { name: 'Alice Johnson', hireDate: '2023-01-15', vacationDays: 2.5 },
  { name: 'Bob Smith', hireDate: '2023-06-01', vacationDays: 1.5 },
  { name: 'Carol Davis', hireDate: '2022-03-10', vacationDays: 3.0 },
  { name: 'David Wilson', hireDate: '2024-01-08', vacationDays: 0.5 }
];

const attendanceMonth = kairos('2024-06-01');
const attendanceData = [['Employee', 'Hire Date', 'Tenure', 'Work Days', 'Vacation', 'Attendance %']];

employees.forEach(emp => {
  const hireDate = kairos(emp.hireDate);
  const tenure = hireDate.duration(kairos()).humanize();
  
  // Calculate work days in June (excluding weekends and holidays)
  const monthBusinessDays = attendanceMonth.businessDaysInMonth();
  const vacationDays = emp.vacationDays;
  const workDays = monthBusinessDays - vacationDays;
  const attendanceRate = ((workDays / monthBusinessDays) * 100).toFixed(1);
  
  attendanceData.push([
    emp.name,
    hireDate.format('YYYY-MM-DD'),
    tenure,
    workDays.toString(),
    vacationDays.toString(),
    `${attendanceRate}%`
  ]);
});

console.log(table(attendanceData));

// 4. Project Timeline Report
console.log(chalk.blue.bold('\n🚀 Project Timeline Analysis'));
console.log(chalk.gray('─'.repeat(60)));

const projects = [
  {
    name: 'Website Redesign',
    start: '2024-05-01',
    plannedEnd: '2024-07-15',
    actualEnd: null, // Ongoing
    businessDaysPlanned: 53
  },
  {
    name: 'Mobile App Beta',
    start: '2024-03-15',
    plannedEnd: '2024-06-01',
    actualEnd: '2024-06-05',
    businessDaysPlanned: 56
  },
  {
    name: 'Database Migration',
    start: '2024-06-10',
    plannedEnd: '2024-08-30',
    actualEnd: null,
    businessDaysPlanned: 60
  }
];

const projectData = [['Project', 'Start', 'Planned End', 'Actual End', 'Status', 'Business Days', 'Variance']];

projects.forEach(project => {
  const startDate = kairos(project.start);
  const plannedEnd = kairos(project.plannedEnd);
  const actualEnd = project.actualEnd ? kairos(project.actualEnd) : null;
  const today = kairos();
  
  let status, businessDaysUsed, variance;
  
  if (actualEnd) {
    status = actualEnd.isAfter(plannedEnd) ? 'Late' : 
             actualEnd.isBefore(plannedEnd) ? 'Early' : 'On Time';
    businessDaysUsed = startDate.businessDaysBetween(actualEnd);
    variance = businessDaysUsed - project.businessDaysPlanned;
  } else if (today.isAfter(plannedEnd)) {
    status = 'Overdue';
    businessDaysUsed = startDate.businessDaysBetween(today);
    variance = businessDaysUsed - project.businessDaysPlanned;
  } else {
    status = 'In Progress';
    businessDaysUsed = startDate.businessDaysBetween(today);
    const remainingPlanned = project.businessDaysPlanned - businessDaysUsed;
    variance = `${remainingPlanned} days remaining`;
  }
  
  const varianceStr = typeof variance === 'number' ? 
    `${variance > 0 ? '+' : ''}${variance} days` : variance;
  
  projectData.push([
    project.name,
    startDate.format('YYYY-MM-DD'),
    plannedEnd.format('YYYY-MM-DD'),
    actualEnd ? actualEnd.format('YYYY-MM-DD') : 'Ongoing',
    status,
    businessDaysUsed.toString(),
    varianceStr
  ]);
});

console.log(table(projectData));

// 5. Financial Quarter Report
console.log(chalk.blue.bold('\n💰 Financial Quarter Summary'));
console.log(chalk.gray('─'.repeat(60)));

const quarters = [
  { name: 'Q1 2024', start: '2024-01-01', end: '2024-03-31' },
  { name: 'Q2 2024', start: '2024-04-01', end: '2024-06-30' },
  { name: 'Q3 2024', start: '2024-07-01', end: '2024-09-30' },
  { name: 'Q4 2024', start: '2024-10-01', end: '2024-12-31' }
];

const financialData = [['Quarter', 'Date Range', 'Business Days', 'Revenue Days', 'Settlement Days']];

quarters.forEach(quarter => {
  const startDate = kairos(quarter.start);
  const endDate = kairos(quarter.end);
  const range = startDate.range(endDate);
  
  const businessDays = range.businessDays();
  const revenueDays = businessDays.length; // All business days count for revenue
  
  // Settlement days exclude last 3 business days of quarter
  const settlementDays = Math.max(0, businessDays.length - 3);
  
  financialData.push([
    quarter.name,
    `${startDate.format('MMM D')} - ${endDate.format('MMM D')}`,
    businessDays.length.toString(),
    revenueDays.toString(),
    settlementDays.toString()
  ]);
});

console.log(table(financialData));

// 6. Holiday Impact Analysis
console.log(chalk.blue.bold('\n🎊 Holiday Impact on Operations'));
console.log(chalk.gray('─'.repeat(60)));

const holidayYear = 2024;
const yearStart = kairos(`${holidayYear}-01-01`);
const yearEnd = kairos(`${holidayYear}-12-31`);
const yearRange = yearStart.range(yearEnd);

// Find all holidays
const holidays = [];
const allDates = yearRange.toArray();

allDates.forEach(date => {
  const kDate = kairos(date);
  if (kDate.isHoliday()) {
    const holiday = kDate.getHoliday();
    holidays.push({
      date: kDate,
      name: holiday?.name,
      dayOfWeek: kDate.format('dddd'),
      quarter: kDate.quarter()
    });
  }
});

const holidayImpactData = [['Holiday', 'Date', 'Day', 'Quarter', 'Business Impact', 'Next Business Day']];

holidays.forEach(holiday => {
  let impact = 'Normal';
  
  // Monday holidays have higher impact
  if (holiday.dayOfWeek === 'Monday') {
    impact = 'High (3-day weekend)';
  } else if (holiday.dayOfWeek === 'Friday') {
    impact = 'Medium (3-day weekend)';
  } else if (['Tuesday', 'Wednesday', 'Thursday'].includes(holiday.dayOfWeek)) {
    impact = 'Low (mid-week)';
  } else {
    impact = 'Minimal (weekend)';
  }
  
  const nextBusinessDay = holiday.date.nextBusinessDay();
  
  holidayImpactData.push([
    holiday.name,
    holiday.date.format('YYYY-MM-DD'),
    holiday.dayOfWeek,
    `Q${holiday.quarter}`,
    impact,
    nextBusinessDay.format('YYYY-MM-DD dddd')
  ]);
});

console.log(table(holidayImpactData));

// 7. Export to CSV Function
console.log(chalk.blue.bold('\n💾 Report Export Example'));
console.log(chalk.gray('─'.repeat(60)));

function exportToCSV(data, filename) {
  const csvContent = data.map(row => 
    row.map(cell => `"${cell}"`).join(',')
  ).join('\\n');
  
  // In a real application, you'd write to file:
  // fs.writeFileSync(filename, csvContent);
  
  console.log(`CSV export simulated for ${filename}`);
  console.log(`Rows: ${data.length}, Columns: ${data[0]?.length || 0}`);
  return csvContent.length;
}

const exportSizes = [
  exportToCSV(weeklyData, 'monthly-sales-report.csv'),
  exportToCSV(monthlyAnalysis, 'quarterly-analysis.csv'),
  exportToCSV(attendanceData, 'employee-attendance.csv'),
  exportToCSV(projectData, 'project-timeline.csv'),
  exportToCSV(holidayImpactData, 'holiday-impact.csv')
];

const exportData = [['Report', 'Filename', 'Size (chars)', 'Status']];
const reportNames = ['Monthly Sales', 'Quarterly Analysis', 'Employee Attendance', 'Project Timeline', 'Holiday Impact'];
const fileNames = ['monthly-sales-report.csv', 'quarterly-analysis.csv', 'employee-attendance.csv', 'project-timeline.csv', 'holiday-impact.csv'];

exportSizes.forEach((size, index) => {
  exportData.push([
    reportNames[index],
    fileNames[index],
    size.toString(),
    chalk.green('Generated')
  ]);
});

console.log(table(exportData));

// 8. Performance Metrics
console.log(chalk.blue.bold('\n⚡ Report Generation Performance'));
console.log(chalk.gray('─'.repeat(60)));

console.time('Sales data generation (365 days)');
const yearSales = generateSalesData(kairos('2024-01-01'), kairos('2024-12-31'));
console.timeEnd('Sales data generation (365 days)');

console.time('Business day calculations (1000x)');
for (let i = 0; i < 1000; i++) {
  const randomDate = kairos().add(Math.floor(Math.random() * 365) - 180, 'days');
  randomDate.businessDaysInMonth();
}
console.timeEnd('Business day calculations (1000x)');

console.time('Date range analysis (100x)');
for (let i = 0; i < 100; i++) {
  const start = kairos().subtract(30, 'days');
  const end = kairos();
  const range = start.range(end);
  range.businessDays().length;
  range.weekends().length;
}
console.timeEnd('Date range analysis (100x)');

console.log('\n' + '='.repeat(60));
console.log(chalk.green('✅ Report generation examples completed successfully!'));
console.log(chalk.gray('Use these patterns for:'));
console.log(chalk.gray('  • Sales and revenue reporting'));
console.log(chalk.gray('  • Employee attendance tracking'));
console.log(chalk.gray('  • Project timeline analysis'));
console.log(chalk.gray('  • Financial quarter summaries'));
console.log(chalk.gray('  • Holiday impact assessments'));
console.log(chalk.gray('  • CSV/Excel export functionality'));