import Vue from 'vue'
import App from './App.vue'

import ElementUI from 'element-ui'
import VueCookies from 'vue-cookies'
import Axios from 'axios'

import 'element-ui/lib/theme-chalk/index.css';

//挂载
Vue.use(ElementUI);
Vue.use(VueCookies);
Vue.prototype.$http = Axios;

Vue.config.productionTip = false;

new Vue({
  render: h => h(App),
}).$mount('#app');
