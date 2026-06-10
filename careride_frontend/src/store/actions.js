import Cookies from "js-cookie";
import urls from "@/urls";

export default {
  removeAuthCookies() {
    Cookies.remove("token");
  },

  storeAuthCookies(_, data) {
    Cookies.set("token", data.token, { sameSite: "strict" });
  },

  loadAuthStateFromCookies({ commit }) {
    // console.log("try loadAuthStateFromCookies ...");
    let token = Cookies.get("token");
    if (typeof token === "undefined") {
      commit("logout");
      // throw "unable to load auth cookies";
    } else {
      commit("authSuccess", { token });
    }
  },

  // removeLangCookies() {
  //   Cookies.remove("lang");
  // },

  // storeLangCookies(_, lang) {
  //   Cookies.set("lang", lang, { sameSite: "strict" });
  // },

  // loadLangFromCookies({ commit }) {
  //   console.log("loadLangFromCookies...");

  //   let lang = Cookies.get("lang");
  //   if (typeof lang !== "undefined") {
  //     commit("setlang", lang);
  //   }
  // },

  user(context, user) {
    context.commit("user", user);
  },

  async login({ commit }, { url, login, password }) {
    try {
      const response = await this.$axios.post(url, { login, password });

      const token = response.data.token;
      commit("authSuccess", { token });
      this.dispatch("storeAuthCookies", { token });

      commit("user", response.data.user);
      commit("orderstatuses", response.data.orderstatuses);
      // commit("currentorders", response.data.currentorders);
      // commit("historyorders", response.data.historyorders);
      commit("userLoading", false);

      this.dispatch("fetchClientOrderlist");

      return response;
    } catch (err) {
      commit("logout");
      throw err;
    }
  },

  async logout({ commit }) {
    // console.log("action logout ...");
    commit("setRouteData", null);
    commit("logout");
    this.dispatch("removeAuthCookies");
  },

  async reload({ getters }) {
    await this.dispatch("fetchSysOpt"); // fire any reload
    await this.dispatch("loadAuthStateFromCookies");
    if (getters.authorized) {
      await this.dispatch("fetchUserData");
    }
  },

  async fetchUserData({ commit, getters }, loader = true) {
    // console.log("try, fetchUserData...");

    try {
      if (loader) commit("userLoading", true);
      const { data } = await this.$axios.get(urls.URL_PROFILE);
      // console.log("fetchUserData, data: ", data);
      commit("user", data.user);

      // if user - customer
      if (getters.user.role === "c") {
        await this.dispatch("fetchUserDataCustomer");
      }

      // if user - driver
      if (getters.user.role === "d") {
        await this.dispatch("fetchDriverOrders");
      }

      // if user - vendor
      if (getters.user.role === "v") {
        await this.dispatch("fetchVendorNewOrdersAndChanges");
      }
    } catch (error) {
      console.dir(error);
      this.dispatch("logout");
    } finally {
      if (loader) commit("userLoading", false);
    }
  },

  async fetchUserDataCustomer({ commit, getters }, loader = true) {
    // console.log("try, fetchUserDataCustomer...");
    try {
      if (loader) commit("userLoading", true);
      const { data } = await this.$axios.get(urls.URL_USER_PROFILE);
      // console.log("fetchUserDataCustomer, data: ", data);
      commit("currenttime", data.currenttime);
      commit("orderstatuses", data.orderstatuses);
      // commit("currentorders", data.currentorders);
      // commit("historyorders", data.historyorders);
    } catch (error) {
      console.dir(error);
      this.dispatch("logout");
    } finally {
      if (loader) commit("userLoading", false);
    }
  },

  async fetchClientOrderlist({ commit, getters }) {
    
    if (getters.authorized && getters.user?.role === "c") {
      // console.log("try, fetchClientOrderlist...");
      try {
        const { data } = await this.$axios({
          method: "get",
          url: urls.URL_ORDER_CURRENT,
        });

        // console.log("fetchClientOrderlist, response: ", response);
        commit("orderlist", data.order_list);

      } catch (error) {
        console.log('orderlist, error: ', error);
      }
    }
  },

  async fetchSysOpt({ commit }) {
    // console.log("fetchSysOpt...");
    try {
      const { data } = await this.$axios(urls.URL_SYSTEM_OPT);
      commit("setSysOpt", data.opt);
    } catch (error) {
      console.log('fetchSysOpt, error: ', error);
    }
  },

  // status: 0-new, 1=accepted, 3=work
  async fetchVendorOrders(param = { page: 0, onpage: 999, status: 0 }) {
    try {
      const response = await this.$axios.post(urls.URL_VENDOR_ORDER_LIST, {
        ...param,
      });
      return response;
    } catch (err) {
      throw err;
    }
  },

  async fetchVendorNewOrdersAndChanges({ commit, getters }) {
    try {
      const { data } = await this.dispatch("fetchVendorOrders");
      commit("vendorOrderlist", data.orderlist.items);
      commit("vendorChanges", data.changes.items);
    } catch (err) {
      throw err;
    }
  },

  async fetchDriverOrders({ commit }) {
    try {
      const { data } = await this.$axios.get(urls.URL_DRIVER_ORDERS);
      // console.log("fetchDriverOrders, data: ", data);
      commit("driverOrderlist", data.order_list.items);
      commit("driverLastorders", data.lastorders);
    } catch (err) {
      throw err;
    }
  },

  async fetchClientOrderpreset({ commit }) {
    // console.log("fetchClientOrderpreset...");
    try {
      const { data } = await this.$axios.get(urls.URL_CLIENT_ORDER_PRESETS);
      commit("orderpreset", data.orderpreset_list.items);
      // console.log("fetchClientOrderpreset... data.orderpreset_list: ", data.orderpreset_list);
    } catch (err) {
      throw err;
    }
  },

  async detachOrder({ commit, getters }, data = { id: null, role: "c" }) {
    // console.log("try, detachOrder, data.id: ", data.id);
    // console.log("try, detachOrder, data.role: ", data.role);

    if (!data.id) {
      return;
    }

    let url = urls.URL_ORDER_DETACH;
    let order_id = data.id;

    if (data.role === "d") {
      url = urls.URL_DRIVER_ORDER_DETACH;
    } else if (data.role === "v") {
      url = urls.URL_VENDOR_ORDER_READED;
      order_id = [data.id];
    }

    // console.log("url: ", url);
    // console.log("order_id: ", order_id);

    try {
      await this.$axios.post(url, {
        order_id,
      });
    } catch (error) {
      console.log('detachOrder, error: ', error);
    }
  },

  async clientCancelOrder({ }, id = null) {
    if (!id) {
      return `Cancel order id is - Null`;
    }

    try {
      const response = await this.$axios({
        method: "delete",
        url: urls.URL_ORDER_CURRENT,
        data: { id },
      });
      return response;
    } catch (err) {
      throw err;
    }
  },

  getFile({ }, file) {
    // console.log("getFile, file: ", file);

    this.$axios({
      url: urls.URL_GET_FILE,
      method: "POST",
      responseType: "blob",
      data: {
        fname: file.path,
      },
    })
      .then((response) => {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", file.name);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      })
      .catch(function (error) {
        console.log('getFile, error: ', error.toJSON());
      });
  },
};
