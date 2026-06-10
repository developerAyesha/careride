<template>
  <form action="#" @submit.prevent="handleSubmit">
    <template v-if="!inline">
      <div class="common-modal-headline">
        <h4 class="common-modal-title">Contact us</h4>
        <span
          class="material-symbols-rounded common-modal-close"
          @click="$emit('onClose')"
        >
          close
        </span>
      </div>

      <hr class="my-3" />
    </template>

    <b-alert
      :variant="msg.type"
      dismissible
      class="mt-3"
      v-model="msg.has"
      :show="msg.text"
      >{{ msg.text }}</b-alert
    >

    <div class="form-group mb-3">
      <label for="contact-email">Email</label>
      <div class="input-group input-group-merge">
        <input
          v-model="form.email"
          id="contact-email"
          class="form-control"
          placeholder="Enter your email"
          :class="{
            'is-invalid': submitted && $v.form.email.$error,
          }"
        />
        <div v-if="submitted && $v.form.email.$error" class="invalid-feedback">
          <div v-if="!$v.form.email.required">Email is required</div>
          <div v-if="!$v.form.email.email">Email is invalid</div>
        </div>
      </div>
    </div>

    <div class="form-group mb-3">
      <label for="contact-message">Message</label>
      <div class="input-group input-group-merge">
        <textarea
          v-model="form.message"
          class="form-control form-control-textarea"
          :class="{
            'is-invalid': submitted && $v.form.message.$error,
          }"
          :maxlength="1024"
          rows="3"
          placeholder="Enter message. Message has a limit of 1024 chars."
        ></textarea>
        <div class="form-control-textarea-counter">
          <div
            v-if="form.message"
            class="badge"
            :class="{
              'badge-success': form.message.length !== 1024,
              'badge-danger': form.message.length === 1024,
            }"
          >
            {{ form.message.length }} / 1024
          </div>
        </div>
        <div
          v-if="submitted && $v.form.message.$error"
          class="invalid-feedback"
        >
          <div v-if="!$v.form.message.required">Message is required</div>
          <div v-if="!$v.form.message.minLength">Min is 3</div>
          <div v-if="!$v.form.message.maxLength">Max is 1024</div>
        </div>
      </div>
    </div>

    <div
      class="form-group mb-3"
      :class="inline ? 'text-center text-lg-right' : 'text-center text-md-left'"
    >
      <vue-recaptcha
        ref="recaptcha"
        @verify="onVerify"
        @expired="onExpired"
        :sitekey="sitekey"
        class="d-inline-block"
        :class="{
          'is-invalid': submitted && $v.form.token.$error,
        }"
      >
      </vue-recaptcha>
      <div v-if="submitted && $v.form.token.$error" class="invalid-feedback">
        Check captcha please
      </div>
    </div>

    <hr v-if="!inline" class="mt-2 mb-1" />

    <div
      class="mt-3"
      :class="inline ? 'text-center text-lg-right' : 'text-center text-md-left'"
    >
      <!-- <div class="mt-3 text-center text-md-left"> -->
      <button
        class="btn btn-primary btn-mw-220"
        type="submit"
        :disabled="trySubmit"
      >
        Send message
      </button>
    </div>
  </form>
</template>

<script>
import { VueRecaptcha } from "vue-recaptcha";
import axios from "axios";
import urls from "@/urls";
import {
  required,
  minLength,
  maxLength,
  email,
} from "vuelidate/lib/validators";

export default {
  components: { VueRecaptcha },
  props: {
    inline: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      msg: {
        has: false,
        type: "",
        text: "",
      },

      form: {
        email: "",
        message: "",
        token: "",
      },

      submitted: false,
      trySubmit: false,
    };
  },
  validations() {
    return {
      form: this.formRules,
    };
  },
  created() {},
  computed: {
    formRules() {
      let rules = {};

      rules.email = {
        required,
        email,
      };

      rules.message = {
        required,
        minLength: minLength(3),
        maxLength: maxLength(1024),
      };

      rules.token = {
        required,
      };

      return rules;
    },
    sitekey() {
      return process.env.VUE_APP_GCAPTCHA_V2_SITE_KEY;
    },
  },
  methods: {
    onVerify: function (response) {
      console.log("Verify: " + response);
      this.form.token = response;
    },
    onExpired: function () {
      console.log("Expired");
      this.form.token = "";
    },
    async handleSubmit() {
      this.submitted = true;
      this.msg = {
        has: false,
        type: "",
        text: "",
      };

      this.$v.$touch();

      if (this.$v.$invalid) {
        return;
      } else {
        this.trySubmit = true;
        this.errorMsg = null;

        // common fields
        const formData = {
          email: this.form.email,
          message: this.form.message,
          token: this.form.token,
        };

        console.log("Contact, formData: ", formData);

        try {
          await axios({
            method: "post",
            url: urls.URL_FEEDBACK,
            data: formData,
          });

          this.msg.has = true;
          this.msg.type = "success";
          this.msg.text = "Contact form send successfully";

          this.inprogress = false;

          this.$emit("onSubmit");
        } catch (error) {
          // console.log("Error: ", error);

          this.msg.has = true;
          this.msg.type = "danger";
          this.msg.text = "Error on send contact form ...";

          if (error.response?.status) {
            if (error.response.statusText) {
              this.msg.text = `Error: ${error.response.status} ${error.response.statusText}`;
            } else if (error.response.data?.detail) {
              this.msg.text = `Error: ${error.response.status} ${error.response.data.detail}`;
            } else if (error.response.data?.error) {
              this.msg.text = `Error: ${error.response.status} ${error.response.data.error}`;
            }
          }

          this.inprogress = false;
        } finally {
          this.trySubmit = false;
        }
      }
    },
  },
};
</script>
<style scoped lang="scss">
.form-control-textarea {
  min-height: 92px;
}

.form-control-textarea-counter {
  width: 100%;
  clear: both;
  position: absolute;
  bottom: -10px;
  text-align: center;
  z-index: 11;
}

.badge {
  line-height: 12px;
  height: auto;
  padding: 4px 6px;
}
</style>
