import {ref} from "vue"
import { getAccount } from "../../utils/request";
import { apiPostListQuery } from "@/api/apis.js";
import tool from "../../utils/tool";

function handerPost(post){
    const postId = post.id;

    // 检查postId是否有效
    if (!postId) {
    return null; // 跳过无效的帖子
    }

    // 使用服务器返回的点赞数
    const serverLikeCount = post.like_count || 0;

    // 处理用户头像
    let userAvatar = "http://video.caimizm.com/himg/user.png";

    // 使用getUserAvatar函数获取头像（不再使用pimg作为头像）
    userAvatar = post.himg ? tool.oss.getFullUrl("/himg/" + post.himg) : userAvatar;

    return {
    id: postId,
    tname: post.tname,
    account: post.account,
    username: post.uname || "匿名用户",
    avatar: userAvatar, // 使用处理后的头像
    time: tool.getTimeAgo(post.create_time),
    status: "预测中",
    period: post.issueno,
    content: post.content || "",
    image: post.pimg || "", // 帖子图片（规律帖的图片）
    likes: serverLikeCount, // 使用服务器返回的点赞数
    comments: post.comment || 0,
    shares: 0,
    isLiked: post.dianzan, // 检查当前用户是否点赞过
    isLiking: false, // 点赞中状态
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
        async loadLotteryData(isRefresher = false){
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
                    limit: pagelimit
                }
                const account = getAccount()
                if (account) {
                    reqForm.account = account
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