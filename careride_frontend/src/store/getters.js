export default {
  authorized: (state) => !!state.token,
  menuState: (state) => state.menuState,
  userLoading: (state) => state.userLoading,
  user: (state) => state.user,
  userRoles: (state) => [state.user.role],
  opt: (state) => state.opt,
  routeData: (state) => state.routeData,
  client: (state) => state.client,  
  driver: (state) => state.driver,  
  vendor: (state) => state.vendor,  
};
