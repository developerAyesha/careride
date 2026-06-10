<template>
  <Layout>
    <div class="row align-items-center text-center page-headline mb-4">
      <div class="col-12 col-md-auto text-md-left">
        <h1 class="display-3">
          {{ isEdit ? "Personal info (Editing)" : "Personal info" }}
        </h1>
      </div>
      <div class="col-12 col-md-auto text-md-right ml-md-auto">
        <!-- edit -->
        <button
          v-if="!isEdit"
          class="btn btn-primary btn-ico ml-2"
          @click.prevent="
            isEdit = true;
            msg.has = false;
          "
          title="Edit"
        >
          <span class="material-symbols-rounded"> edit </span>
        </button>

        <!-- save -->
        <button
          v-if="isEdit"
          class="btn btn-primary btn-ico ml-2"
          @click.prevent="saveInfoChanges"
          title="Save changes"
          :disabled="trySubmit"
        >
          <span class="material-symbols-rounded"> done </span>
        </button>

        <!-- cancel -->
        <button
          v-if="isEdit"
          class="btn btn-outline-primary btn-ico ml-2"
          @click.prevent="cancelInfoChanges"
          title="Cancel"
        >
          <span class="material-symbols-rounded"> close </span>
        </button>
      </div>
    </div>

    <!-- NOT attached stripe acc -->
    <!-- <stripeAccBtn v-if="user.stripe_acc_complete" /> -->
    <notAttachStripeMsg v-if="!user.stripe_acc_complete" />

    <b-alert
      :variant="msg.type"
      dismissible
      class="mt-3"
      v-model="msg.has"
      :show="msg.text"
      >{{ msg.text }}</b-alert
    >

    <div v-if="loading" class="loader-box">
      <b-spinner variant="primary" />
    </div>

    <changeInfo
      ref="changeInfo"
      :vendor="vendor"
      :is-edit="isEdit"
      @reset="loadVendor"
      @updated="updatedInfo"
      :key="`key-changeInfo-${refresh}`"
    />

    <template v-if="!isEdit">
      <hr />

      <changeServices
        :vendor="vendor"
        @reset="loadVendor"
        :key="`key-changeServices-${refresh}`"
      />

      <hr />

      <changePassword />
    </template>

    <!-- <pre>vendor: {{ vendor }}</pre> -->
  </Layout>
</template>

<script>
import Layout from "@/views/layouts/main";
import axios from "axios";
import urls from "@/urls";
import Swal from "sweetalert2";
import {
  required,
  minLength,
  maxLength,
  sameAs,
} from "vuelidate/lib/validators";
import { mapState, mapGetters } from "vuex";
import changeInfo from "@/components/vendor/profile/change-info";
import changeServices from "@/components/vendor/profile/change-services";
import changePassword from "@/components/vendor/profile/change-password";
import stripeAccBtn from "@/components/vendor/stripe-acc-btn";
import notAttachStripeMsg from "@/components/vendor/not-attach-stripe-msg";

export default {
  metaInfo() {
    return {
      title: this.$appConfig.title + " | Vendor | Personal info",
    };
  },
  components: {
    Layout,
    changeInfo,
    changeServices,
    changePassword,
    stripeAccBtn,
    notAttachStripeMsg,
  },
  data() {
    return {
      loading: false,

      msg: {
        has: false,
        type: "",
        text: "",
      },

      isEdit: false,

      vendor: null,
      refresh: 0,

      trySubmit: false,
    };
  },
  validations() {
    return {
      formPassword: this.formRulesPassword,
    };
  },
  created() {
    this.loadVendor(1);
    // this.showModalCheckInfo();
  },
  computed: {
    ...mapGetters(["user"]),
  },
  methods: {
    async loadVendor(loader = false) {
      if (loader) {
        this.loading = true;
      }

      this.msg = {
        has: false,
        type: "",
        text: "",
      };

      try {
        const response = await axios.post(urls.URL_VENDOR_INFO, {
          id: this.user.id,
        });
        // console.log("loadVendor, response: ", response);
        this.vendor = response.data.user;
        this.refresh += 1;
      } catch (error) {
        console.log("loadVendor, error: ", error);

        this.msg.has = true;
        this.msg.type = "danger";
        this.msg.text = "loadVendor error...";

        if (error.response?.data?.error && error.response?.status) {
          this.msg.text = `Error: ${error.response.status} ${error.response.data.error}`;
        } else if (error.response?.status || error.response?.statusText) {
          this.msg.text = `Error: ${error.response.status} ${error.response.statusText}`;
        }
      } finally {
        if (loader) {
          this.loading = false;
        }
      }
    },
    saveInfoChanges() {
      this.$refs.changeInfo.submitForm();
    },
    cancelInfoChanges() {
      this.isEdit = false;
    },
    showModalCheckInfo() {
      Swal.fire({
        imageUrl: require("@/assets/images/vendor-changed.svg"),
        imageHeight: 185,
        imageAlt: "",
        html: "Your changes is being checked by an administrator. It may take some time before they are applied and you have access to the functionality again.",
        showCloseButton: true,
        showCancelButton: false,
        showConfirmButton: false,
      });
    },
    updatedInfo(files = false) {
      if (files) {
        this.loadVendor();
      } else {
        this.isEdit = false;
        this.showModalCheckInfo();
      }
    },
  },
};
</script>
<style lang="scss" scoped>
:deep .section-title {
  font-size: 18px;
  font-weight: 400;
  color: #505655;
  margin: 0;
  padding: 0;
}
</style>
