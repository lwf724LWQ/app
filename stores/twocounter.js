import { ref } from 'vue';
import {apiTicketQuery} from "@/api/apis.js"
import { defineStore } from 'pinia';
export const usetwoCounterStore = defineStore('twocounter', () => {
	const List=ref([]);
	const queryParams = {
	  page:1,
	  limit:107,
	   tname:'排列5'
	}

   //请求数据
//转换成drawLine需要的数组形式
	const getCounterInfo=async ()=>{
		  try {
		        const res = await apiTicketQuery(queryParams);
		        console.log("原始数据:", res.data.records);
		        // 转换数据
		        List.value = convertData(res.data.records);
				List.value=List.value.reverse();//反转以下，不然会以期数为降序排列
		        console.log("转换后数据:", List.value);
		    } catch (error) {
		        console.error("获取数据失败:", error);
		    }
	}
	//转换方法
	const convertData = (originalData) => {
	    return originalData.map(item => {
	        // 将issueno转换为数字作为qishu
	        const qishu = parseInt(item.issueno);
	        // 将number字符串分割为数字数组
	        const numbers = item.number.split(' ').map(Number);
	        // 计算前四个数字之和作为qishu2
	        const qishu2 = numbers.slice(0, 4).reduce((sum, num) => sum + num, 0);
			const newNumbers = [qishu2, ...numbers];
	        return {
	            qishu: qishu,
	            numbers: newNumbers
	        };
	    });
	}
	//以对象的形式返回它
	return{
		List,
		getCounterInfo
	}
});