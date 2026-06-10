<template>
  <section class="section-feedbacks">
    <div class="container-fluid">
      <div class="row align-items-center text-center">
        <div class="col-lg-6 text-lg-left">
          <h1 class="section-title mb-0">Feedbacks</h1>
        </div>
        <div class="col-lg-6 text-lg-right">
          <div v-if="feedbacks.length" class="simple-carousel-pager mt-3 mt-lg-0">
            <button
              class="simple-carousel-pager-btn"
              @click="$refs.feedbacksCarousel.prev()"
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
              @click="$refs.feedbacksCarousel.next()"
            >
              <span class="material-symbols-rounded v-middle">
                chevron_right
              </span>
            </button>
          </div>
        </div>
      </div>

      <div v-if="feedbacks.length" class="feedbacks-carousel">
        <VueSlickCarousel
          v-bind="settings"
          ref="feedbacksCarousel"
          @init="updatePager"
          @afterChange="updatePager"
        >
          <div v-for="feed in feedbacks" :key="feed.id">
            <div class="feedbacks-carousel-item">
              <div class="feedbacks-carousel-item_title">
                {{ feed.title }}
              </div>
              <div class="feedbacks-carousel-item_text">
                {{ feed.text }}
              </div>
              <div class="feedbacks-carousel-item_author text-right mt-auto">
                - {{ feed.author }}
              </div>
              <div class="feedbacks-carousel-item_type text-right">
                {{ feed.type }}
              </div>
            </div>
          </div>
        </VueSlickCarousel>
      </div>
    </div>
  </section>
</template>

<script>
import VueSlickCarousel from "vue-slick-carousel";
import "vue-slick-carousel/dist/vue-slick-carousel.css";
import feedbacksData from "@/components/landing/data/feedbacks";

export default {
  components: {
    VueSlickCarousel,
  },
  data() {
    return {
      feedbacks: feedbacksData,
      settings: {
        infinite: false,
        dots: false,
        arrows: false,
        speed: 500,
        slidesToShow: 2,
        slidesToScroll: 2,
        touchThreshold: 5,
        // autoplay: true,
        // autoplaySpeed: 5000,
        // adaptiveHeight: true,
        responsive: [
          {
            breakpoint: 992,
            settings: {
              slidesToShow: 1,
              slidesToScroll: 1,
            },
          },
        ],
      },
      carouselPage: 1,
      carouselPages: Math.max(Math.ceil(feedbacksData.length / 2), 1),
    };
  },
  methods: {
    updatePager(index = 0) {
      if (window.innerWidth <= 992) {
        this.carouselPage = index + 1;
        this.carouselPages = this.feedbacks.length;
      } else {
        this.carouselPage = Math.trunc(index / 2) + 1;
        this.carouselPages = Math.ceil(this.feedbacks.length / 2);
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.feedbacks-carousel {
  overflow: hidden;

  :deep {
    .slick-slider {
      margin: 60px -30px 0 -30px;
    }

    // .slick-track {
    //   display: flex;
    //   flex-direction: row;
    //   flex-wrap: nowrap;
    //   justify-content: flex-start;
    //   align-content: stretch;
    //   align-items: stretch;
    // }

    // .slick-slide {
    //   float: none;
    //   height: 100%;
    //   min-height: 100%;
    // }
  }
}

.feedbacks-carousel-item {
  padding: 32px;
  background: #f8f8f8;
  margin: 0 30px;
  display: flex;
  flex-direction: column;
  min-height: 480px;

  @media (min-width: 1300px) {
    min-height: 420px;
  }

  &_title {
    font-weight: 600;
    font-size: 24px;
    display: block;
    color: #293331;
    margin-bottom: 30px;
    position: relative;
    padding: 10px 0 0 26px;
  }

  &_title::before {
    content: "";
    background: url("~@/assets/images/landing/quote.png") 50% 50% no-repeat;
    background-size: cover;
    position: absolute;
    top: -24px;
    left: -21px;
    width: 40px;
    height: 40px;
  }

  &_text {
    font-weight: 400;
    font-size: 20px;
    color: #505655;
    margin-bottom: 30px;
  }

  &_author {
    font-family: "Montserrat", sans-serif;
    font-weight: 600;
    font-size: 30px;
    color: #199f97;
    margin-bottom: 6px;
  }

  &_type {
    font-weight: 400;
    font-size: 20px;
    color: #acb4b8;
  }
}
</style>
