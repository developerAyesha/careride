<template>
  <Auth>
    <div class="row justify-content-center my-5 my-lg-auto">
      <div class="col-sm-8 col-md-10 col-xl-8">
        <form action="#" @submit.prevent="handleSubmit">
          <h1 class="display-3 mt-0 mb-3">Log in</h1>

          <div class="card">
            <div class="card-body p-3">
              <b-alert
                variant="danger"
                class="mt-3"
                v-model="isAuthError"
                dismissible
                >{{ authError }}</b-alert
              >
              <div class="form-group mb-3">
                <label for="admin-login">Admin Login</label>
                <input
                  class="form-control"
                  v-model="login"
                  id="admin-login"
                  placeholder="Enter Login"
                  :class="{ 'is-invalid': submitted && $v.login.$error }"
                />
                <div
                  v-if="submitted && $v.login.$error"
                  class="invalid-feedback"
                >
                  <span v-if="!$v.login.required">Login is required field</span>
                </div>
              </div>

              <div class="form-group mb-3">
                <label for="admin-password">Password</label>
                <div class="input-group input-group-merge">
                  <input
                    v-model="password"
                    :type="showPassword ? 'text' : 'password'"
                    id="admin-password"
                    class="form-control"
                    placeholder="Enter password"
                    :class="{ 'is-invalid': submitted && $v.password.$error }"
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
                    v-if="submitted && !$v.password.required"
                    class="invalid-feedback"
                  >
                    Password is required field
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="mt-4">
            <button class="btn btn-primary btn-block w-100" type="submit">
              Log in
            </button>
          </div>
        </form>
      </div>
    </div>
  </Auth>
</template>

<script>
import Auth from "@/views/layouts/auth";
import { mapActions } from "vuex";
import { required } from "vuelidate/lib/validators";

export default {
  metaInfo() {
    return {
      title: this.$appConfig.title + " | Login",
    };
  },
  components: {
    Auth,
  },
  data() {
    return {
      login: "",
      password: "",
      showPassword: false,
      submitted: false,
      authError: null,
      trySubmit: false,
      isAuthError: false,
    };
  },
  validations: {
    login: {
      required,
    },
    password: {
      required,
    },
  },
  methods: {
    ...mapActions({
      loginAction: "login",
    }),
    async handleSubmit() {
      this.submitted = true;
      this.isAuthError = false;

      this.$v.$touch();

      if (this.$v.$invalid) {
        return;
      } else {
        this.trySubmit = true;
        this.authError = null;

        try {
          const response = await this.loginAction({
            url: this.$urls.URL_LOGIN_ADMIN,
            login: this.login,
            password: this.password,
          });

          if (response.data?.result) {
            await this.$router.push("/admin/clients");
          }

          this.trySubmit = false;
        } catch (error) {
          // console.log("Page login admin, Error: ", error);
          this.authError = "Incorrect login info";

          if (!error.response) {
            this.authError = "Error: Network Error";
          } else {
            if (error.response?.data?.error && error.response?.status) {
              this.authError = `Error: ${error.response.status} ${error.response.data.error}`;
            } else if (error.response?.status || error.response?.statusText) {
              this.authError = `Error: ${error.response.status} ${error.response.statusText}`;
            }
          }

          this.trySubmit = false;
          this.isAuthError = true;
        }
      }
    },
  },
};
</script>

<style lang="scss" scoped></style>
