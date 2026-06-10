<template>
  <div class="page-landing">
    <Header class="page-landing-header" />
    <div class="page-landing-content">
      <slot />

      <!-- <div>
        <pre>user: {{ user }}</pre>
      </div> -->
      <!-- <div>
        <pre>client: {{ client }}</pre>
      </div> -->
    </div>
    <Footer class="page-landing-footer" />
  </div>
</template>

<script>
import { mapState, mapGetters } from "vuex";
import Header from "@/components/landing/header";
import Footer from "@/components/landing/footer";

export default {
  components: {
    Header,
    Footer,
  },
  data() {
    return {};
  },
  computed: {
    ...mapGetters(["authorized", "user", "client"]),
  },
};
</script>

<style scoped lang="scss" src="@/assets/scss/landing.scss"></style>
