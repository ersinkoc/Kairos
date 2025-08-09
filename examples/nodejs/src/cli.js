#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { table } from 'table';
import kairos from './index.js';

const program = new Command();

program
  .name('kairos-cli')
  .description('Kairos Date Library CLI Examples')
  .version('1.0.0');

// Business days command
program
  .command('business')
  .description('Business day calculations')
  .option('-d, --date <date>', 'Date to analyze (YYYY-MM-DD)', kairos().format('YYYY-MM-DD'))
  .option('-c, --count <number>', 'Number of business days to add', '5')
  .action((options) => {
    const date = kairos(options.date);
    const count = parseInt(options.count);
    
    console.log(chalk.blue.bold('\n💼 Business Day Analysis'));
    console.log(chalk.gray('─'.repeat(40)));
    
    const isBusinessDay = date.isBusinessDay();
    const dayType = isBusinessDay ? 'Business Day' : 
                   date.isWeekend() ? 'Weekend' : 'Holiday';
    
    const data = [
      ['Property', 'Value'],
      ['Date', date.format('dddd, MMMM Do, YYYY')],
      ['Type', isBusinessDay ? chalk.green(dayType) : 
               date.isWeekend() ? chalk.yellow(dayType) : chalk.red(dayType)],
      ['Is Business Day', isBusinessDay ? chalk.green('Yes') : chalk.red('No')],
      ['Next Business Day', date.nextBusinessDay().format('dddd, MMMM Do, YYYY')],
      ['Previous Business Day', date.previousBusinessDay().format('dddd, MMMM Do, YYYY')],
      [`+${count} Business Days`, date.addBusinessDays(count).format('dddd, MMMM Do, YYYY')],
      ['Business Days This Month', date.businessDaysInMonth().toString()],
      ['T+1 Settlement', date.settlementDate(1).format('dddd, MMMM Do, YYYY')],
      ['T+3 Settlement', date.settlementDate(3).format('dddd, MMMM Do, YYYY')],
    ];
    
    console.log(table(data, {
      border: {
        topBody: chalk.gray('─'),
        topJoin: chalk.gray('┬'),
        topLeft: chalk.gray('┌'),
        topRight: chalk.gray('┐'),
        bottomBody: chalk.gray('─'),
        bottomJoin: chalk.gray('┴'),
        bottomLeft: chalk.gray('└'),
        bottomRight: chalk.gray('┘'),
        bodyLeft: chalk.gray('│'),
        bodyRight: chalk.gray('│'),
        bodyJoin: chalk.gray('│'),
        joinBody: chalk.gray('─'),
        joinLeft: chalk.gray('├'),
        joinRight: chalk.gray('┤'),
        joinJoin: chalk.gray('┼')
      }
    }));
  });

// Holiday command
program
  .command('holiday')
  .description('Holiday information')
  .option('-d, --date <date>', 'Date to check (YYYY-MM-DD)', kairos().format('YYYY-MM-DD'))
  .option('-y, --year <year>', 'Show all holidays for year', '')
  .action((options) => {
    if (options.year) {
      showYearHolidays(parseInt(options.year));
    } else {
      showHolidayInfo(kairos(options.date));
    }
  });

function showHolidayInfo(date) {
  console.log(chalk.red.bold('\n🎉 Holiday Information'));
  console.log(chalk.gray('─'.repeat(40)));
  
  const isHoliday = date.isHoliday();
  const holiday = date.getHoliday();
  const nextHoliday = date.nextHoliday();
  const prevHoliday = date.previousHoliday();
  
  const data = [
    ['Property', 'Value'],
    ['Date', date.format('dddd, MMMM Do, YYYY')],
    ['Is Holiday', isHoliday ? chalk.red('Yes') : chalk.green('No')],
  ];
  
  if (holiday) {
    data.push(['Holiday Name', chalk.red(holiday.name)]);
    data.push(['Holiday Type', holiday.type || 'N/A']);
  }
  
  if (nextHoliday) {
    const nextInfo = nextHoliday.getHoliday();
    data.push(['Next Holiday', `${nextInfo?.name} (${nextHoliday.format('YYYY-MM-DD')})`]);
  }
  
  if (prevHoliday) {
    const prevInfo = prevHoliday.getHoliday();
    data.push(['Previous Holiday', `${prevInfo?.name} (${prevHoliday.format('YYYY-MM-DD')})`]);
  }
  
  console.log(table(data));
}

function showYearHolidays(year) {
  console.log(chalk.red.bold(`\n🎊 Holidays in ${year}`));
  console.log(chalk.gray('─'.repeat(50)));
  
  const holidays = kairos.getYearHolidays(year, kairos().getHolidays());
  
  const data = [['Date', 'Day', 'Holiday Name']];
  
  holidays.forEach(holiday => {
    const date = kairos(holiday.date);
    data.push([
      date.format('YYYY-MM-DD'),
      date.format('dddd'),
      holiday.name
    ]);
  });
  
  console.log(table(data));
}

