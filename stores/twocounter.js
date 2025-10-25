// stores/twocounter.js
import { ref } from 'vue';
import { apiTicketQuery } from "@/api/apis.js"
import { defineStore } from 'pinia';

export const usetwoCounterStore = defineStore('twocounter', () => {
    const List = ref([]);
    const queryParams = ref({
        page: 1,
        limit: 20,
        tname: '排列五'
    });
    const isLoading = ref(false);
    const hasMore = ref(true);
    const error = ref(null);

    // 请求数据并转换成drawLine需要的数组形式
    const getCounterInfo = async (isLoadMore = false) => {
        if (isLoading.value) return;
        
        isLoading.value = true;
        error.value = null;
        
        try {
            const res = await apiTicketQuery(queryParams.value);
            console.log("原始数据:", res.data.records);
            
            // 转换数据
            let convertedData = convertData(res.data.records);
            
            // 反转数据，使期数为升序排列（最新的在最后）
            convertedData = convertedData.reverse();
            
            // 在末尾添加4行空数据
            addEmptyRows(convertedData);
            
            if (isLoadMore) {
                // 加载更多 - 追加数据
                List.value = [...List.value, ...convertedData];
            } else {
                // 刷新 - 替换数据
                List.value = convertedData;
            }
            
            // 检查是否还有更多数据
            hasMore.value = res.data.records.length >= queryParams.value.limit;
            
            
            
            console.log("转换后数据（包含4行空数据）:", List.value);
        } catch (err) {
            error.value = err;
            console.error("获取数据失败:", err);
        } finally {
            isLoading.value = false;
        }
    }

    // 转换方法
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

    // 在数据末尾添加4行空数据
    const addEmptyRows = (data) => {
        if (data.length === 0) return;
        // 获取最后一个元素的期号
        const lastQishu = data[data.length - 1].qishu;
        // 添加4行空数据
        for (let i = 1; i <= 4; i++) {
            // 创建一个长度为6的数组，每个元素都是空字符串
            const emptyNumbers = Array(6).fill("");
            data.push({
                qishu: lastQishu + i,
                numbers: emptyNumbers // 空字符串数组
            });
        }
    }

    // 加载更多数据
    const loadMoreData = async () => {
        if (!hasMore.value || isLoading.value) return;
        await getCounterInfo(true);
    }

    // 重置状态
    const reset = () => {
        List.value = [];
        queryParams.value.page = 1;
        hasMore.value = true;
        isLoading.value = false;
        error.value = null;
    }

    // 以对象的形式返回
    return {
        List,
        isLoading,
        hasMore,
        error,
        getCounterInfo,
        loadMoreData,
        reset
    }
});