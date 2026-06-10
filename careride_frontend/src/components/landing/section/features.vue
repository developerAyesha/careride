<template>
  <section class="section-features">
    <!-- <div class="features-carousel">
      <VueSlickCarousel v-bind="settings">
        <div class="features-carousel-item">
          <img
            :src="require('@/assets/images/landing/features-screens/1.jpg')"
            alt=""
            width="882px"
          />
        </div>
        <div class="features-carousel-item">
          <img
            :src="require('@/assets/images/landing/features-screens/2.jpg')"
            alt=""
            width="882px"
          />
        </div>
        <div class="features-carousel-item">
          <img
            :src="require('@/assets/images/landing/features-screens/3.jpg')"
            alt=""
            width="882px"
          />
        </div>
      </VueSlickCarousel>
    </div> -->

    <div class="container-fluid">
      <div class="features-list">
        <div v-for="(feat, i) in features" :key="i" class="features-list-item">
          <div class="features-list-item-ico">
            <img :src="feat.ico" alt="" class="" />
          </div>
          <div class="features-list-item-title">{{ feat.title }}</div>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
import VueSlickCarousel from "vue-slick-carousel";
import "vue-slick-carousel/dist/vue-slick-carousel.css";

export default {
  components: {
    VueSlickCarousel,
  },
  data() {
    return {
      settings: {
        centerMode: true,
        centerPadding: "30px",
        focusOnSelect: true,
        infinite: true,
        dots: false,
        arrows: false,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        touchThreshold: 5,
        variableWidth: true,
        autoplay: true,
        autoplaySpeed: 5000,
        adaptiveHeight: true,
      },
      features: [
        {
          ico: require("@/assets/images/landing/features-ico/1.svg"),
          title: "Easy and secure car request",
        },
        {
          ico: require("@/assets/images/landing/features-ico/2.svg"),
          title: "Secure door-to-door transportation",
        },
        {
          ico: require("@/assets/images/landing/features-ico/3.svg"),
          title: "Comfy rides with licensed drivers ",
        },
        {
          ico: require("@/assets/images/landing/features-ico/4.svg"),
          title: "Transparent pricing model ",
        },
      ],
    };
  },
};
</script>

<style lang="scss" scoped>
.features-carousel {
  :deep .slick-slider {
  }
}

.features-carousel-item {
  width: 942px !important; // 882px;
  padding: 0 30px 20px 30px;

  @media (max-width: 1200px) {
    width: 642px !important;
  }

  @media (max-width: 768px) {
    width: 482px !important;
  }
}

.features-carousel-item img {
  border-radius: 3px;
  box-shadow: 0px 4px 14px rgba(48, 51, 48, 0.2);
  pointer-events: none;
  width: 100%;
  height: auto;
}
</style>
