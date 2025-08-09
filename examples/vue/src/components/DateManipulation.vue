<template>
  <div>
    <div class="result">
      Original: {{ date.format('YYYY-MM-DD dddd') }}
    </div>
    
    <div class="result">
      +1 Year: {{ date.add(1, 'year').format('YYYY-MM-DD dddd') }}
    </div>
    
    <div class="result">
      +6 Months: {{ date.add(6, 'months').format('YYYY-MM-DD dddd') }}
    </div>
    
    <div class="result">
      +2 Weeks: {{ date.add(2, 'weeks').format('YYYY-MM-DD dddd') }}
    </div>
    
    <div class="result">
      -30 Days: {{ date.subtract(30, 'days').format('YYYY-MM-DD dddd') }}
    </div>
    
    <div class="result">
      Start of Year: {{ date.startOf('year').format('YYYY-MM-DD dddd') }}
    </div>
    
    <div class="result">
      End of Year: {{ date.endOf('year').format('YYYY-MM-DD dddd') }}
    </div>
    
    <div class="result">
      Start of Month: {{ date.startOf('month').format('YYYY-MM-DD dddd') }}
    </div>
    
    <div class="result">
      End of Month: {{ date.endOf('month').format('YYYY-MM-DD dddd') }}
    </div>
    
    <div class="result">
      Start of Week: {{ date.startOf('week').format('YYYY-MM-DD dddd') }}
    </div>
    
    <div class="result">
      End of Week: {{ date.endOf('week').format('YYYY-MM-DD dddd') }}
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  date: any;
}

defineProps<Props>();
</script>