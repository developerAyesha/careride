<template>
  <header class="landing-header">
    <navigation />
  </header>
</template>

<script>
import navigation from "@/components/landing/navigation";

export default {
  components: { navigation },
  data() {
    return {};
  },
  computed: {},
  methods: {},
};
</script>

<style lang="scss" scoped>
.landing-header {
  position: absolute;
  z-index: 11;
  top: 0;
  left: 0;
  width: 100%;
  height: 70px;
  background: #1f2726b2;

  :deep .header-logo img {
    position: relative;
    top: -2px;
    margin-left: 30px;
  }
}
</style>
