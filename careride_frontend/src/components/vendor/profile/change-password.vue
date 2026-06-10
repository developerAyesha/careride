<template>
  <div>
    <h3 class="section-title my-3">
      The changes you make in that block don't need to be reviewed. Changes will
      be applied immediately.
    </h3>

    <div class="row my-0 mt-md-3">
      <div class="col-sm-12 col-xl-4">
        <h3 class="header-title">Change Password</h3>

        <b-alert
          :variant="msg.type"
          dismissible
          class="mt-3"
          v-model="msg.has"
          :show="msg.text"
          >{{ msg.text }}</b-alert
        >

        <div class="card mb-0">
          <div class="card-body">
            <div class="form-group mb-2">
              <label for="vendor-password">Old Password</label>
              <div class="input-group input-group-merge">
                <input
                  v-model="form.password"
                  :type="showPassword ? 'text' : 'password'"
                  id="vendor-password"
                  class="form-control"
                  placeholder="Enter old password"
                  :class="{
                    'is-invalid': submitted && $v.form.password.$error,
                  }"
                />
                <div
                  class="input-group-append"
                  @click="showPassword = !showPassword"
                  role="button"
                >
                  <div class="input-group-text">
                    <span
                      v-if="showPassword"
                      class="material-symbols-rounded fz-18"
                      >visibility</span
                    >
                    <span v-else class="material-symbols-rounded fz-18"
                      >visibility_off</span
                    >
                  </div>
                </div>
                <div
                  v-if="submitted && $v.form.password.$error"
                  class="invalid-feedback"
                >
                  <div v-if="!$v.form.password.required">
                    Old Password is required
                  </div>
                  <div v-if="!$v.form.password.minLength">Passwords min 8</div>
                  <div v-if="!$v.form.password.maxLength">Passwords max 16</div>
                  <div v-if="!$v.form.password.valid">
                    Passwords is not valid, must include: A-Z, a-z, 0-9,
                    #?!@$%^&*-
                  </div>
                </div>
              </div>
            </div>

            <div class="form-group mb-2">
              <label for="vendor-newpassword">New Password</label>
              <div class="input-group input-group-merge">
                <input
                  v-model="form.newpassword"
                  :type="showNewpassword ? 'text' : 'password'"
                  id="vendor-newpassword"
                  class="form-control"
                  placeholder="Enter New Password"
                  :class="{
                    'is-invalid': submitted && $v.form.newpassword.$error,
                  }"
                />
                <div
                  class="input-group-append"
                  @click="showNewpassword = !showNewpassword"
                  role="button"
                >
                  <div class="input-group-text">
                    <span
                      v-if="showNewpassword"
                      class="material-symbols-rounded fz-18"
                      >visibility</span
                    >
                    <span v-else class="material-symbols-rounded fz-18"
                      >visibility_off</span
                    >
                  </div>
                </div>
                <div
                  v-if="submitted && $v.form.newpassword.$error"
                  class="invalid-feedback"
                >
                  <div v-if="!$v.form.newpassword.required">
                    New Password is required
                  </div>
                  <div v-if="!$v.form.newpassword.minLength">
                    Passwords min 8
                  </div>
                  <div v-if="!$v.form.newpassword.maxLength">
                    Passwords max 16
                  </div>
                  <div v-if="!$v.form.newpassword.valid">
                    Passwords is not valid, must include: A-Z, a-z, 0-9,
                    #?!@$%^&*-
                  </div>
                </div>
              </div>
            </div>

            <div class="form-group mb-0">
              <label for="vendor-renewpassword">Confirm New Password</label>
              <div class="input-group input-group-merge">
                <input
                  v-model="form.renewpassword"
                  :type="showRenewpassword ? 'text' : 'password'"
                  id="vendor-renewpassword"
                  class="form-control"
                  placeholder="Confirm New Password"
                  :class="{
                    'is-invalid': submitted && $v.form.renewpassword.$error,
                  }"
                />
                <div
                  class="input-group-append"
                  @click="showRenewpassword = !showRenewpassword"
                  role="button"
                >
                  <div class="input-group-text">
                    <span
                      v-if="showRenewpassword"
                      class="material-symbols-rounded fz-18"
                      >visibility</span
                    >
                    <span v-else class="material-symbols-rounded fz-18"
                      >visibility_off</span
                    >
                  </div>
                </div>
                <div
                  v-if="submitted && $v.form.renewpassword.$error"
                  class="invalid-feedback"
                >
                  <div v-if="!$v.form.renewpassword.sameAsPassword">
                    Passwords are not matched
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="text-center text-md-left my-3">
      <button
        class="btn btn-outline-primary mw-230"
        @click.prevent="handleSubmit"
        :disabled="trySubmit"
      >
        Change password
      </button>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import urls from "@/urls";
import {
  required,
  minLength,
  maxLength,
  sameAs,
} from "vuelidate/lib/validators";
import { mapState, mapGetters } from "vuex";

export default {
  components: {},
  data() {
    return {
      msg: {
        has: false,
        type: "",
        text: "",
      },

      form: {
        password: "",
        newpassword: "",
        renewpassword: "",
      },

      showPassword: false,
      showNewpassword: false,
      showRenewpassword: false,

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

      rules.password = {
        required,
        minLength: minLength(8),
        maxLength: maxLength(16),
        valid: this.validPass,
      };

      rules.newpassword = {
        required,
        minLength: minLength(8),
        maxLength: maxLength(16),
        valid: this.validPass,
      };

      rules.renewpassword = {
        required,
        sameAsPassword: sameAs("newpassword"),
      };

      return rules;
    },
  },
  methods: {
    validPass(value) {
      const containsUppercase = /[A-Z]/.test(value);
      const containsLowercase = /[a-z]/.test(value);
      const containsNumber = /[0-9]/.test(value);
      const containsSpecial = /[#?!@$%^&*-]/.test(value);
      return (
        containsUppercase &&
        containsLowercase &&
        containsNumber &&
        containsSpecial
      );
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

        try {
          await axios({
            method: "post",
            url: urls.URL_VENDOR_CHANGE_PASSWORD,
            data: {
              password: this.form.password,
              newpassword: this.form.newpassword,
            },
          });

          this.msg.has = true;
          this.msg.type = "success";
          this.msg.text = "Change password successfully!";
        } catch (error) {
          console.log("Error: ", error);

          this.msg.has = true;
          this.msg.type = "danger";
          this.msg.text = "Change password error ...";

          if (error.response?.status) {
            if (error.response.statusText) {
              this.msg.text = `Error: ${error.response.status} ${error.response.statusText}`;
            } else if (error.response.data?.detail) {
              this.msg.text = `Error: ${error.response.status} ${error.response.data.detail}`;
            } else if (error.response.data?.error) {
              this.msg.text = `Error: ${error.response.status} ${error.response.data.error}`;
            }
          }
        } finally {
          this.trySubmit = false;
        }
      }
    },
  },
};
</script>
<style lang="scss" scoped>

</style>
