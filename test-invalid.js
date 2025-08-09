const path = require('path');
process.chdir('D:/AI_Development/Kairos');

// Test invalid date formatting directly
class TestDate {
  constructor(input) {
    this._date = new Date(input);
  }
  
  isValid() {
    return !isNaN(this._date.getTime());
  }
  
  format(template = 'YYYY-MM-DD') {
    if (!this.isValid()) {
      return 'Invalid Date';
    }
    
    const year = this._date.getFullYear();
    const month = this._date.getMonth() + 1;
    const date = this._date.getDate();
    
    // Double-check for NaN values
    if (isNaN(year) || isNaN(month) || isNaN(date)) {
      return 'Invalid Date';
    }
    
    return template
      .replace(/YYYY/g, year.toString())
      .replace(/MM/g, month.toString().padStart(2, '0'))
      .replace(/DD/g, date.toString().padStart(2, '0'));
  }
}

const invalid = new TestDate('invalid');
console.log('isValid:', invalid.isValid());
console.log('format:', invalid.format());
console.log('_date:', invalid._date);
console.log('getFullYear:', invalid._date.getFullYear());
console.log('typeof getFullYear:', typeof invalid._date.getFullYear());
console.log('getFullYear toString:', invalid._date.getFullYear().toString());