export default {
  menuState: false,
  token: "",
  userLoading: true,
  user: {
    email: "",
    name: "",
    roles: null,
  },
  opt: null,
  routeData: null,
  client: {
    currenttime: "",
    orderstatuses: "",
    orderlist: "",
    // currentorders: null,
    // historyorders: null,
    modalWaitOrderAccept: false,
    modalOrderAccepted: false,
    
    orderpreset: null,
  }, 
  driver: {
    orderlist: null,
    lastorders: null,
  },
  vendor: {
    orderlist: null,
    changes: null,
  },
};
