<template>
  <Layout>
    <div class="mx-auto mb-3">
      <h1 class="display-3 mb-3">About us</h1>

      <div class="page-content">
        <div class="row">
          <div class="col-xl-5">
            <p>
              CareRide Technologies (CareRide) is the platform that connects
              certified NEMT drivers and companies with people who have mobility
              challenges, empowering the latter with freedom and independence in
              their daily lives.
            </p>

            <h4>Our Mission</h4>

            <p>
              To make the world more accessible and inclusive &ndash; one ride
              at a time.
            </p>

            <h4>Our Values</h4>

            <p>
              Our values guide every major decision we make as a company and
              help us find like-minded people to join our team. Whenever in
              doubt, the following things serve as our guiding light.
            </p>

            <ul>
              <li>We listen</li>
              <li>We truly care</li>
              <li>We empower</li>
              <li>We go extra mile</li>
            </ul>
          </div>
          <div class="col-xl-7 text-center text-xl-left">
            <img
              src="@/assets/images/landing/about/about-1.jpg"
              :alt="$appConfig.title"
              class="img-fluid mb-4 mb-xl-0"
            />
          </div>
        </div>
        <div class="row">
          <div class="col-xl-7 order-xl-2">
            <h4>The story behind CareRide</h4>

            <p>
              Like most good ideas, this one was inspired by a personal story.
              One of our founders, Jenny, used to take care of booking
              accessible transportation for her patients and some family
              members. Naturally, she would try to find the best available
              pricing to help them financially, so she would call a number of
              local companies to check on availability and compare prices. At
              some point came a realization of how to make the process easier
              for everyone involved &ndash; patients, caregivers, certified
              companies and drivers. That's how CareRide was born.
            </p>

            <p>
              <b
                >Since day one, CareRide's been busy doing exactly what the name
                suggests &ndash; taking care and giving rides.
              </b>
            </p>
          </div>
          <div class="col-xl-5 order-xl-1 text-center">
            <img
              src="@/assets/images/landing/about/about-2.jpg"
              :alt="$appConfig.title"
              class="img-fluid mb-4 mb-xl-0"
            />
          </div>
        </div>
      </div>
    </div>
  </Layout>
</template>

<script>
import Layout from "@/views/layouts/main";

export default {
  metaInfo() {
    return {
      title: this.$appConfig.title + " | About us",
    };
  },
  components: {
    Layout,
  },
  data() {
    return {};
  },
  created() {},
  methods: {},
};
</script>
<style scoped lang="scss"></style>
