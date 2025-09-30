import App from './App'
import vuex from 'vuex'

const platform = uni.getSystemInfoSync().platform;

const isH5 = platform === 'web'|| platform === 'windows'||platform === 'mac';//判断是否是h5环境中
const isApp = platform === 'android' || platform === 'ios';//判断小程序是否是安卓或者苹果环境中
console.log(vuex)




//如果是vue3环境下（文件从这里进去的）
// #ifdef VUE3
import * as Pinia from 'pinia';
// import '@dcloudio/uni-icons/css/uni-icons.css';
import { createSSRApp } from 'vue'
export function createApp() {
  const app = createSSRApp(App)
  app.use(Pinia.createPinia())
  return {
    app,
	Pinia
  }
}
// #endif

export { isH5, isApp };//导出判断h5或者app