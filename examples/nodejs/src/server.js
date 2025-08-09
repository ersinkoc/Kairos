#!/usr/bin/env node

import express from 'express';
import kairos from './index.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static('public'));

// CORS middleware for frontend access
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  next();
});

console.log('🚀 Starting Kairos Date Library API Server...\n');

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: kairos().toISOString(),
    uptime: process.uptime(),
    version: '1.0.0'
  });
});

// 1. Basic Date Operations
app.get('/api/date/now', (req, res) => {
  const now = kairos();
  res.json({
    timestamp: now.toISOString(),
    formatted: now.format('YYYY-MM-DD HH:mm:ss'),
    unix: now.unix(),
    relative: now.fromNow()
  });
});

app.post('/api/date/parse', (req, res) => {
  try {
    const { input, format } = req.body;
    const date = format ? kairos(input, format) : kairos(input);
    
    res.json({
      success: true,
      input,
      parsed: {
        iso: date.toISOString(),
        formatted: date.format('YYYY-MM-DD HH:mm:ss'),
        unix: date.unix(),
        valid: date.isValid()
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

app.post('/api/date/format', (req, res) => {
  try {
    const { date, format = 'YYYY-MM-DD HH:mm:ss' } = req.body;
    const kDate = kairos(date);
    
    res.json({
      success: true,
      original: date,
      formatted: kDate.format(format),
      formats: {
        iso: kDate.toISOString(),
        date: kDate.format('YYYY-MM-DD'),
        time: kDate.format('HH:mm:ss'),
        human: kDate.format('dddd, MMMM Do, YYYY'),
        relative: kDate.fromNow()
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// 2. Business Day Operations
app.post('/api/business/is-business-day', (req, res) => {
  try {
    const { date } = req.body;
    const kDate = kairos(date);
    
    res.json({
      date: kDate.format('YYYY-MM-DD'),
      dayOfWeek: kDate.format('dddd'),
      isBusinessDay: kDate.isBusinessDay(),
      isWeekend: kDate.isWeekend(),
      isHoliday: kDate.isHoliday(),
      holiday: kDate.getHoliday()
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

app.post('/api/business/add-business-days', (req, res) => {
  try {
    const { date, days } = req.body;
    const startDate = kairos(date);
    const endDate = startDate.addBusinessDays(parseInt(days));
    
    res.json({
      startDate: startDate.format('YYYY-MM-DD dddd'),
      businessDaysAdded: parseInt(days),
      endDate: endDate.format('YYYY-MM-DD dddd'),
      totalCalendarDays: endDate.diff(startDate, 'days'),
      businessDaysBetween: startDate.businessDaysBetween(endDate)
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

app.post('/api/business/next-business-day', (req, res) => {
  try {
    const { date } = req.body;
    const kDate = kairos(date);
    const nextBusiness = kDate.nextBusinessDay();
    const prevBusiness = kDate.previousBusinessDay();
    
    res.json({
      inputDate: kDate.format('YYYY-MM-DD dddd'),
      isBusinessDay: kDate.isBusinessDay(),
      nextBusinessDay: nextBusiness.format('YYYY-MM-DD dddd'),
      previousBusinessDay: prevBusiness.format('YYYY-MM-DD dddd'),
      daysUntilNext: nextBusiness.diff(kDate, 'days'),
      daysSincePrevious: kDate.diff(prevBusiness, 'days')
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

app.post('/api/business/settlement-date', (req, res) => {
  try {
    const { tradeDate, days = 3 } = req.body;
    const trade = kairos(tradeDate);
    const settlement = trade.settlementDate(parseInt(days));
    
    res.json({
      tradeDate: trade.format('YYYY-MM-DD dddd'),
      settlementDays: parseInt(days),
      settlementDate: settlement.format('YYYY-MM-DD dddd'),
      isTradeBusinessDay: trade.isBusinessDay(),
      isSettlementBusinessDay: settlement.isBusinessDay(),
      calendarDaysBetween: settlement.diff(trade, 'days')
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// 3. Holiday Operations  
app.get('/api/holidays/year/:year', (req, res) => {
  try {
    const year = parseInt(req.params.year);
    const startOfYear = kairos(`${year}-01-01`);
    const endOfYear = kairos(`${year}-12-31`);
    const yearRange = startOfYear.range(endOfYear);
    
    // Get all dates and filter for holidays
    const allDates = yearRange.toArray();
    const holidays = [];
    
    allDates.forEach(date => {
      const kDate = kairos(date);
      if (kDate.isHoliday()) {
        const holiday = kDate.getHoliday();
        holidays.push({
          date: kDate.format('YYYY-MM-DD'),
          dayOfWeek: kDate.format('dddd'),
          name: holiday?.name,
          type: holiday?.type
        });
      }
    });
    
    res.json({
      year,
      totalHolidays: holidays.length,
      holidays
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

app.post('/api/holidays/check', (req, res) => {
  try {
    const { date } = req.body;
    const kDate = kairos(date);
    const holiday = kDate.getHoliday();
    
    res.json({
      date: kDate.format('YYYY-MM-DD'),
      dayOfWeek: kDate.format('dddd'),
      isHoliday: kDate.isHoliday(),
      holiday: holiday ? {
        name: holiday.name,
        type: holiday.type,
        description: holiday.description
      } : null,
      nextHoliday: kDate.nextHoliday()?.format('YYYY-MM-DD'),
      previousHoliday: kDate.previousHoliday()?.format('YYYY-MM-DD')
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// 4. Duration Operations
app.post('/api/duration/between', (req, res) => {
  try {
    const { startDate, endDate } = req.body;
    const start = kairos(startDate);
    const end = kairos(endDate);
    const duration = start.duration(end);
    
    res.json({
      startDate: start.format('YYYY-MM-DD HH:mm:ss'),
      endDate: end.format('YYYY-MM-DD HH:mm:ss'),
      duration: {
        humanized: duration.humanize(),
        iso8601: duration.toISOString(),
        totalDays: Math.abs(duration.asDays()).toFixed(2),
        totalHours: Math.abs(duration.asHours()).toFixed(2),
        totalMinutes: Math.abs(duration.asMinutes()).toFixed(0),
        components: {
          years: Math.abs(duration.years),
          months: Math.abs(duration.months), 
          days: Math.abs(duration.days),
          hours: Math.abs(duration.hours),
          minutes: Math.abs(duration.minutes),
          seconds: Math.abs(duration.seconds)
        }
      },
      businessDays: start.businessDaysBetween(end)
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

app.post('/api/duration/parse', (req, res) => {
  try {
    const { iso8601 } = req.body;
    const duration = kairos.duration(iso8601);
    
    res.json({
      input: iso8601,
      parsed: {
        humanized: duration.humanize(),
        totalDays: duration.asDays().toFixed(2),
        totalHours: duration.asHours().toFixed(2),
        components: {
          years: duration.years,
          months: duration.months,
          days: duration.days,
          hours: duration.hours,
          minutes: duration.minutes,
          seconds: duration.seconds
        }
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// 5. Range Operations
app.post('/api/range/analyze', (req, res) => {
  try {
    const { startDate, endDate } = req.body;
    const start = kairos(startDate);
    const end = kairos(endDate);
    const range = start.range(end);
    
    const businessDays = range.businessDays();
    const weekends = range.weekends();
    const allDates = range.toArray();
    
    res.json({
      startDate: start.format('YYYY-MM-DD'),
      endDate: end.format('YYYY-MM-DD'),
      totalDays: range.count(),
      businessDays: businessDays.length,
      weekendDays: weekends.length,
      holidayDays: allDates.length - businessDays.length - weekends.length,
      weeks: Math.ceil(allDates.length / 7),
      analysis: {
        businessDayPercentage: ((businessDays.length / allDates.length) * 100).toFixed(1),
        weekendPercentage: ((weekends.length / allDates.length) * 100).toFixed(1)
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// 6. Calendar Operations
app.post('/api/calendar/info', (req, res) => {
  try {
    const { date } = req.body;
    const kDate = kairos(date);
    
    res.json({
      date: kDate.format('YYYY-MM-DD'),
      formatted: kDate.format('dddd, MMMM Do, YYYY'),
      calendar: {
        year: kDate.year(),
        quarter: kDate.quarter(),
        month: kDate.month(),
        monthName: kDate.format('MMMM'),
        week: kDate.weekOfYear(),
        dayOfYear: kDate.dayOfYear(),
        dayOfMonth: kDate.date(),
        dayOfWeek: kDate.day(),
        dayOfWeekName: kDate.format('dddd')
      },
      boundaries: {
        startOfWeek: kDate.startOf('week').format('YYYY-MM-DD'),
        endOfWeek: kDate.endOf('week').format('YYYY-MM-DD'),
        startOfMonth: kDate.startOf('month').format('YYYY-MM-DD'),
        endOfMonth: kDate.endOf('month').format('YYYY-MM-DD'),
        startOfQuarter: kDate.startOfQuarter().format('YYYY-MM-DD'),
        endOfQuarter: kDate.endOfQuarter().format('YYYY-MM-DD'),
        startOfYear: kDate.startOf('year').format('YYYY-MM-DD'),
        endOfYear: kDate.endOf('year').format('YYYY-MM-DD')
      },
      businessInfo: {
        isBusinessDay: kDate.isBusinessDay(),
        isWeekend: kDate.isWeekend(),
        isHoliday: kDate.isHoliday(),
        businessDaysInMonth: kDate.businessDaysInMonth()
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// 7. Batch Operations
app.post('/api/batch/business-days', (req, res) => {
  try {
    const { dates } = req.body;
    
    if (!Array.isArray(dates)) {
      return res.status(400).json({
        success: false,
        error: 'dates must be an array'
      });
    }
    
    const results = dates.map(dateStr => {
      try {
        const date = kairos(dateStr);
        return {
          date: dateStr,
          formatted: date.format('YYYY-MM-DD dddd'),
          isBusinessDay: date.isBusinessDay(),
          isWeekend: date.isWeekend(),
          isHoliday: date.isHoliday(),
          nextBusinessDay: date.nextBusinessDay().format('YYYY-MM-DD'),
          error: null
        };
      } catch (error) {
        return {
          date: dateStr,
          error: error.message
        };
      }
    });
    
    const summary = {
      total: results.length,
      businessDays: results.filter(r => !r.error && r.isBusinessDay).length,
      weekends: results.filter(r => !r.error && r.isWeekend).length,
      holidays: results.filter(r => !r.error && r.isHoliday).length,
      errors: results.filter(r => r.error).length
    };
    
    res.json({
      success: true,
      summary,
      results
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// API Documentation endpoint
app.get('/api', (req, res) => {
  const endpoints = [
    { method: 'GET', path: '/health', description: 'Health check and server info' },
    { method: 'GET', path: '/api/date/now', description: 'Get current date/time' },
    { method: 'POST', path: '/api/date/parse', description: 'Parse date string', body: { input: 'string', format: 'string (optional)' } },
    { method: 'POST', path: '/api/date/format', description: 'Format date', body: { date: 'string', format: 'string (optional)' } },
    { method: 'POST', path: '/api/business/is-business-day', description: 'Check if date is business day', body: { date: 'string' } },
    { method: 'POST', path: '/api/business/add-business-days', description: 'Add business days to date', body: { date: 'string', days: 'number' } },
    { method: 'POST', path: '/api/business/next-business-day', description: 'Get next/previous business day', body: { date: 'string' } },
    { method: 'POST', path: '/api/business/settlement-date', description: 'Calculate settlement date', body: { tradeDate: 'string', days: 'number (optional)' } },
    { method: 'GET', path: '/api/holidays/year/:year', description: 'Get all holidays for year' },
    { method: 'POST', path: '/api/holidays/check', description: 'Check if date is holiday', body: { date: 'string' } },
    { method: 'POST', path: '/api/duration/between', description: 'Calculate duration between dates', body: { startDate: 'string', endDate: 'string' } },
    { method: 'POST', path: '/api/duration/parse', description: 'Parse ISO 8601 duration', body: { iso8601: 'string' } },
    { method: 'POST', path: '/api/range/analyze', description: 'Analyze date range', body: { startDate: 'string', endDate: 'string' } },
    { method: 'POST', path: '/api/calendar/info', description: 'Get calendar information', body: { date: 'string' } },
    { method: 'POST', path: '/api/batch/business-days', description: 'Batch business day analysis', body: { dates: 'array' } }
  ];
  
  res.json({
    title: 'Kairos Date Library API',
    version: '1.0.0',
    endpoints
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('API Error:', error);
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    availableEndpoints: '/api'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🌐 Kairos API Server running on http://localhost:${PORT}`);
  console.log(`📚 API Documentation: http://localhost:${PORT}/api`);
  console.log(`❤️  Health Check: http://localhost:${PORT}/health`);
  console.log(`\n🎯 Example API calls:`);
  console.log(`curl http://localhost:${PORT}/api/date/now`);
  console.log(`curl -X POST http://localhost:${PORT}/api/business/is-business-day -H "Content-Type: application/json" -d '{"date":"2024-01-15"}'`);
  console.log(`curl http://localhost:${PORT}/api/holidays/year/2024`);
  console.log(`\n⭐ Press Ctrl+C to stop the server`);
});