<template>
  <div class="preloader">
    <b-spinner class="preloader-grow preloader-grow-1" type="grow" />
    <b-spinner class="preloader-grow preloader-grow-2" type="grow" />
    <b-spinner class="preloader-grow preloader-grow-3" type="grow" />
    <b-spinner class="preloader-grow preloader-grow-2" type="grow" />
    <b-spinner class="preloader-grow preloader-grow-1" type="grow" />
  </div>
</template>

<script>
export default {};
</script>

<style lang="scss">
.preloader {
  display: flex;
  justify-content: center;
  align-items: center;
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  background: #fff;
  z-index: 9999;
  opacity: 1;
  pointer-events: none;
  transition: opacity 0.15s linear;

  &-grow {
    background-color: #199f97 !important;
    margin: 0 12px;
  }

  &-grow-1 {
    width: 20px !important;
    height: 20px !important;
  }

  &-grow-2 {
    width: 40px !important;
    height: 40px !important;
  }

  &-grow-3 {
    width: 60px !important;
    height: 60px !important;
  }

  &.preloader-hide {
    opacity: 0;
  }
}
</style>
