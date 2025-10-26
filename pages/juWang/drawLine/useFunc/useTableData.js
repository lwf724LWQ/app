import {
	ref,
	toRaw,
	watch
} from 'vue';
// import {GetListInfo} from '../../../../api/index.js'
// import { useCounterStore } from '@/stores/counter'
// const counter = useCounterStore()
//该文件是生成表格数据
export default function useTableData(child, NumberGroups = null,showNumberSelectorCallback) {
	// 在 useTableData 函数中调用
	const externalData=null;
	console.log('useTableData 被调用，externalData:');
	const ListInfo = ref([]);
	// const getListInfo = () => {
	// 	let res = uni.request({
	// 		url: "http://caimi.s7.tunnelfrp.com/web/ticket/query?tname=排列5&page=1&limit=20"
	// 	}).then(

		// )
		// if(res.data.code===200)
		// {
		// 	ListInfo.value=res.data.data.records
		// 	console.log(res.data.data.records)
		// }
	// }
	// getListInfo()
	// console.log(ListInfo.value)

	// -----------------------------------------------------------
	// 数字组数据（包含期数和随机数）
	const storageDrawLineData = uni.getStorageSync('drawLineData');
	// console.log('storage drawData',storageDrawLineData)
	// console.log("pinia drawData",counter.storeDrawData)

	// const numberGroups = ref([]);
	// numberGroups.value=counter.storeDrawData
	const numberGroups = ref(externalData);
	// 如果外部数据变化，更新 numberGroups
	if (externalData) {
		watch(externalData, (newData) => {
			numberGroups.value = newData;
			console.log(newData)
		});
	}
	//调试信息
	function validateDataFormat(data) {
		if (!Array.isArray(data)) {
			console.warn('数据不是数组:', data);
			return false;
		}

		return data.every(item => {
			const isValid = item &&
				item.hasOwnProperty('qishu') &&
				item.hasOwnProperty('numbers') &&
				Array.isArray(item.numbers) &&
				item.numbers.length === 6;
			if (!isValid) {
				console.warn('数据项格式不正确:', item);
			}

			return isValid;
		});
	}



	// 高亮状态存储：格式为 [{groupIndex: 0, numIndex: 1}, ...]
	const highlighted = ref([]);
	const numberRefs = ref([]);

	// 索引对象，用于单元格点击事件
	const indexes = {
		colIndex: 0,
		groupIndex: 1,
	};

	// function generateNumberGroups() {
	// 	const groups = [];
	// 	for (let qishu = 0; qishu <= 49; qishu++) {
	// 		// 生成1~50的随机数（qishu2）
	// 		const qishu2 = 111;
	// 		// console.log(a)

	// 		// 生成1~9的5个不重复随机数字
	// 		const numbers = [];
	// 		while (numbers.length < 5) {
	// 			const randomNum = Math.floor(Math.random() * 9) + 1;
	// 			if (!numbers.includes(randomNum)) {
	// 				numbers.push(randomNum);
	// 			}
	// 		}

	// 		// 创建包含6个数字的数组：qishu2 + numbers
	// 		const combinedNumbers = [qishu2, ...numbers];

	// 		groups.push({
	// 			qishu,
	// 			numbers: combinedNumbers // 使用合并后的数组
	// 		});

	// 	}
	// 	return setLastFourToEmpty(groups);
	// }
	
	//更新数据与前面的画布一样
	function updateNumberGroups(newData) {
		console.log('updateNumberGroups 被调用，数据:', newData);
		if (validateDataFormat(newData)) {
			// externalData = newData;
			// console.log(externalData[0],'asdddsadsadsadsadsad')
			console.log('数据更新成功');
			return '数据更新成功';
		} 
	}
	
	// // 如果外部数据存在且有效，使用外部数据
	// if (externalData && validateDataFormat(externalData)) {
	// 	console.log('使用有效的外部数据');
	// 	numberGroups.value = externalData;
	// } else {
	// 	console.log('使用默认生成的数字组');
	// 	numberGroups.value = generateNumberGroups();
	// }
	// console.log('numberGroups', numberGroups.value, '这里是随机生成的数据')

	// 将最后四个qishu2设置为空
	//  function setLastFourQishu2ToZero(arr) {
	//      const len = arr.length;
	//      for (let i = Math.max(0, len - 4); i < len; i++) {
	//          arr[i].qishu2 = '';
	//          arr[i].numbers = ['','','','',''];
	// console.log(arr)

	//      }
	//      return arr;
	//  }

	function setLastFourToEmpty(arr) {
		const len = arr.length;
		for (let i = Math.max(0, len - 4); i < len; i++) {
			// 设置所有6个数字为空
			arr[i].numbers = ['', '', '', '', '', ''];
			// console.log(arr)
		}
		return arr;
	}

	// 获取目标行索引（倒数第四行）
	// function getTargetRowIndex() {
	// 	return numberGroups.value.length - 4;
	// }

	// 判断是否为目标行（倒数1~4行）
	function isTargetRow(groupIndex) {
		const totalRows = 23;
		// 检查当前行索引是否在倒数1~4行范围内
		return groupIndex > totalRows - 4 && groupIndex <= totalRows;
	}
	// 处理单元格点击事件
	function handleCellClick(groupIndex, colIndex) {
		// 检查是否为目标行（倒数第四行）且是2~7列
		if (isTargetRow(groupIndex) && colIndex >= 0 && colIndex <= 6) {
			// 这里假设update函数在主组件中定义
			// child.value.showFab = true;
			indexes.colIndex = colIndex;
			indexes.groupIndex = groupIndex;
			showNumberSelectorCallback(indexes.groupIndex,indexes.colIndex);
		}
		toggleHighlight(groupIndex, colIndex);
	}



	// 检查数字是否高亮
	function isHighlighted(groupIndex, numIndex) {
		return highlighted.value.some(item =>
			item.groupIndex === groupIndex && item.numIndex === numIndex
		);
	}

	// 切换数字高亮状态
	function toggleHighlight(groupIndex, numIndex) {
		const highlightIndex = highlighted.value.findIndex(item =>
			item.groupIndex === groupIndex && item.numIndex === numIndex
		);
		if (highlightIndex > -1) {
			// 移除高亮
			highlighted.value.splice(highlightIndex, 1);
		} else {
			// 添加高亮
			highlighted.value.push({
				groupIndex,
				numIndex
			}); //参数表示行，列
			//当空白格高亮时弹出对话框
			if (groupIndex >= 46 && groupIndex <= 49 && numIndex >= 1 && numIndex <= 4) {
				console.log(1);
			}
		}


	}

	// function checkHighlightCondition() {
	//         // 检查46到49行，1到4列是否有高亮的单元格
	//         let found = false;
	//         for (let groupIndex = 46; groupIndex <= 49; groupIndex++) {
	//             for (let numIndex = 1; numIndex <= 4; numIndex++) {
	//                 if (isHighlighted(groupIndex, numIndex)) {
	//                     found = true;
	//                     break;
	//                 }
	//             }
	//             if (found) break;
	//         }
	//         if (found) {
	//             console.log(1);
	//         }
	//     }


	// 处理子组件消息
	// function handleMessage(msg) {
	//     const { colIndex, groupIndex } = indexes;
	//     // 列索引转换：2列对应qishu2，3-7列对应numbers数组
	//     if (colIndex === 1) {
	//         // 第2列 - qishu2
	//         numberGroups.value[groupIndex].qishu2 = msg;
	//     } else {
	//         // 第3-7列 - numbers数组（索引0-4）
	//         const numIndex = colIndex - 2;
	//         numberGroups.value[groupIndex].numbers[numIndex] = msg;
	//     }
	// }
	function handleMessage(msg) {
		const {
			colIndex,
			groupIndex
		} = indexes;
		// 直接更新对应位置的数字
		numberGroups.value[groupIndex].numbers[colIndex] = msg;
	}
	//=-------------------------------
	function validateDataFormat(data) {
		if (!Array.isArray(data)) return false;

		return data.every(item => {
			return item.hasOwnProperty('qishu') &&
				item.hasOwnProperty('numbers') &&
				Array.isArray(item.numbers) &&
				item.numbers.length === 6;
		});
	}







	return {
		validateDataFormat,
		updateNumberGroups,
		numberGroups,
		highlighted,
		numberRefs,
		// getTargetRowIndex,
		isTargetRow,
		handleCellClick,
		isHighlighted,
		toggleHighlight,
		handleMessage
	};
}