<template>
  <section class="section-partner">
    <div class="container-fluid">
      <h1 class="section-title text-center text-lg-left">
        Become <i>our partner</i>
      </h1>
      <div class="row">
        <div class="col-lg-6">
          <p class="section-text">
            As we continue to grow, we're always on the lookout for certified
            NEMT drivers and companies to join CareRide Technologies (CareRide). Become our vendor to
            enjoy the perks:
          </p>
          <ul class="section-list">
            <li>Highly secure booking process</li>
            <li>Transparent & competitive price</li>
            <li>Access to more clients</li>
            <li>Better community visibility</li>
            <li>Mission-driven team</li>
          </ul>
          <div class="text-center text-lg-left">
            <router-link to="/partner" class="btn btn-primary btn-mw-220"
              >Let's be partners</router-link
            >
          </div>
        </div>
        <div class="col-lg-6 text-center text-lg-left">
          <img
            :src="require('@/assets/images/landing/partner.jpg')"
            alt=""
            class="img-fluid mt-4 mt-lg-0"
          />
        </div>
      </div>
    </div>
  </section>
</template>

<script>
export default {};
</script>

<style lang="scss" scoped></style>
