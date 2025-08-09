import React, { useState, useEffect } from 'react';
import kairos from '@oxog/kairos';

// Import plugins
import businessPlugin from '@oxog/kairos/plugins/business/workday';
import holidayEngine from '@oxog/kairos/plugins/holiday/engine';
import fixedCalculator from '@oxog/kairos/plugins/holiday/calculators/fixed';
import nthWeekdayCalculator from '@oxog/kairos/plugins/holiday/calculators/nth-weekday';
import easterCalculator from '@oxog/kairos/plugins/holiday/calculators/easter';
import relativeCalculator from '@oxog/kairos/plugins/holiday/calculators/relative';
import durationPlugin from '@oxog/kairos/plugins/duration/duration';
import rangePlugin from '@oxog/kairos/plugins/range/range';
import relativeTimePlugin from '@oxog/kairos/plugins/relative/relative-time';
import calendarPlugin from '@oxog/kairos/plugins/calendar/calendar';
import localeUS from '@oxog/kairos/plugins/locale/en-US/index';

// Initialize plugins
kairos.use([
  holidayEngine,
  fixedCalculator,
  nthWeekdayCalculator,
  easterCalculator,
  relativeCalculator,
  businessPlugin,
  durationPlugin,
  rangePlugin,
  relativeTimePlugin,
  calendarPlugin,
  localeUS
]);

function App() {
  const [selectedDate, setSelectedDate] = useState(kairos().format('YYYY-MM-DD'));
  const [currentTime, setCurrentTime] = useState(kairos());

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(kairos());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const dateInstance = kairos(selectedDate);

  return (
    <div className="App">
      <h1>🗓️ Kairos React Example</h1>
      <p>A comprehensive demonstration of Kairos date library in React</p>

      {/* Live Clock */}
      <div className="demo-section">
        <h3>⏰ Live Clock</h3>
        <div className="result">
          Current Time: {currentTime.format('YYYY-MM-DD HH:mm:ss')}
        </div>
        <div className="result">
          Relative: {currentTime.fromNow()}
        </div>
      </div>

      {/* Date Input */}
      <div className="demo-section">
        <h3>📅 Date Selection</h3>
        <input
          type="date"
          className="date-input"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
        />
        <div className="result">
          Selected: {dateInstance.format('dddd, MMMM Do, YYYY')}
        </div>
      </div>

      {/* Basic Date Information */}
      <div className="demo-section">
        <h3>📊 Date Information</h3>
        <div className="result">Year: {dateInstance.year()}</div>
        <div className="result">Month: {dateInstance.month()} ({dateInstance.format('MMMM')})</div>
        <div className="result">Day: {dateInstance.date()}</div>
        <div className="result">Day of Week: {dateInstance.day()} ({dateInstance.format('dddd')})</div>
        <div className="result">Quarter: Q{dateInstance.quarter()}</div>
        <div className="result">Day of Year: {dateInstance.dayOfYear()}</div>
        <div className="result">Week of Year: {dateInstance.weekOfYear()}</div>
      </div>

      {/* Holiday Detection */}
      <div className="demo-section">
        <h3>🎉 Holiday Detection</h3>
        <HolidayInfo date={dateInstance} />
      </div>

      {/* Business Day Analysis */}
      <div className="demo-section">
        <h3>💼 Business Day Analysis</h3>
        <BusinessDayInfo date={dateInstance} />
      </div>

      {/* Date Arithmetic */}
      <div className="demo-section">
        <h3>🧮 Date Arithmetic</h3>
        <DateArithmetic date={dateInstance} />
      </div>

      {/* Date Range Demo */}
      <div className="demo-section">
        <h3>📊 Date Range Operations</h3>
        <DateRangeDemo date={dateInstance} />
      </div>

      {/* Duration Demo */}
      <div className="demo-section">
        <h3>⏱️ Duration Calculations</h3>
        <DurationDemo date={dateInstance} />
      </div>

      {/* Relative Time */}
      <div className="demo-section">
        <h3>🕐 Relative Time</h3>
        <RelativeTimeDemo date={dateInstance} />
      </div>
    </div>
  );
}

// Holiday Information Component
function HolidayInfo({ date }: { date: any }) {
  const isHoliday = date.isHoliday();
  const holiday = date.getHoliday();

  return (
    <>
      <div className={`result ${isHoliday ? 'holiday' : ''}`}>
        Is Holiday: {isHoliday ? 'Yes' : 'No'}
      </div>
      {holiday && (
        <div className="result holiday">
          Holiday: {holiday.name}
        </div>
      )}
      <HolidayNavigation date={date} />
    </>
  );
}

