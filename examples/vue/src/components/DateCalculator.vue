<template>
  <div>
    <div class="date-picker">
      <input 
        v-model="amount" 
        type="number" 
        class="date-input" 
        placeholder="Amount"
        style="width: 100px;"
      />
      <select v-model="unit" class="date-input">
        <option value="years">Years</option>
        <option value="months">Months</option>
        <option value="weeks">Weeks</option>
        <option value="days">Days</option>
        <option value="hours">Hours</option>
        <option value="minutes">Minutes</option>
      </select>
      <button @click="addTime" class="btn">Add</button>
      <button @click="subtractTime" class="btn">Subtract</button>
      <button @click="reset" class="btn">Reset</button>
    </div>
    
    <div class="result">
      Base Date: {{ baseDate.format('YYYY-MM-DD dddd HH:mm:ss') }}
    </div>
    
    <div class="result">
      Calculated Date: {{ calculatedDate.format('YYYY-MM-DD dddd HH:mm:ss') }}
    </div>
    
    <div class="result">
      Difference: {{ difference.humanize() }}
    </div>
    
    <div class="result">
      Is Business Day: {{ calculatedDate.isBusinessDay() ? 'Yes' : 'No' }}
    </div>
    
    <div v-if="calculatedDate.isHoliday()" class="result holiday">
      Holiday: {{ calculatedDate.getHoliday()?.name }}
    </div>
    
    <div class="result">
      Compare to Base: {{ comparison }}
    </div>
    
    <!-- Operation History -->
    <div v-if="operations.length > 0" class="demo-section" style="margin-top: 1rem;">
      <h4>Recent Operations:</h4>
      <div v-for="(op, index) in operations.slice(-5)" :key="index" class="result">
        {{ op }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import kairos from '@oxog/kairos';

interface Props {
  baseDate: any;
}

const props = defineProps<Props>();

const amount = ref(1);
const unit = ref('days');
const calculatedDate = ref(props.baseDate.clone());
const operations = ref<string[]>([]);

const difference = computed(() => {
  return calculatedDate.value.duration(props.baseDate);
});

const comparison = computed(() => {
  if (calculatedDate.value.isSame(props.baseDate)) {
    return 'Same as base';
  } else if (calculatedDate.value.isAfter(props.baseDate)) {
    return 'After base';
  } else {
    return 'Before base';
  }
});

function addTime() {
  const newDate = calculatedDate.value.add(amount.value, unit.value);
  calculatedDate.value = newDate;
  
  operations.value.push(
    `Added ${amount.value} ${unit.value} → ${newDate.format('YYYY-MM-DD HH:mm')}`
  );
}

function subtractTime() {
  const newDate = calculatedDate.value.subtract(amount.value, unit.value);
  calculatedDate.value = newDate;
  
  operations.value.push(
    `Subtracted ${amount.value} ${unit.value} → ${newDate.format('YYYY-MM-DD HH:mm')}`
  );
}

function reset() {
  calculatedDate.value = props.baseDate.clone();
  operations.value.push('Reset to base date');
}
</script>