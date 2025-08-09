#!/usr/bin/env node

import kairos from '../index.js';
import chalk from 'chalk';
import { table } from 'table';

console.log(chalk.magenta.bold('⏰ Task Scheduler Examples\n'));
console.log('='.repeat(60));

// Mock task definitions
const taskTemplates = [
  {
    id: 'backup-db',
    name: 'Database Backup',
    schedule: 'daily',
    time: '02:00',
    skipWeekends: false,
    skipHolidays: true
  },
  {
    id: 'send-reports',
    name: 'Weekly Sales Report',
    schedule: 'weekly',
    dayOfWeek: 1, // Monday
    time: '09:00',
    skipWeekends: false,
    skipHolidays: true
  },
  {
    id: 'monthly-invoice',
    name: 'Monthly Invoicing',
    schedule: 'monthly',
    dayOfMonth: -1, // Last day of month
    time: '16:00',
    skipWeekends: true,
    skipHolidays: true
  },
  {
    id: 'quarterly-review',
    name: 'Quarterly Business Review',
    schedule: 'quarterly',
    dayOfMonth: 15, // 15th of quarter end month
    time: '10:00',
    skipWeekends: true,
    skipHolidays: true
  }
];

// 1. Next Execution Calculator
console.log(chalk.blue.bold('\n📋 Next Task Execution Schedule'));
console.log(chalk.gray('─'.repeat(60)));

function calculateNextExecution(task, fromDate = kairos()) {
  let nextRun = fromDate.clone();
  
  switch (task.schedule) {
    case 'daily':
      nextRun = nextRun.add(1, 'day').startOf('day')
        .hour(parseInt(task.time.split(':')[0]))
        .minute(parseInt(task.time.split(':')[1]));
      break;
      
    case 'weekly':
      // Find next occurrence of specified day of week
      const targetDay = task.dayOfWeek;
      const currentDay = nextRun.day();
      const daysUntilTarget = (targetDay - currentDay + 7) % 7 || 7;
      
      nextRun = nextRun.add(daysUntilTarget, 'days').startOf('day')
        .hour(parseInt(task.time.split(':')[0]))
        .minute(parseInt(task.time.split(':')[1]));
      break;
      
    case 'monthly':
      if (task.dayOfMonth === -1) {
        // Last day of month
        nextRun = nextRun.add(1, 'month').endOf('month').startOf('day')
          .hour(parseInt(task.time.split(':')[0]))
          .minute(parseInt(task.time.split(':')[1]));
      } else {
        nextRun = nextRun.add(1, 'month').date(task.dayOfMonth).startOf('day')
          .hour(parseInt(task.time.split(':')[0]))
          .minute(parseInt(task.time.split(':')[1]));
      }
      break;
      
    case 'quarterly':
      // Move to next quarter end month + specified day
      const nextQuarterEndMonth = Math.ceil((nextRun.month() + 1) / 3) * 3;
      nextRun = nextRun.month(nextQuarterEndMonth).date(task.dayOfMonth).startOf('day')
        .hour(parseInt(task.time.split(':')[0]))
        .minute(parseInt(task.time.split(':')[1]));
      break;
  }
  
  // Apply business rules
  if (task.skipWeekends && nextRun.isWeekend()) {
    nextRun = nextRun.nextBusinessDay().hour(parseInt(task.time.split(':')[0]))
      .minute(parseInt(task.time.split(':')[1]));
  }
  
  if (task.skipHolidays && nextRun.isHoliday()) {
    nextRun = nextRun.nextBusinessDay().hour(parseInt(task.time.split(':')[0]))
      .minute(parseInt(task.time.split(':')[1]));
  }
  
  return nextRun;
}

const scheduleData = [['Task Name', 'Schedule', 'Next Run', 'Day', 'Days Away', 'Skip Rules']];

taskTemplates.forEach(task => {
  const nextRun = calculateNextExecution(task);
  const daysAway = kairos().diff(nextRun, 'days');
  const skipRules = [
    task.skipWeekends ? 'Weekends' : null,
    task.skipHolidays ? 'Holidays' : null
  ].filter(Boolean).join(', ') || 'None';
  
  scheduleData.push([
    task.name,
    task.schedule,
    nextRun.format('YYYY-MM-DD HH:mm'),
    nextRun.format('dddd'),
    Math.abs(daysAway).toString(),
    skipRules
  ]);
});

