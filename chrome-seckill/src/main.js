// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'

import iView from 'iview'
import 'iview/dist/styles/iview.css'
import VJsoneditor from 'v-jsoneditor'

Vue.config.productionTip = false
Vue.use(iView)
Vue.use(VJsoneditor)
/* eslint-disable no-new */
new Vue({
  el: '#app',
  components: { App },
  template: '<App/>'
})
