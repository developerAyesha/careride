<template>
  <section class="section-whatis">
    <div class="section-whatis-bg">
      <div class="container-fluid text-center">
        <h1 class="section-title text-xl-left">
          How does <i>CareRide Technologies</i> work?
        </h1>

        <div class="row mt-3 mt-xl-5 align-items-stretch">
          <div class="col-xl-5 d-flex flex-column text-lg-left">
            <div v-if="currentWhatis" class="carousel-notice">
              <div class="carousel-notice-title">
                {{ currentWhatis.title }}
              </div>
              <div class="carousel-notice-text">
                {{ currentWhatis.text }}
              </div>
            </div>
            <div v-if="whatis.length" class="simple-carousel-pager my-4 mt-xl-auto mb-xl-5">
              <button
                class="simple-carousel-pager-btn"
                @click="$refs.whatisCarousel.prev()"
              >
                <span class="material-symbols-rounded v-middle">
                  chevron_left
                </span>
              </button>
              <div class="simple-carousel-pager-count">
                <span>{{ carouselPage }}</span> / {{ carouselPages }}
              </div>
              <button
                class="simple-carousel-pager-btn"
                @click="$refs.whatisCarousel.next()"
              >
                <span class="material-symbols-rounded v-middle">
                  chevron_right
                </span>
              </button>
            </div>
          </div>
          <div class="col-xl-7">
            <div v-if="whatis.length" class="whatis-carousel">
              <VueSlickCarousel
                v-bind="settings"
                ref="whatisCarousel"
                @init="updatePager"
                @afterChange="updatePager"
              >
                <div
                  v-for="what in whatis"
                  :key="what.id"
                  class="whatis-carousel-item"
                >
                  <img
                    :src="`${what.pic}?v=3`"
                    alt=""
                    class="img-fluid mx-auto m-xl-l-0"
                  />
                </div>
              </VueSlickCarousel>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
import VueSlickCarousel from "vue-slick-carousel";
import "vue-slick-carousel/dist/vue-slick-carousel.css";
import whatisData from "@/components/landing/data/whatis";

export default {
  components: {
    VueSlickCarousel,
  },
  data() {
    return {
      whatis: whatisData,
      settings: {
        dots: false,
        arrows: false,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        touchThreshold: 5,
        // variableWidth: true,
        // centerMode: true,
        // centerPadding: "30px",
        // focusOnSelect: true,
        infinite: true,
        // autoplay: true,
        // autoplaySpeed: 5000,
        // adaptiveHeight: true,
        // responsive: [
        //   {
        //     breakpoint: 992,
        //     settings: {
        //       slidesToShow: 1,
        //       slidesToScroll: 1,
        //     },
        //   },
        // ],
      },
      carouselPage: 1,
      carouselPages: Math.max(whatisData.length, 1),
    };
  },
  computed: {
    currentWhatis() {
      return this.whatis[this.carouselPage - 1] || null;
    },
  },
  methods: {
    updatePager(index = 0) {
      this.carouselPage = index + 1;
      this.carouselPages = this.whatis.length;
    },
  },
};
</script>

<style lang="scss" scoped>
.whatis-carousel {
  margin-bottom: -66px;
}

.whatis-carousel-item {
  padding: 0 20px 20px 20px;
}

.whatis-carousel-item img {
  border-radius: 3px;
  box-shadow: 0px 4px 14px rgba(48, 51, 48, 0.2);
  pointer-events: none;
}

.section-whatis {
  .simple-carousel-pager {
    @media (max-width: 1367px) {
      justify-content: center;
    }
  }
  .simple-carousel-pager-btn {
    background: #fff;
  }

  .carousel-notice-title {
    font-family: "Montserrat", sans-serif;
    font-weight: 600;
    font-size: 30px;
    color: #293331;
    margin: 0 0 36px 0;

    @media (max-width: 768px) {
      font-size: 22px;
    }
  }

  .carousel-notice-text {
    font-weight: 400;
    font-size: 20px;
    color: #505655;

    @media (max-width: 768px) {
      font-size: 18px;
    }
  }
}
</style>
