import {ref} from "vue"
import { getAccount } from "../../utils/request";
import { apiPostListQuery } from "@/api/apis.js";
import tool from "../../utils/tool";

function handerPost(post) {
  if (!post.id) return null;

  let userAvatar = "http://video.caimizm.com/himg/user.png";
  userAvatar = post.himg ? tool.oss.getFullUrl("/himg/" + post.himg) : userAvatar;

  return {
    ...post,
    avatar: userAvatar,
  };
}

export function useLoadLotteryList (limit = 20){
    let currentPage = 1;
    const pagelimit = limit
    const list = ref([]);
    const isMore = ref(false);
    const isLoad = ref(false);
    return {
        list,
        isMore,
        isLoad,
        async loadLotteryData(isRefresher = false, tname=""){
            console.log("加载")
            try {
                if (isLoad.value)
                    return
                if (isMore.value === false && isRefresher !== true && currentPage !== 1)
                    return

                isLoad.value = true;
                currentPage = isRefresher ? 1 : currentPage;
                const reqForm = {
                    page: currentPage,
                    limit: pagelimit,
                }
                const account = getAccount()
                if (account) {
                    reqForm.account = account
                }
                if(tname){
                    reqForm.tname = tname
                }
                const res = await apiPostListQuery(reqForm)
                const l = res.data.list.map(item => handerPost(item))

                // 判断是否有更多
                isMore.value = l.length >= pagelimit
                
                list.value = currentPage == 1 ? l :[...list.value, ...l]

                currentPage ++
            } catch (error) {
                throw new Error(error.msg || "未知错误")
            }
            isLoad.value = false
        }
    }
}