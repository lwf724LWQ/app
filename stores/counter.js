// stores/counter.js
// 为实现更多高级用法，你甚至可以使用一个函数 (与组件 setup() 类似) 来定义一个 Store：
import { ref } from 'vue';
import {apiTicketQuery} from "@/api/apis.js"
import { defineStore } from 'pinia';
export const useCounterStore = defineStore('counter', () => {
	const List=ref([]);
	const queryParams = {
	  page:1,
	  limit:107,
	   tname:'排列5'
	}
   //请求数据
	const getCounterInfo=async ()=>{
		const res=await apiTicketQuery(queryParams)
		console.log(res.data.records)
		List.value=res.data.records
	}
	//以对象的形式返回它
	return{
		List
	}
});

