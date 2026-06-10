<template>
  <div id="app" class="app" :class="{ 'sidebar-enable': menuState }">
    <Preloader :class="{ 'preloader-hide': isHide }" />
    <Topbar />
    <router-view />
  </div>
</template>

<script>
import store from "@/store";
import { mapState, mapGetters } from "vuex";
import Preloader from "@/components/preloader";
import Topbar from "@/components/Topbar";

export default {
  components: {
    Preloader,
    Topbar,
  },
  created() {},
  updated() {
    this.isHide = true;
  },
  data() {
    return {
      isHide: false,
    };
  },
  computed: {
    ...mapGetters(["menuState"]),
  },
};
</script>

<style lang="scss"></style>
