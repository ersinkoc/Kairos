<template>
  <div>
    <div class="result">
      Duration from Now: {{ durationFromNow.humanize() }}
    </div>
    
    <div class="result">
      Duration in Days: {{ Math.abs(durationFromNow.asDays()).toFixed(1) }} days
    </div>
    
    <div class="result">
      Duration in Hours: {{ Math.abs(durationFromNow.asHours()).toFixed(1) }} hours
    </div>
    
    <div class="result">
      Custom Duration (2h 30m 45s): {{ customDuration.humanize() }}
    </div>
    
    <div class="result">
      Custom Duration ISO: {{ customDuration.toISOString() }}
    </div>
    
    <div class="result">
      Custom Duration in Minutes: {{ customDuration.asMinutes().toFixed(1) }} minutes
    </div>
    
    <div class="result">
      Duration Arithmetic: {{ arithmeticResult.humanize() }}
    </div>
    
    <div class="result">
      Work Week Duration: {{ workWeek.humanize() }}
    </div>
    
    <div class="result">
      ISO 8601 Parse Test: {{ isoDuration.humanize() }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import kairos from '@oxog/kairos';

interface Props {
  date: any;
}

const props = defineProps<Props>();

const now = computed(() => kairos());

const durationFromNow = computed(() => {
  return props.date.duration(now.value);
});

const customDuration = computed(() => {
  return kairos.duration({ hours: 2, minutes: 30, seconds: 45 });
});

const arithmeticResult = computed(() => {
  const dur1 = kairos.duration({ hours: 8 });
  const dur2 = kairos.duration({ minutes: 30 });
  return dur1.add(dur2);
});

const workWeek = computed(() => {
  return kairos.duration({ days: 5, hours: 8 });
});

const isoDuration = computed(() => {
  return kairos.duration('P1Y2M3DT4H5M6S');
});
</script>