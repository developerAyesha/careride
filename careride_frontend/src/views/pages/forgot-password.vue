<template>
  <Auth>
    <div class="row justify-content-center my-5 my-lg-auto">
      <div class="col-sm-8 col-md-10 col-xl-8">
        <div class="signup-headline mb-3">
          <h1 class="display-3 my-0">Forgot Password</h1>
          <div class="signup-headline-step">{{ step }}/3</div>
        </div>

        <!-- 1 -->
        <form v-if="step === 1" action="#" @submit.prevent="sendCode">
          <div class="card">
            <div class="card-body p-3">
              <b-alert
                :variant="msg.type"
                dismissible
                class="mt-3"
                v-model="msg.has"
                :show="msg.text"
                >{{ msg.text }}</b-alert
              >
              <div class="signup-msg mb-3">
                Enter your phone number and we will send you a confirmation code
                to verify it.
              </div>
              <div class="form-group mb-0">
                <label for="user-login">Phone Number</label>
                <input
                  class="form-control"
                  v-model="step1.login"
                  v-mask="'+1 ##########'"
                  placeholder="+1 ##########"
                  id="user-login"
                  @paste="onPhonePaste"
                  :class="{ 'is-invalid': submitted && $v.step1.login.$error }"
                />
                <div
                  v-if="submitted && $v.step1.login.$error"
                  class="invalid-feedback"
                >
                  <span v-if="!$v.step1.login.required"
                    >Phone Number is required field</span
                  >
                </div>
              </div>
            </div>
          </div>

          <div class="mt-4">
            <button
              class="btn btn-primary btn-block w-100"
              type="submit"
              :disabled="trySubmit"
            >
              Send code
            </button>
          </div>
        </form>

        <!-- 2 -->
        <form v-if="step === 2" action="#" @submit.prevent="checkCode">
          <div class="card">
            <div class="card-body p-3">
              <b-alert
                :variant="msg.type"
                dismissible
                class="mt-3"
                v-model="msg.has"
                :show="msg.text"
                >{{ msg.text }}</b-alert
              >
              <div class="signup-msg mb-3">
                Verification code was sent to phone number
                <br />
                <b>{{ this.step1.login }}</b>
              </div>
              <div class="form-group mb-0">
                <label for="user-code_1">Code</label>
                <div class="row">
                  <div class="col-3">
                    <input
                      class="form-control form-control-code"
                      v-model="step2.code_1"
                      maxlength="1"
                      placeholder="_"
                      id="user-code_1"
                      ref="user-code_1"
                      @input="moveToNextField($event, 'user-code_2')"
                      :class="{
                        'is-invalid': submitted && $v.step2.code_1.$error,
                      }"
                    />
                  </div>
                  <div class="col-3">
                    <input
                      class="form-control form-control-code"
                      v-model="step2.code_2"
                      maxlength="1"
                      placeholder="_"
                      ref="user-code_2"
                      @input="moveToNextField($event, 'user-code_3')"
                      :class="{
                        'is-invalid': submitted && $v.step2.code_2.$error,
                      }"
                    />
                  </div>
                  <div class="col-3">
                    <input
                      class="form-control form-control-code"
                      v-model="step2.code_3"
                      maxlength="1"
                      placeholder="_"
                      ref="user-code_3"
                      @input="moveToNextField($event, 'user-code_4')"
                      :class="{
                        'is-invalid': submitted && $v.step2.code_3.$error,
                      }"
                    />
                  </div>
                  <div class="col-3">
                    <input
                      class="form-control form-control-code"
                      v-model="step2.code_4"
                      maxlength="1"
                      placeholder="_"
                      ref="user-code_4"
                      :class="{
                        'is-invalid': submitted && $v.step2.code_4.$error,
                      }"
                    />
                  </div>
                </div>
                <div
                  v-if="
                    (submitted && $v.step2.code_1.$error) ||
                    $v.step2.code_2.$error ||
                    $v.step2.code_3.$error ||
                    $v.step2.code_4.$error
                  "
                  class="invalid-feedback"
                  :class="{
                    'd-block':
                      (submitted && $v.step2.code_1.$error) ||
                      $v.step2.code_2.$error ||
                      $v.step2.code_3.$error ||
                      $v.step2.code_4.$error,
                  }"
                >
                  Code is required field
                </div>
              </div>
            </div>
          </div>

          <div class="mt-4">
            <button
              class="btn btn-primary btn-block w-100"
              type="submit"
              :disabled="trySubmit"
            >
              Verification
            </button>
          </div>
        </form>

        <!-- 3 -->
        <form v-if="step === 3" action="#" @submit.prevent="setPass">
          <div class="card">
            <div class="card-body p-3">
              <b-alert
                :variant="msg.type"
                dismissible
                class="mt-3"
                v-model="msg.has"
                :show="msg.text"
                >{{ msg.text }}</b-alert
              >
              <div class="signup-msg mb-3">
                Create your unique password. It must contain:
                <ul>
                  <li>at least 8 characters</li>
                  <li>both uppercase and lowercase letters</li>
                  <li>both letters and numbers</li>
                  <li>at least one special symbol</li>
                </ul>
              </div>
              <div class="form-group mb-3">
                <label for="user-passw" class="required">Password</label>
                <div class="input-group input-group-merge">
                  <input
                    v-model="step3.passw"
                    :type="showPassw ? 'text' : 'password'"
                    id="user-passw"
                    class="form-control"
                    placeholder="Enter your password"
                    :class="{
                      'is-invalid': submitted && $v.step3.passw.$error,
                    }"
                  />
                  <div
                    class="input-group-append"
                    @click="showPassw = !showPassw"
                    role="button"
                  >
                    <div class="input-group-text">
                      <span
                        v-if="showPassw"
                        class="material-symbols-rounded fz-18"
                        >visibility</span
                      >
                      <span v-else class="material-symbols-rounded fz-18"
                        >visibility_off</span
                      >
                    </div>
                  </div>
                  <div
                    v-if="submitted && $v.step3.passw.$error"
                    class="invalid-feedback"
                  >
                    <div v-if="!$v.step3.passw.required">
                      Password is required
                    </div>
                    <div v-if="!$v.step3.passw.minLength">Passwords min 8</div>
                    <div v-if="!$v.step3.passw.maxLength">Passwords max 16</div>
                    <div v-if="!$v.step3.passw.valid">
                      Passwords is not valid, must include: A-Z, a-z, 0-9,
                      #?!@$%^&*-
                    </div>
                  </div>
                </div>
              </div>

              <div class="form-group mb-0">
                <label for="user-repassw" class="required"
                  >Confirm Password</label
                >
                <div class="input-group input-group-merge">
                  <input
                    v-model="step3.repassw"
                    :type="showRepassw ? 'text' : 'password'"
                    id="user-repassw"
                    class="form-control"
                    placeholder="Confirm your password"
                    :class="{
                      'is-invalid': submitted && $v.step3.repassw.$error,
                    }"
                  />
                  <div
                    class="input-group-append"
                    @click="showRepassw = !showRepassw"
                    role="button"
                  >
                    <div class="input-group-text">
                      <span
                        v-if="showRepassw"
                        class="material-symbols-rounded fz-18"
                        >visibility</span
                      >
                      <span v-else class="material-symbols-rounded fz-18"
                        >visibility_off</span
                      >
                    </div>
                  </div>
                  <div
                    v-if="submitted && $v.step3.repassw.$error"
                    class="invalid-feedback"
                  >
                    <div v-if="!$v.step3.repassw.required">
                      Confirm Password is required
                    </div>
                    <div v-if="!$v.step3.repassw.sameAsPassword">
                      Passwords are not matched
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="mt-4">
            <button
              class="btn btn-primary btn-block w-100"
              type="submit"
              :disabled="trySubmit"
            >
              Change password
            </button>
          </div>
        </form>
      </div>
    </div>
  </Auth>
