<template>
  <Auth>
    <div class="row justify-content-center my-5 my-lg-auto">
      <div class="col-sm-8 col-md-10 col-xl-8">
        <form action="#" @submit.prevent="handleSubmit">
          <h1 class="display-3 mt-0 mb-3">Log in</h1>

          <ul class="nav nav-pills nav-fill">
            <li
              class="nav-item"
              v-for="tab in tabs"
              :key="tab.key"
              @click.stop.prevent="selectTab(tab)"
            >
              <a
                class="nav-link"
                :class="{ active: active.key === tab.key }"
                href="#"
                >{{ tab.key }}</a
              >
            </li>
          </ul>

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
                <label for="login">Phone number</label>
                <input
                  class="form-control"
                  v-model="login"
                  v-mask="'+1 ##########'"
                  placeholder="+1 9493450213 (10 digits after +1)"
                  id="login"
                  :class="{ 'is-invalid': submitted && $v.login.$error }"
                />
                <div
                  v-if="submitted && $v.login.$error"
                  class="invalid-feedback"
                >
                  <span v-if="!$v.login.required"
                    >Phone number is required field</span
                  >
                </div>
              </div>

              <div
                class="form-group"
                :class="[
                  active.key === 'user' || active.key === 'vendor'
                    ? 'mb-3'
                    : 'mb-0',
                ]"
              >
                <label for="password">Password</label>
                <div class="input-group input-group-merge">
                  <input
                    v-model="password"
                    :type="showPassword ? 'text' : 'password'"
                    id="password"
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

              <div
                v-if="active.key === 'user' || active.key === 'vendor'"
                class="form-group mb-0 text-right form-note"
              >
                <router-link :to="`/forgot-password?tab=${active.key}`"
                  >Forgot password?</router-link
                >
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
import { formatLogin } from "@/helpers/phone";
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
      url: "",
      tabs: [],
      active: null,
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
  created() {
    this.setupTabs();
  },
  methods: {
    ...mapActions({
      loginAction: "login",
    }),
    getRedirectPath() {
      const redirect = this.$route.query.redirect;
      if (typeof redirect !== "string") return null;
      if (!redirect.startsWith("/") || redirect.startsWith("//")) return null;
      return redirect;
    },
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
            url: this.active.url,
            login: formatLogin(this.login),
            password: this.password,
          });

          if (response.data?.result) {
            const destination = this.getRedirectPath() || this.active.nextPage;
            await this.$router.push(destination).catch(() => {});
          }

          this.trySubmit = false;
        } catch (error) {
          // console.log("Page login, Error: ", error);
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
    setupTabs() {
      this.tabs = [
        {
          key: "user",
          url: this.$urls.URL_LOGIN_USER,
          nextPage: "/",
        },
        {
          key: "vendor",
          url: this.$urls.URL_LOGIN_VENDOR,
          nextPage: "/vendor/orders/available",
        },
        {
          key: "driver",
          url: this.$urls.URL_LOGIN_DRIVER,
          nextPage: "/driver/order",
        },
      ];

      // get tab from query search
      if (this.$route.query.tab) {
        const tab = this.tabs.find((t) => t.key === this.$route.query.tab);
        if (tab) {
          this.active = tab;
        } else {
          this.selectTab();
        }
      } else {
        this.selectTab();
      }
    },
    selectTab(tab = this.tabs[0]) {
      // by default its first
      this.active = tab;

      const query = { tab: this.active.key };
      if (this.$route.query.redirect) query.redirect = this.$route.query.redirect;
      if (this.$route.query.tab !== this.active.key || this.$route.query.redirect) {
        this.$router.replace({ query });
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.nav-link {
  height: 45px;
  border: none;
  border-radius: 0;
  background: transparent;
  border-top: 2px solid transparent;
  font-family: "Montserrat", sans-serif;
  font-weight: 500;
  font-size: 16px;
  color: #505655;
  text-transform: capitalize;

  &.active {
    border-top-color: #199f97;
    background: #fff;
    color: #199f97;
    font-weight: 600;
  }
}

.card {
  border: none;
  border-radius: 0;
}
</style>
