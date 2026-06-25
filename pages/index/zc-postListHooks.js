import { getFootBallPostList } from "@/api/apis.js";
import {ref} from "vue"
import tool from "@/utils/tool.js";

const list = ref([])

async function getList(){
    const res = await getFootBallPostList({
        page: 1,
        limit: 3,
        ftype: 2,
    });
    list.value = res.data.list
}

function openDetail(data) {
    if (tool.isLogin()) {
    uni.navigateTo({
        url: `/pages/zc/post-detail?id=${data.id}`,
    });
    }
}

export default function usePostList(){
    getList()
    return {
        getList,
        list,
        openDetail
    }
}