<template>
  <section class="section-contacts">
    <div class="container-fluid">
      <div class="row">
        <div class="col-sm-12 col-md-8 col-lg-6 col-xl-6 mx-auto mx-xl-0">
          <div class="d-flex flex-column h-100">
            <h1 class="section-title text-center text-lg-left">
              Got <br class="d-none d-lg-inline" />
              <i>questions?</i>
            </h1>
            <p class="section-text section-text-bold my-0 mt-auto">
              Check our <router-link to="/faq">FAQ</router-link> page <br />or
              get in touch via contact form
            </p>
          </div>
        </div>
        <div class="col-sm-12 col-md-8 col-lg-6 col-xl-6 mx-auto mx-xl-0">
          <div class="section-contacts-form mt-4 mt-lg-0">
            <formContacts inline />
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
import formContacts from "@/components/form-contacts";

export default {
  components: {
    formContacts,
  },
};
</script>

<style lang="scss" scoped></style>
