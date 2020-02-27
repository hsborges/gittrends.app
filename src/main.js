import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import VueCookies from "vue-cookies";
import VueAnalytics from "vue-analytics";

import "./assets/styles/index.css";

Vue.config.productionTip = false;

Vue.use(VueCookies);
Vue.use(VueAnalytics, { id: process.env.VUE_APP_GA_ID });

new Vue({
  router,
  render: (h) => h(App)
}).$mount("#app");
