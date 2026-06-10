<template>
  <Vertical layout="vertical">
    <div class="row align-items-center auth-box">
      <div class="col-lg-8 col-xl-6 auth-box-content">
        <slot />
      </div>
      <div
        class="col-lg-4 col-xl-6 align-self-stretch d-none d-lg-block auth-box-bg"
      >
        &nbsp;
      </div>
    </div>
  </Vertical>
</template>

<script>
import Vertical from "./vertical";

export default {
  components: {
    Vertical,
  },
  data() {
    return {};
  },
};
</script>

<style lang="scss" scoped>
.auth-box {
  @media (min-width: 992px) {
    min-height: calc(100vh - 70px - 70px);
    margin: 0 -27px;
  }

  &-bg {
    background: url("~@/assets/images/bg-auth.jpg") 0 50% no-repeat;
    background-size: cover;
  }
}
</style>