</template>

<script>
import Auth from "@/views/layouts/auth";
import { formatLogin, pasteAsLoginDisplay } from "@/helpers/phone";
import axios from "axios";
import urls from "@/urls";
import Swal from "sweetalert2";
import {
  required,
  minLength,
  maxLength,
  sameAs,
} from "vuelidate/lib/validators";

export default {
  metaInfo() {
    return {
      title: this.$appConfig.title + " | Forgot password",
    };
  },
  components: {
    Auth,
  },
  data() {
    return {
      step: 1,
      reset_token: "",

      msg: {
        has: false,
        type: "",
        text: "",
      },

      submitted: false,
      trySubmit: false,

      step1: {
        login: "",
      },

      step2: {
        code_1: "",
        code_2: "",
        code_3: "",
        code_4: "",
      },

      step3: {
        passw: "",
        repassw: "",
      },

      showPassw: false,
      showRepassw: false,
    };
  },
  validations: {
    step1: {
      login: {
        required,
      },
    },
    step2: {
      code_1: {
        required,
        minLength: minLength(1),
        maxLength: maxLength(1),
      },
      code_2: {
        required,
        minLength: minLength(1),
        maxLength: maxLength(1),
      },
      code_3: {
        required,
        minLength: minLength(1),
        maxLength: maxLength(1),
      },
      code_4: {
        required,
        minLength: minLength(1),
        maxLength: maxLength(1),
      },
    },
    step3: {
      passw: {
        required,
        valid: function (value) {
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
        minLength: minLength(8),
        maxLength: maxLength(16),
      },
      repassw: {
        required,
        sameAsPassword: sameAs("passw"),
      },
    },
  },
  created() {},
  methods: {
    onPhonePaste(evt) {
      const formatted = pasteAsLoginDisplay(evt);
      if (formatted) this.step1.login = formatted;
    },
    moveToNextField(e, ref) {
      if (e.data) {
        this.$refs[ref].focus();
      }
    },
    showModalSuccess(url = "/login?tab=user") {
      Swal.fire({
        imageUrl: require("@/assets/images/forgot-password-success.svg"),
        imageHeight: 173,
        imageAlt: "",
        html: "Congratulations, you have changed password! Now you can login with the new password.",
        showCloseButton: true,
        showCancelButton: false,
        showConfirmButton: true,
        confirmButtonText: "Log in",
        customClass: {
          confirmButton: "btn btn-primary mt-0 mb-2",
        },
      }).then((result) => {
        if (result.isConfirmed) {
          this.$router.push(url);
        }
      });
    },
    async sendCode() {
      // console.log("sendCode()...");
      this.submitted = true;
      this.msg = {
        has: false,
        type: "",
        text: "",
      };

      this.$v.step1.$touch();

      if (this.$v.step1.$invalid) {
        return;
      } else {
        this.trySubmit = true;

        try {
          const url =
            this.$route.query.tab === "vendor"
              ? urls.URL_VENDOR_FORGOT_PASSWORD
              : urls.URL_USER_FORGOT_PASSWORD;

          const response = await axios({
            method: "post",
            url,
            data: { login: formatLogin(this.step1.login) },
          });
          // console.log("1 sendCode(), response: ", response);

          if (response.data.result === 1) {
            this.step = 2;
          }
        } catch (error) {
          // console.log("Error: ", error);
          this.msg.has = true;
          this.msg.type = "danger";
          this.msg.text = "Restore password, step 1 error...";

          if (error.response?.data?.error && error.response?.status) {
            this.msg.text = `Error: ${error.response.status} ${error.response.data.error}`;
          } else if (error.response?.status || error.response?.statusText) {
            this.msg.text = `Error: ${error.response.status} ${error.response.statusText}`;
          }
        } finally {
          this.trySubmit = false;
        }
      }
    },
    async checkCode() {
      // console.log("checkCode()...");
      this.submitted = true;
      this.msg = {
        has: false,
        type: "",
        text: "",
      };

      this.reset_token = "";

      this.$v.step2.$touch();

      if (this.$v.step2.$invalid) {
        return;
      } else {
        this.trySubmit = true;

        const login = this.step1.login.replace(/[^0-9]/g, ""); // remove all except numbers
        const code =
          "" +
          this.step2.code_1 +
          this.step2.code_2 +
          this.step2.code_3 +
          this.step2.code_4;

        const url =
          this.$route.query.tab === "vendor"
            ? urls.URL_VENDOR_PASSWORD
            : urls.URL_USER_PASSWORD;

        try {
          const response = await axios({
            method: "post",
            url,
            data: { login, code },
          });
          // console.log("2 checkCode(), response: ", response);

          if (response.data.result === 1) {
            this.step = 3;
            this.reset_token = response.data.reset_token;
          }
        } catch (error) {
          // console.log("Error: ", error);
          this.msg.has = true;
          this.msg.type = "danger";
          this.msg.text = "Restore password, step 2 error...";

          if (error.response?.data?.error && error.response?.status) {
            this.msg.text = `Error: ${error.response.status} ${error.response.data.error}`;
          } else if (error.response?.status || error.response?.statusText) {
            this.msg.text = `Error: ${error.response.status} ${error.response.statusText}`;
          }
        } finally {
          this.trySubmit = false;
        }
      }
    },
    async setPass() {
      // console.log("sendData()...");
      this.submitted = true;
      this.msg = {
        has: false,
        type: "",
        text: "",
      };

      this.$v.step3.$touch();

      if (this.$v.step3.$invalid) {
        return;
      } else {
        this.trySubmit = true;

        const login = this.step1.login;
        const reset_token = this.reset_token;
        const password = this.step3.passw;

        const url =
          this.$route.query.tab === "vendor"
            ? urls.URL_VENDOR_PASSWORD
            : urls.URL_USER_PASSWORD;

        try {
          const response = await axios({
            method: "put",
            url,
            data: { login, reset_token, password },
          });
          // console.log("1 sendData(), response: ", response);

          if (response.data.result === 1) {
            if (response.data.user?.role === "v") {
              this.showModalSuccess("/login?tab=vendor");
            } else {
              this.showModalSuccess("/login?tab=user");
            }
          }
        } catch (error) {
          // console.log("Error: ", error);
          this.msg.has = true;
          this.msg.type = "danger";
          this.msg.text = "Restore password, step 3 error...";

          if (error.response?.data?.error && error.response?.status) {
            this.msg.text = `Error: ${error.response.status} ${error.response.data.error}`;
          } else if (error.response?.status || error.response?.statusText) {
            this.msg.text = `Error: ${error.response.status} ${error.response.statusText}`;
          }
        } finally {
          this.trySubmit = false;
        }
      }
    },
  },
};
</script>

<style lang="scss" scoped></style>
