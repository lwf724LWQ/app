import { getFootBallPostList } from "@/api/apis.js";
import {ref} from "vue"
import tool from "@/utils/tool.js";

/**
 * 中奖精彩合集（ftype: 3）
 * 合集是按彩种（mtype）区分的，不传 mtype 时返回全部彩种混排
 * @param {String} mtype 彩种：排列三 / 排列五 / 福彩3D
 * @param {Boolean} immediate 是否创建时立即请求（彩种板块按需加载时传 false）
 */
export default function usePostList(mtype = "", immediate = true){
    // 注意：list 必须定义在工厂函数内部，否则多个彩种实例会共用同一个 ref
    const list = ref([])

    async function getList(type = mtype){
        const tname = type || mtype
        try {
            const params = {
                page: 1,
                limit: 3,
                ftype: 3,
            }
            if (tname) {
                params.mtype = tname
            }
            const res = await getFootBallPostList(params);
            list.value = res?.data?.list || []
        } catch (error) {
            console.error("加载中奖精彩合集失败:", error)
            list.value = []
        }
    }

    function openDetail(data) {
        if (tool.isLogin()) {
            uni.navigateTo({
                url: `/pages/zc/post-detail?id=${data.id}`,
            });
        }
    }

    if (immediate) {
        getList()
    }

    return {
        getList,
        list,
        openDetail
    }
}
