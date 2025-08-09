<template>
  <div id="app">
    <h1>🗓️ Kairos Vue Example</h1>
    <p>A comprehensive demonstration of Kairos date library in Vue 3</p>

    <!-- Live Clock -->
    <div class="demo-section">
      <h3>⏰ Live Clock</h3>
      <div class="result">
        Current Time: {{ currentTime.format('YYYY-MM-DD HH:mm:ss') }}
      </div>
      <div class="result">
        Relative: {{ currentTime.fromNow() }}
      </div>
      <div class="result">
        Unix Timestamp: {{ currentTime.valueOf() }}
      </div>
    </div>

    <!-- Date Controls -->
    <div class="demo-section">
      <h3>📅 Date Controls</h3>
      <div class="date-picker">
        <input 
          v-model="selectedDate" 
          type="date" 
          class="date-input"
          @change="updateSelectedDate"
        />
        <button @click="setToday" class="btn">Today</button>
        <button @click="setChristmas" class="btn">Christmas</button>
        <button @click="setNewYear" class="btn">New Year</button>
      </div>
      <div class="result">
        Selected: {{ dateInstance.format('dddd, MMMM Do, YYYY') }}
      </div>
    </div>

    <!-- Date Information Grid -->
    <div class="demo-section">
      <h3>📊 Date Information</h3>
      <div class="grid">
        <div class="stat-box">
          <div class="stat-number">{{ dateInstance.year() }}</div>
          <div class="stat-label">Year</div>
        </div>
        <div class="stat-box">
          <div class="stat-number">Q{{ dateInstance.quarter() }}</div>
          <div class="stat-label">Quarter</div>
        </div>
        <div class="stat-box">
          <div class="stat-number">{{ dateInstance.month() }}</div>
          <div class="stat-label">Month</div>
        </div>
        <div class="stat-box">
          <div class="stat-number">{{ dateInstance.dayOfYear() }}</div>
          <div class="stat-label">Day of Year</div>
        </div>
        <div class="stat-box">
          <div class="stat-number">{{ dateInstance.weekOfYear() }}</div>
          <div class="stat-label">Week of Year</div>
        </div>
        <div class="stat-box">
          <div class="stat-number">{{ dateInstance.format('dddd') }}</div>
          <div class="stat-label">Day of Week</div>
        </div>
      </div>
    </div>

    <!-- Holiday Information -->
    <div class="demo-section">
      <h3>🎉 Holiday Information</h3>
      <HolidayInfo :date="dateInstance" />
    </div>

    <!-- Business Day Analysis -->
    <div class="demo-section">
      <h3>💼 Business Day Analysis</h3>
      <BusinessDayInfo :date="dateInstance" />
    </div>

    <!-- Date Manipulation -->
    <div class="demo-section">
      <h3>🧮 Date Manipulation</h3>
      <DateManipulation :date="dateInstance" />
    </div>

    <!-- Duration Examples -->
    <div class="demo-section">
      <h3>⏱️ Duration Examples</h3>
      <DurationExamples :date="dateInstance" />
    </div>

    <!-- Range Operations -->
    <div class="demo-section">
      <h3>📊 Range Operations</h3>
      <RangeOperations :date="dateInstance" />
    </div>

    <!-- Interactive Date Calculator -->
    <div class="demo-section">
      <h3>🧮 Interactive Calculator</h3>
      <DateCalculator :baseDate="dateInstance" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
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

// Components
import HolidayInfo from './components/HolidayInfo.vue';
import BusinessDayInfo from './components/BusinessDayInfo.vue';
import DateManipulation from './components/DateManipulation.vue';
import DurationExamples from './components/DurationExamples.vue';
import RangeOperations from './components/RangeOperations.vue';
import DateCalculator from './components/DateCalculator.vue';

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

// Reactive state
const currentTime = ref(kairos());
const selectedDate = ref(kairos().format('YYYY-MM-DD'));

// Computed
const dateInstance = computed(() => kairos(selectedDate.value));

// Timer for live clock
let timer: NodeJS.Timeout | null = null;

onMounted(() => {
  timer = setInterval(() => {
    currentTime.value = kairos();
  }, 1000);
});

onUnmounted(() => {
  if (timer) {
    clearInterval(timer);
  }
});

// Methods
function updateSelectedDate() {
  // Trigger reactivity
}

function setToday() {
  selectedDate.value = kairos().format('YYYY-MM-DD');
}

function setChristmas() {
  const year = kairos().year();
  selectedDate.value = kairos(`${year}-12-25`).format('YYYY-MM-DD');
}

function setNewYear() {
  const year = kairos().year() + 1;
  selectedDate.value = kairos(`${year}-01-01`).format('YYYY-MM-DD');
}
</script>