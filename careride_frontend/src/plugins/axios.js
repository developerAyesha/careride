import Cookies from "js-cookie";
import axios from "axios";
import store from "@/store";
import router from "@/router";

axios.defaults.baseURL = process.env.VUE_APP_BACKEND_API;
axios.defaults.headers.get["Accept"] = "application/json";

axios.defaults.headers.common["X-Requested-With"] = "XMLHttpRequest";

axios.interceptors.request.use((config) => {
  const token = Cookies.get("token");

  if (token) {
    config.headers.common.Authorization = "Bearer " + token;
  }

  return config;
});

axios.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const {
      config,
      // eslint-disable-next-line no-unused-vars
      response: { status, data },
    } = error;
    const originalRequest = config;
    // Return any error which is not due to authentication back to the calling service
    if (status !== 401) {
      return new Promise((resolve, reject) => {
        reject(error);
      });
    }
    // logout and return error when authentication and credentials are wrong
    if (status === 401 && originalRequest.url.includes("api-token")) {
      store.dispatch("logout").then(() => {
        router.push("/login");
      });
      return Promise.reject(error);
    }
    // Try to refresh an existing token : user pushed the reload button on browser
    // this situation should not happen as reload is managed in router
    if (status === 401 && store.getters.authorized) {
      store
        .dispatch("reload")
        .then((response) => {
          console.log(response);
          router.push(originalRequest.url);
        })
        .catch((error) => {
          console.log(error);
          router.push("/login");
        });
    }
    // default for all others 401
    return Promise.reject(error);
  }
);

store.$axios = axios;