// Duration command
program
  .command('duration')
  .description('Duration calculations')
  .option('-f, --from <date>', 'From date (YYYY-MM-DD)', kairos().format('YYYY-MM-DD'))
  .option('-t, --to <date>', 'To date (YYYY-MM-DD)', kairos().add(30, 'days').format('YYYY-MM-DD'))
  .option('-i, --iso <iso>', 'Parse ISO 8601 duration', '')
  .action((options) => {
    console.log(chalk.yellow.bold('\n⏱️  Duration Calculations'));
    console.log(chalk.gray('─'.repeat(40)));
    
    if (options.iso) {
      showIsoDuration(options.iso);
    } else {
      showDurationBetween(kairos(options.from), kairos(options.to));
    }
  });

function showDurationBetween(from, to) {
  const duration = from.duration(to);
  
  const data = [
    ['Property', 'Value'],
    ['From', from.format('dddd, MMMM Do, YYYY')],
    ['To', to.format('dddd, MMMM Do, YYYY')],
    ['Duration', duration.humanize()],
    ['Days', Math.abs(duration.asDays()).toFixed(1)],
    ['Hours', Math.abs(duration.asHours()).toFixed(1)],
    ['Business Days', Math.abs(from.businessDaysBetween(to)).toString()],
    ['ISO 8601', duration.toISOString()],
  ];
  
  console.log(table(data));
}

function showIsoDuration(iso) {
  try {
    const duration = kairos.duration(iso);
    
    const data = [
      ['Property', 'Value'],
      ['ISO String', iso],
      ['Humanized', duration.humanize()],
      ['Years', duration.years.toString()],
      ['Months', duration.months.toString()],
      ['Days', duration.days.toString()],
      ['Hours', duration.hours.toString()],
      ['Minutes', duration.minutes.toString()],
      ['Seconds', duration.seconds.toString()],
      ['Total Days', duration.asDays().toFixed(2)],
      ['Total Hours', duration.asHours().toFixed(2)],
    ];
    
    console.log(table(data));
  } catch (error) {
    console.log(chalk.red('Error parsing ISO duration:', error.message));
  }
}

// Range command
program
  .command('range')
  .description('Date range operations')
  .option('-s, --start <date>', 'Start date (YYYY-MM-DD)', kairos().startOf('month').format('YYYY-MM-DD'))
  .option('-e, --end <date>', 'End date (YYYY-MM-DD)', kairos().endOf('month').format('YYYY-MM-DD'))
  .option('--business-only', 'Show only business days')
  .option('--weekends-only', 'Show only weekends')
  .action((options) => {
    const start = kairos(options.start);
    const end = kairos(options.end);
    const range = start.range(end);
    
    console.log(chalk.green.bold('\n📊 Date Range Analysis'));
    console.log(chalk.gray('─'.repeat(40)));
    
    const allDates = range.toArray();
    const businessDays = range.businessDays();
    const weekends = range.weekends();
    
    let displayDates = allDates;
    let title = 'All Dates';
    
    if (options.businessOnly) {
      displayDates = businessDays;
      title = 'Business Days Only';
    } else if (options.weekendsOnly) {
      displayDates = weekends;
      title = 'Weekends Only';
    }
    
    // Summary
    const summaryData = [
      ['Property', 'Value'],
      ['Start Date', start.format('dddd, MMMM Do, YYYY')],
      ['End Date', end.format('dddd, MMMM Do, YYYY')],
      ['Total Days', allDates.length.toString()],
      ['Business Days', businessDays.length.toString()],
      ['Weekend Days', weekends.length.toString()],
      ['Weeks', Math.ceil(allDates.length / 7).toString()],
    ];
    
    console.log(table(summaryData));
    
    // Date list
    if (displayDates.length <= 20) {
      console.log(chalk.cyan.bold(`\n${title}:`));
      const dateData = [['Date', 'Day', 'Type']];
      
      displayDates.forEach(date => {
        const kDate = kairos(date);
        const type = kDate.isBusinessDay() ? 'Business' : 
                    kDate.isWeekend() ? 'Weekend' : 'Holiday';
        const color = type === 'Business' ? chalk.green : 
                     type === 'Weekend' ? chalk.yellow : chalk.red;
        
        dateData.push([
          kDate.format('YYYY-MM-DD'),
          kDate.format('dddd'),
          color(type)
        ]);
      });
      
      console.log(table(dateData));
    } else {
      console.log(chalk.yellow(`\nToo many dates to display (${displayDates.length}). Showing summary only.`));
    }
  });

