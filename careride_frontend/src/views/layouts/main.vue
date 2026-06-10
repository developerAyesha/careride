<template>
  <Vertical layout="vertical" class="layout-main">
    <slot />

    <!-- <div>
      <pre>authorized: {{ authorized }}</pre>
    </div> -->
    <!-- <div>
      <pre>$store.getters.userRoles: {{ $store.getters.userRoles }}</pre>
    </div> -->
    <!-- <div>
      <pre>user: {{ user }}</pre>
    </div> -->
    <!-- <div>
      <pre>client: {{ client }}</pre>
    </div> -->
    <!-- <div>
      <pre>vendor: {{ vendor }}</pre>
    </div> -->
    <!-- <div>
      <pre>driver: {{ driver }}</pre>
    </div> -->
  </Vertical>
</template>

<script>
import { mapState, mapGetters } from "vuex";
import Vertical from "./vertical";

export default {
  components: {
    Vertical,
  },
  data() {
    return {};
  },
  computed: {
    ...mapGetters(["authorized", "user", "client", "vendor", "driver"]),
  },
};
</script>
