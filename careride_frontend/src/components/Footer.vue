<template>
  <footer class="footer">
    <div class="container-fluid">
      <div class="row align-items-center text-center">
        <div class="col-md-6 text-md-left my-2">
          {{ new Date().getFullYear() }} &copy; {{ $appConfig.title }}. All rights reserved
        </div>
        <div class="col-md-6 text-md-right my-2">
          Email: support@careride.com
          <a
            href="#"
            @click.prevent="showModal = true"
            class="btn btn-outline-secondary mx-3 ml-md-3 mr-md-0 my-2 my-md-0"
            >Contact us</a
          >
        </div>
      </div>
    </div>

    <b-modal v-model="showModal" hide-header hide-footer centered>
      <formContacts @onClose="showModal = false" />
    </b-modal>
  </footer>
</template>
<script>
import formContacts from "@/components/form-contacts";

export default {
  components: {
    formContacts,
  },
  data() {
    return {
      showModal: false,
    };
  },
};
</script>