// Calendar command
program
  .command('calendar')
  .description('Calendar information')
  .option('-d, --date <date>', 'Date to analyze (YYYY-MM-DD)', kairos().format('YYYY-MM-DD'))
  .action((options) => {
    const date = kairos(options.date);
    
    console.log(chalk.magenta.bold('\n📅 Calendar Information'));
    console.log(chalk.gray('─'.repeat(40)));
    
    const data = [
      ['Property', 'Value'],
      ['Date', date.format('dddd, MMMM Do, YYYY')],
      ['Year', date.year().toString()],
      ['Quarter', `Q${date.quarter()}`],
      ['Month', `${date.month()} (${date.format('MMMM')})`],
      ['Week of Year', date.weekOfYear().toString()],
      ['Day of Year', date.dayOfYear().toString()],
      ['Day of Month', date.date().toString()],
      ['Day of Week', `${date.day()} (${date.format('dddd')})`],
      ['Start of Week', date.startOf('week').format('YYYY-MM-DD dddd')],
      ['End of Week', date.endOf('week').format('YYYY-MM-DD dddd')],
      ['Start of Month', date.startOf('month').format('YYYY-MM-DD dddd')],
      ['End of Month', date.endOf('month').format('YYYY-MM-DD dddd')],
      ['Start of Quarter', date.startOfQuarter().format('YYYY-MM-DD dddd')],
      ['End of Quarter', date.endOfQuarter().format('YYYY-MM-DD dddd')],
      ['Start of Year', date.startOf('year').format('YYYY-MM-DD dddd')],
      ['End of Year', date.endOf('year').format('YYYY-MM-DD dddd')],
    ];
    
    console.log(table(data));
  });

// Interactive demo
program
  .command('demo')
  .description('Interactive demonstration')
  .action(() => {
    console.log(chalk.rainbow('\n🎭 Kairos Interactive Demo'));
    console.log(chalk.gray('─'.repeat(50)));
    
    // Show various capabilities
    const demos = [
      () => {
        console.log(chalk.blue.bold('\n⏰ Real-time Clock Demo'));
        let count = 0;
        const timer = setInterval(() => {
          const now = kairos();
          process.stdout.write(`\r${now.format('YYYY-MM-DD HH:mm:ss')} - ${now.fromNow()}`);
          if (++count >= 10) {
            clearInterval(timer);
            console.log('\n');
          }
        }, 1000);
      },
      
      () => {
        setTimeout(() => {
          console.log(chalk.green.bold('\n🔄 Date Manipulation Demo'));
          const base = kairos();
          
          const operations = [
            ['Original', base],
            ['+1 Year', base.add(1, 'year')],
            ['+6 Months', base.add(6, 'months')],
            ['+1 Week', base.add(1, 'week')],
            ['+1 Day', base.add(1, 'day')],
            ['-30 Days', base.subtract(30, 'days')]
          ];
          
          const data = [['Operation', 'Result', 'Day of Week']];
          operations.forEach(([op, date]) => {
            data.push([op, date.format('YYYY-MM-DD'), date.format('dddd')]);
          });
          
          console.log(table(data));
        }, 11000);
      },
      
      () => {
        setTimeout(() => {
          console.log(chalk.red.bold('\n🎯 Performance Benchmark'));
          
          // Business day performance
          console.time('Business Day Calculations (1000x)');
          for (let i = 0; i < 1000; i++) {
            const randomDate = kairos().add(Math.floor(Math.random() * 365), 'days');
            randomDate.isBusinessDay();
          }
          console.timeEnd('Business Day Calculations (1000x)');
          
          // Date parsing performance
          console.time('Date Parsing (10000x)');
          for (let i = 0; i < 10000; i++) {
            kairos(`2024-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-01`);
          }
          console.timeEnd('Date Parsing (10000x)');
          
          // Format performance
          console.time('Date Formatting (10000x)');
          const date = kairos();
          for (let i = 0; i < 10000; i++) {
            date.format('YYYY-MM-DD HH:mm:ss');
          }
          console.timeEnd('Date Formatting (10000x)');
          
        }, 12000);
      }
    ];
    
    demos.forEach((demo, index) => {
      setTimeout(demo, index * 1000);
    });
    
    setTimeout(() => {
      console.log(chalk.green.bold('\n✨ Demo completed!'));
      process.exit(0);
    }, 15000);
  });

// Error handling
program.on('command:*', () => {
  console.error(chalk.red('Invalid command: %s'), program.args.join(' '));
  console.log(chalk.yellow('See --help for a list of available commands.'));
  process.exit(1);
});

// Help customization
program.configureHelp({
  sortSubcommands: true,
  subcommandTerm: (cmd) => cmd.name()
});

program.parse();

// Show help if no command provided
if (!process.argv.slice(2).length) {
  program.outputHelp();
  console.log(chalk.cyan('\n💡 Examples:'));
  console.log(chalk.gray('  kairos-cli business --date 2024-01-15'));
  console.log(chalk.gray('  kairos-cli holiday --year 2024'));
  console.log(chalk.gray('  kairos-cli duration --from 2024-01-01 --to 2024-06-30'));
  console.log(chalk.gray('  kairos-cli range --start 2024-01-01 --end 2024-01-31 --business-only'));
  console.log(chalk.gray('  kairos-cli demo'));
}