<template>
  <footer class="landing-footer">
    <div class="container-fluid text-center text-lg-left">
      <navigation in-footer />
      <div class="row my-3">
        <div class="col-12 col-lg-6 additional-links my-2 my-lg-0">
          <router-link to="/terms" class="mx-2 ml-lg-0 mr-lg-3">
            Terms & Conditions
          </router-link>
          <router-link to="/policy" class="mx-2 ml-lg-0 mr-lg-3">
            Privacy Policy
          </router-link>
        </div>
        <div class="col-12 col-lg-6 text-center text-lg-right copyright">
          {{ new Date().getFullYear() }} &copy; {{ $appConfig.title }}. All rights reserved
        </div>
      </div>
    </div>
  </footer>
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
.landing-footer {
  background: #293331;
  width: 100%;
  padding: 64px 0;

  @media (max-width: 991.98px) {
    padding: 40px 0 20px 0;
    margin-bottom: -80px;
  }
}

.landing-footer .copyright {
  font-size: 14px;
  font-weight: 400;
  color: #acb4b8;
}

.landing-footer .additional-links a {
  color: #fff;
  text-decoration: none;

  &:hover {
    color: #199f97;
    text-decoration: none;
  }
}
</style>
