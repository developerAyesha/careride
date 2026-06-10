export default {
  logout(state) {
    state.token = "";
    state.user = "";

    state.client.currenttime = "";
    state.client.orderstatuses = "";
    state.client.orderlist = "";
    // state.client.currentorders = null;
    // state.client.historyorders = null;
    state.client.modalWaitOrderAccept = false;
    state.client.modalOrderAccepted = false;

    state.driver.orderlist = null;
    state.driver.lastorders = null;
    state.vendor.orderlist = null;
    state.vendor.changes = null;
  },

  authSuccess(state, { token }) {
    state.token = token;
  },

  userLoading(state, data) {
    state.userLoading = data;
  },

  user(state, user) {
    state.user = user;
  },

  setSysOpt(state, payload) {
    state.opt = payload;
  },

  setRouteData(state, payload) {
    state.routeData = payload;
  },

  currenttime(state, currenttime) {
    state.client.currenttime = currenttime;
  },

  orderstatuses(state, payload) {
    state.client.orderstatuses = payload;
  },

  orderlist(state, payload) {
    state.client.orderlist = payload;
  },

  // currentorders(state, currentorders) {
  //   state.client.currentorders = currentorders;
  // },

  // historyorders(state, historyorders) {
  //   state.client.historyorders = historyorders;
  // },

  orderpreset(state, orderpreset) {
    state.client.orderpreset = orderpreset;
  },

  // modalWaitOrderAccept(state, on) {
  //   // console.log("Mutation: modalWaitOrderAccept, on: ", on);
  //   state.client.modalWaitOrderAccept = on;
  // },

  // modalOrderAccepted(state, on) {
  //   // console.log("Mutation: modalOrderAccepted, on: ", on);
  //   state.client.modalOrderAccepted = on;
  // },

  toggleMenu(state) {
    state.menuState = !state.menuState;
  },

  closeMenu(state) {
    state.menuState = false;
  },

  driverOrderlist(state, orderlist) {
    state.driver.orderlist = orderlist;
  },

  driverLastorders(state, lastorders) {
    state.driver.lastorders = lastorders;
  },

  vendorOrderlist(state, orderlist) {
    state.vendor.orderlist = orderlist;
  },

  vendorChanges(state, changes) {
    state.vendor.changes = changes;
  },
};
