<template>
  <div>
    <div class="result">
      Month Range: {{ monthStart.format('MMM D') }} to {{ monthEnd.format('MMM D') }}
    </div>
    
    <div class="result">
      Days in Range: {{ monthRange.count() }}
    </div>
    
    <div class="result">
      Business Days: {{ businessDays.length }}
    </div>
    
    <div class="result">
      Weekends: {{ weekends.length }}
    </div>
    
    <div class="result">
      First Business Day: {{ firstBusinessDay }}
    </div>
    
    <div class="result">
      Last Business Day: {{ lastBusinessDay }}
    </div>
    
    <div class="result">
      Mondays in Range: {{ mondays.length }}
    </div>
    
    <div class="result">
      Days in Current Quarter: {{ quarterRange.count() }}
    </div>
    
    <div class="result">
      Year to Date Days: {{ yearToDateRange.count() }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  date: any;
}

const props = defineProps<Props>();

const monthStart = computed(() => props.date.startOf('month'));
const monthEnd = computed(() => props.date.endOf('month'));
const monthRange = computed(() => monthStart.value.range(monthEnd.value));

const businessDays = computed(() => monthRange.value.businessDays());
const weekends = computed(() => monthRange.value.weekends());
const mondays = computed(() => monthRange.value.weekday(1));

const firstBusinessDay = computed(() => {
  const days = businessDays.value;
  return days.length > 0 ? days[0].toISOString().split('T')[0] : 'None';
});

const lastBusinessDay = computed(() => {
  const days = businessDays.value;
  return days.length > 0 ? days[days.length - 1].toISOString().split('T')[0] : 'None';
});

const quarterRange = computed(() => {
  const start = props.date.startOfQuarter();
  const end = props.date.endOfQuarter();
  return start.range(end);
});

const yearToDateRange = computed(() => {
  const start = props.date.startOf('year');
  return start.range(props.date);
});
</script>