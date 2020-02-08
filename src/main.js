import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import VueGtag from "vue-gtag";
import VueCookies from "vue-cookies";

import "./assets/styles/index.css";

Vue.config.productionTip = false;

Vue.use(VueGtag, { config: { id: process.env.VUE_APP_GA_ID } }, router);
Vue.use(VueCookies);

new Vue({
  router,
  render: (h) => h(App)
}).$mount("#app");
