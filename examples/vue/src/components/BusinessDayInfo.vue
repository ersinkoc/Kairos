<template>
  <div>
    <div :class="['result', dayTypeClass]">
      Type: {{ dayType }}
    </div>
    
    <div class="result">
      Next Business Day: {{ nextBusinessDay.format('YYYY-MM-DD dddd') }}
    </div>
    
    <div class="result">
      Previous Business Day: {{ prevBusinessDay.format('YYYY-MM-DD dddd') }}
    </div>
    
    <div class="result">
      +5 Business Days: {{ plus5Business.format('YYYY-MM-DD dddd') }}
    </div>
    
    <div class="result">
      Business Days This Month: {{ businessDaysThisMonth }}
    </div>
    
    <div class="result">
      T+1 Settlement: {{ settlement1.format('YYYY-MM-DD dddd') }}
    </div>
    
    <div class="result">
      T+3 Settlement: {{ settlement3.format('YYYY-MM-DD dddd') }}
    </div>
    
    <div v-if="isWorkingHour !== null" class="result">
      Is Working Hour (9-5): {{ isWorkingHour ? 'Yes' : 'No' }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  date: any;
}

const props = defineProps<Props>();

const isBusinessDay = computed(() => props.date.isBusinessDay());
const isWeekend = computed(() => props.date.isWeekend());

const dayType = computed(() => {
  if (isBusinessDay.value) return 'Business Day';
  if (isWeekend.value) return 'Weekend';
  return 'Holiday';
});

const dayTypeClass = computed(() => {
  if (isBusinessDay.value) return 'business-day';
  if (isWeekend.value) return 'weekend';
  return 'holiday';
});

const nextBusinessDay = computed(() => props.date.nextBusinessDay());
const prevBusinessDay = computed(() => props.date.previousBusinessDay());
const plus5Business = computed(() => props.date.addBusinessDays(5));
const businessDaysThisMonth = computed(() => props.date.businessDaysInMonth());
const settlement1 = computed(() => props.date.settlementDate(1));
const settlement3 = computed(() => props.date.settlementDate(3));

const isWorkingHour = computed(() => {
  try {
    return props.date.isWorkingHour();
  } catch {
    return null; // Not available if no time component
  }
});
</script>