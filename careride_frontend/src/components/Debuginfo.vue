<template>
  <div class="debug-box" v-if="debug">
    <button @click.prevent="showDebug = !showDebug" class="debug-box-btn">Toggle debug info</button>
    <div v-if="showDebug">
      <slot />
    </div>
  </div>
</template>
  
<script>

export default {
  name: 'Debuginfo',
  data: () => ({
    showDebug: false,
  }),
  computed: {
    debug() {
      return process.env.VUE_APP_DEBUG_INFO
    },
  },
}
</script>
  
<style lang="scss" scoped>
.debug-box {
  position: fixed;
  z-index: 11111111;
  background: #fff;
  right: 0;
  top: 0;
  max-width: 50vw;
  max-height: 50vh;
  overflow: auto;

  &.static {
    position: static;
  }
}

.debug-box-btn {
  position: fixed;
  top: 0;
  right: 0;
  opacity: .2;

  .static & {
    position: static;
    opacity: 1;
  }

  &:hover {
    opacity: 1;
  }
}
</style>
  