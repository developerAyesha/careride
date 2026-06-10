<template>
  <div class="bk-steps">
    <div
      v-for="(label, i) in steps"
      :key="i"
      class="bk-step"
      :class="{ 'bk-step--done': current > i + 1, 'bk-step--active': current === i + 1 }"
    >
      <!-- line drawn before the circle so it's underneath -->
      <div v-if="i < steps.length - 1" class="bk-step-line" />
      <div class="bk-step-circle">
        <span v-if="current > i + 1" class="material-symbols-rounded">check</span>
        <span v-else>{{ i + 1 }}</span>
      </div>
      <div class="bk-step-label">{{ label }}</div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    current: { type: Number, default: 1 },
  },
  data() {
    return {
      steps: [
        'Trip Information',
        'Patient Information',
        'Review Pricing',
        'Matching',
        'Ride Matched + Payment',
        'Payment Success',
      ],
    };
  },
};
</script>

<style lang="scss" scoped>
$teal: #199f97;
$white: #fff;
$inactive-circle: #FFFFFF4D;
$inactive-border:  rgba(255,255,255,.35);
$inactive-label:   rgba(255,255,255,.55);
$done-circle: rgba(255,255,255,.85);
$active-circle: $white;

.bk-steps {
  display: flex;
  width: 100%;
  flex: 1;  
  min-width: 100%; 
  align-items: flex-start;
  margin-bottom: 20px;
  overflow-x: auto;
  padding: 4px 0 12px;
  scrollbar-width: none;
  &::-webkit-scrollbar { display: none; }
}

.bk-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  flex: 1;
}

.bk-step-line {
  position: absolute;
  top: 16px;
  left: calc(50% + 17px);
  width: calc(100% - 34px);
  height: 5px;
  background: #B4DCDA;
  z-index: 0;
  transition: background .25s;
}

.bk-step-circle {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #B4DCDA;
  color: #747574;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  font-family: 'Montserrat', sans-serif;
  position: relative;
  z-index: 1;
  transition: all .2s ease;
  flex-shrink: 0;
  .material-symbols-rounded { font-size: 14px; }
}

.bk-step-label {
  margin-top: 8px;
  font-size: 11px;
  font-weight: 500;
  color: rgba(255,255,255,.75);
  text-align: center;
  line-height: 1.3;
  font-family: 'Montserrat', sans-serif;
  transition: color .2s, font-weight .2s;
  max-width: 90px;
  word-break: break-word;

  @media (max-width: 600px) {
    font-size: 10px;
    max-width: 68px;
  }
}

.bk-step--done {
  .bk-step-circle {
    background: #199F97;
    border: 4px solid #B4DCDA;
    color: #ffffff;
    font-weight: 800
  }
  .bk-step-label { color: rgba(255,255,255,.85); font-weight: 600; }
  .bk-step-line  { background: rgba(255,255,255,.35); }
}

.bk-step--active {
  .bk-step-circle {
    background: #199F97;
    color: white;
    border: 4px solid #B4DCDA;
    font-weight: 800;
  }
  .bk-step-label { color: $white; font-weight: 700; }
}

@media (max-width: 600px) {
  .bk-step-label {
    display: none;
  }

  .bk-step--active .bk-step-label {
    display: block;
  }
}
</style>
