<template>
  <span class="app-icon" v-html="icon" />
</template>

<script>
import icons from "@/assets/icons";

export default {
  props: {
    name: { type: String, required: true },
    size: { type: String, default: "md" }
  },
  computed: {
    icon() {
      return icons[this.name] || "";
    }
  }
};
</script>

<style scoped>
.app-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.sm svg { width: 14px; height: 14px; }
.md svg { width: 18px; height: 18px; }
.lg svg { width: 24px; height: 24px; }
</style>