console.log(table(scheduleData));

// 2. Cron Expression Generator
console.log(chalk.blue.bold('\n🔧 Cron Expression Generator'));
console.log(chalk.gray('─'.repeat(60)));

function generateCronExpression(task) {
  const [hour, minute] = task.time.split(':').map(Number);
  
  switch (task.schedule) {
    case 'daily':
      return `${minute} ${hour} * * *`;
    case 'weekly':
      return `${minute} ${hour} * * ${task.dayOfWeek}`;
    case 'monthly':
      if (task.dayOfMonth === -1) {
        return `${minute} ${hour} 28-31 * *`; // Approximate for last day
      }
      return `${minute} ${hour} ${task.dayOfMonth} * *`;
    case 'quarterly':
      return `${minute} ${hour} ${task.dayOfMonth} 3,6,9,12 *`;
    default:
      return 'Custom schedule';
  }
}

const cronData = [['Task', 'Schedule Type', 'Time', 'Cron Expression', 'Description']];

taskTemplates.forEach(task => {
  const cron = generateCronExpression(task);
  let description = `${task.schedule} at ${task.time}`;
  
  if (task.schedule === 'weekly') {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    description += ` on ${days[task.dayOfWeek]}`;
  } else if (task.schedule === 'monthly') {
    description += task.dayOfMonth === -1 ? ' on last day' : ` on day ${task.dayOfMonth}`;
  }
  
  cronData.push([
    task.name,
    task.schedule,
    task.time,
    cron,
    description
  ]);
});

console.log(table(cronData));

// 3. Task Execution History Simulation
console.log(chalk.blue.bold('\n📊 Task Execution History (Last 30 Days)'));
console.log(chalk.gray('─'.repeat(60)));

function simulateTaskHistory(task, days = 30) {
  const executions = [];
  const endDate = kairos();
  const startDate = endDate.subtract(days, 'days');
  
  let currentDate = startDate.clone();
  
  while (currentDate.isBefore(endDate)) {
    let shouldRun = false;
    
    switch (task.schedule) {
      case 'daily':
        shouldRun = true;
        break;
      case 'weekly':
        shouldRun = currentDate.day() === task.dayOfWeek;
        break;
      case 'monthly':
        if (task.dayOfMonth === -1) {
          shouldRun = currentDate.isSame(currentDate.endOf('month'), 'day');
        } else {
          shouldRun = currentDate.date() === task.dayOfMonth;
        }
        break;
      case 'quarterly':
        const isQuarterEndMonth = [3, 6, 9, 12].includes(currentDate.month());
        shouldRun = isQuarterEndMonth && currentDate.date() === task.dayOfMonth;
        break;
    }
    
    if (shouldRun) {
      let actualRun = currentDate.clone()
        .hour(parseInt(task.time.split(':')[0]))
        .minute(parseInt(task.time.split(':')[1]));
      
      let status = 'executed';
      let reason = '';
      
      // Check skip conditions
      if (task.skipWeekends && actualRun.isWeekend()) {
        actualRun = actualRun.nextBusinessDay()
          .hour(parseInt(task.time.split(':')[0]))
          .minute(parseInt(task.time.split(':')[1]));
        status = 'rescheduled';
        reason = 'weekend';
      }
      
      if (task.skipHolidays && actualRun.isHoliday()) {
        actualRun = actualRun.nextBusinessDay()
          .hour(parseInt(task.time.split(':')[0]))
          .minute(parseInt(task.time.split(':')[1]));
        status = 'rescheduled';
        reason = reason ? `${reason}, holiday` : 'holiday';
      }
      
      executions.push({
        scheduled: currentDate.clone(),
        actual: actualRun,
        status,
        reason
      });
    }
    
    currentDate = currentDate.add(1, 'day');
  }
  
  return executions;
}

// Show history for database backup task
const backupTask = taskTemplates.find(t => t.id === 'backup-db');
const backupHistory = simulateTaskHistory(backupTask, 14); // Last 2 weeks

const historyData = [['Date', 'Scheduled', 'Actual', 'Status', 'Reason']];

backupHistory.slice(-10).forEach(execution => {
  const delayHours = execution.actual.diff(execution.scheduled, 'hours');
  const delay = delayHours > 0 ? ` (+${delayHours}h)` : '';
  
  historyData.push([
    execution.scheduled.format('YYYY-MM-DD'),
    execution.scheduled.format('HH:mm'),
    execution.actual.format('HH:mm') + chalk.yellow(delay),
    execution.status === 'executed' ? chalk.green(execution.status) : chalk.yellow(execution.status),
    execution.reason || 'none'
  ]);
});

