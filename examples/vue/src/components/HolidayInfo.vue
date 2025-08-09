<template>
  <div>
    <div :class="['result', { 'holiday': isHoliday }]">
      Is Holiday: {{ isHoliday ? 'Yes' : 'No' }}
    </div>
    
    <div v-if="holiday" class="result holiday">
      Holiday: {{ holiday.name }}
      <div v-if="holiday.type" class="stat-label">Type: {{ holiday.type }}</div>
    </div>
    
    <div v-if="nextHoliday" class="result">
      Next Holiday: {{ nextHoliday.getHoliday()?.name }} ({{ nextHoliday.format('YYYY-MM-DD') }})
    </div>
    
    <div v-if="prevHoliday" class="result">
      Previous Holiday: {{ prevHoliday.getHoliday()?.name }} ({{ prevHoliday.format('YYYY-MM-DD') }})
    </div>
    
    <div class="result">
      Days until next holiday: {{ daysUntilNext }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  date: any;
}

const props = defineProps<Props>();

const isHoliday = computed(() => props.date.isHoliday());
const holiday = computed(() => props.date.getHoliday());
const nextHoliday = computed(() => props.date.nextHoliday());
const prevHoliday = computed(() => props.date.previousHoliday());

const daysUntilNext = computed(() => {
  const next = nextHoliday.value;
  if (!next) return 'N/A';
  
  const days = Math.ceil((next.valueOf() - props.date.valueOf()) / (24 * 60 * 60 * 1000));
  return days;
});
</script>