// Holiday Navigation Component
function HolidayNavigation({ date }: { date: any }) {
  const nextHoliday = date.nextHoliday();
  const prevHoliday = date.previousHoliday();

  return (
    <>
      {nextHoliday && (
        <div className="result">
          Next Holiday: {nextHoliday.getHoliday()?.name} ({nextHoliday.format('YYYY-MM-DD')})
        </div>
      )}
      {prevHoliday && (
        <div className="result">
          Previous Holiday: {prevHoliday.getHoliday()?.name} ({prevHoliday.format('YYYY-MM-DD')})
        </div>
      )}
    </>
  );
}

// Business Day Information Component
function BusinessDayInfo({ date }: { date: any }) {
  const isBusinessDay = date.isBusinessDay();
  const isWeekend = date.isWeekend();
  
  return (
    <>
      <div className={`result ${isBusinessDay ? 'business-day' : isWeekend ? 'weekend' : 'holiday'}`}>
        Type: {isBusinessDay ? 'Business Day' : isWeekend ? 'Weekend' : 'Holiday'}
      </div>
      <BusinessDayNavigation date={date} />
      <BusinessDayCalculations date={date} />
    </>
  );
}

// Business Day Navigation Component
function BusinessDayNavigation({ date }: { date: any }) {
  const nextBusiness = date.nextBusinessDay();
  const prevBusiness = date.previousBusinessDay();

  return (
    <>
      <div className="result">
        Next Business Day: {nextBusiness.format('YYYY-MM-DD dddd')}
      </div>
      <div className="result">
        Previous Business Day: {prevBusiness.format('YYYY-MM-DD dddd')}
      </div>
    </>
  );
}

// Business Day Calculations Component
function BusinessDayCalculations({ date }: { date: any }) {
  const plus5Business = date.addBusinessDays(5);
  const businessDaysThisMonth = date.businessDaysInMonth();
  const settlement = date.settlementDate(3);

  return (
    <>
      <div className="result">
        +5 Business Days: {plus5Business.format('YYYY-MM-DD dddd')}
      </div>
      <div className="result">
        Business Days This Month: {businessDaysThisMonth}
      </div>
      <div className="result">
        T+3 Settlement: {settlement.format('YYYY-MM-DD dddd')}
      </div>
    </>
  );
}

// Date Arithmetic Component
function DateArithmetic({ date }: { date: any }) {
  return (
    <>
      <div className="result">
        +1 Year: {date.add(1, 'year').format('YYYY-MM-DD')}</div>
      <div className="result">
        +6 Months: {date.add(6, 'months').format('YYYY-MM-DD')}</div>
      <div className="result">
        +2 Weeks: {date.add(2, 'weeks').format('YYYY-MM-DD')}</div>
      <div className="result">
        -30 Days: {date.subtract(30, 'days').format('YYYY-MM-DD')}</div>
      <div className="result">
        Start of Month: {date.startOf('month').format('YYYY-MM-DD')}</div>
      <div className="result">
        End of Month: {date.endOf('month').format('YYYY-MM-DD')}</div>
    </>
  );
}

// Date Range Demo Component
function DateRangeDemo({ date }: { date: any }) {
  const monthRange = date.range(date.endOf('month'));
  const businessDays = monthRange.businessDays();
  const weekends = monthRange.weekends();

  return (
    <>
      <div className="result">
        Days in Month Range: {monthRange.count()}</div>
      <div className="result">
        Business Days in Range: {businessDays.length}</div>
      <div className="result">
        Weekends in Range: {weekends.length}</div>
      <div className="result">
        First Weekend: {weekends[0]?.toISOString().split('T')[0] || 'None'}</div>
    </>
  );
}

// Duration Demo Component
function DurationDemo({ date }: { date: any }) {
  const now = kairos();
  const duration = date.duration(now);
  const humanized = duration.humanize();
  
  const customDuration = kairos.duration({ hours: 2, minutes: 30, seconds: 45 });

  return (
    <>
      <div className="result">
        Duration from Now: {humanized}</div>
      <div className="result">
        Duration in Days: {Math.abs(duration.asDays()).toFixed(1)}</div>
      <div className="result">
        Custom Duration (2h 30m 45s): {customDuration.humanize()}</div>
      <div className="result">
        Custom Duration in Minutes: {customDuration.asMinutes().toFixed(1)}</div>
      <div className="result">
        ISO Duration: {customDuration.toISOString()}</div>
    </>
  );
}

// Relative Time Demo Component
function RelativeTimeDemo({ date }: { date: any }) {
  const now = kairos();

  return (
    <>
      <div className="result">
        From Now: {date.from(now)}</div>
      <div className="result">
        To Now: {date.to(now)}</div>
      <div className="result">
        From Now (short): {date.fromNow()}</div>
      <div className="result">
        To Now (short): {date.toNow()}</div>
    </>
  );
}

export default App;