console.log(`Database Backup Task History:`);
console.log(table(historyData));

// 4. Workload Distribution Analysis
console.log(chalk.blue.bold('\n📈 Task Workload Distribution'));
console.log(chalk.gray('─'.repeat(60)));

// Simulate all tasks for next 7 days
const workloadData = [['Date', 'Day', 'Tasks', 'Task Names']];
const today = kairos();

for (let i = 0; i < 7; i++) {
  const checkDate = today.add(i, 'days');
  const tasksOnDate = [];
  
  taskTemplates.forEach(task => {
    const nextRun = calculateNextExecution(task, checkDate.subtract(1, 'day'));
    
    if (nextRun.isSame(checkDate, 'day')) {
      tasksOnDate.push(`${task.name} (${nextRun.format('HH:mm')})`);
    }
  });
  
  const isWeekend = checkDate.isWeekend();
  const isHoliday = checkDate.isHoliday();
  
  let dayType = checkDate.format('dddd');
  if (isHoliday) {
    dayType += ' (Holiday)';
  } else if (isWeekend) {
    dayType += ' (Weekend)';
  }
  
  workloadData.push([
    checkDate.format('YYYY-MM-DD'),
    dayType,
    tasksOnDate.length.toString(),
    tasksOnDate.length > 0 ? tasksOnDate.join(', ') : 'None'
  ]);
}

console.log(table(workloadData));

// 5. SLA and Deadline Tracking
console.log(chalk.blue.bold('\n⏱️  SLA and Deadline Tracking'));
console.log(chalk.gray('─'.repeat(60)));

const slaRequirements = [
  { task: 'backup-db', maxDelay: 2, unit: 'hours', critical: true },
  { task: 'send-reports', maxDelay: 1, unit: 'day', critical: false },
  { task: 'monthly-invoice', maxDelay: 1, unit: 'day', critical: true },
  { task: 'quarterly-review', maxDelay: 3, unit: 'days', critical: false }
];

const slaData = [['Task', 'Max Delay', 'Criticality', 'Next Due', 'SLA Deadline', 'Buffer']];

slaRequirements.forEach(sla => {
  const task = taskTemplates.find(t => t.id === sla.task);
  const nextRun = calculateNextExecution(task);
  const slaDeadline = nextRun.add(sla.maxDelay, sla.unit);
  const buffer = kairos().diff(slaDeadline, 'hours');
  
  slaData.push([
    task.name,
    `${sla.maxDelay} ${sla.unit}`,
    sla.critical ? chalk.red('Critical') : chalk.yellow('Standard'),
    nextRun.format('YYYY-MM-DD HH:mm'),
    slaDeadline.format('YYYY-MM-DD HH:mm'),
    buffer > 0 ? chalk.red(`-${Math.abs(buffer)}h`) : chalk.green(`+${Math.abs(buffer)}h`)
  ]);
});

console.log(table(slaData));

// 6. Performance Monitoring
console.log(chalk.blue.bold('\n⚡ Scheduler Performance Metrics'));
console.log(chalk.gray('─'.repeat(60)));

console.time('Next execution calculations (1000x)');
for (let i = 0; i < 1000; i++) {
  const randomTask = taskTemplates[Math.floor(Math.random() * taskTemplates.length)];
  calculateNextExecution(randomTask);
}
console.timeEnd('Next execution calculations (1000x)');

console.time('Task history simulation (100x)');
for (let i = 0; i < 100; i++) {
  const randomTask = taskTemplates[Math.floor(Math.random() * taskTemplates.length)];
  simulateTaskHistory(randomTask, 7);
}
console.timeEnd('Task history simulation (100x)');

console.log('\n' + '='.repeat(60));
console.log(chalk.green('✅ Task scheduler examples completed successfully!'));
console.log(chalk.gray('Use these patterns for:'));
console.log(chalk.gray('  • Cron job scheduling systems'));
console.log(chalk.gray('  • Business process automation'));
console.log(chalk.gray('  • Report generation scheduling'));
console.log(chalk.gray('  • Backup and maintenance tasks'));
console.log(chalk.gray('  • SLA and deadline tracking'));