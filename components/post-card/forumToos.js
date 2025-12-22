import { getAccount } from '@/utils/request.js'
import tool from '@/utils/tool.js'

// 处理追帖按钮点击
const handleAppendPost = (post) => {
    try {
      // 检查帖子ID是否有效
      if (!post.id) {
        uni.showToast({
          title: '帖子数据异常，无法追帖',
          icon: 'none'
        })
        return
      }
      
      // 检查是否是当前用户自己的帖子
      const currentAccount = getAccount()
      if (post.account === currentAccount) {
        uni.showModal({
          title: '追帖确认',
          content: `确定要对帖子"第${post.issueno}期"进行追帖吗？`,
          confirmText: '确定追帖',
          cancelText: '取消',
          success: (res) => {
            if (res.confirm) {
              // 跳转到追帖页面
              navigateToAppendPost(post)
            }
          }
        })
      } else {
        uni.showToast({
          title: '只能追帖自己的帖子',
          icon: 'none'
        })
      }
    } catch (error) {
      uni.showToast({
        title: '操作失败，请重试',
        icon: 'none'
      })
    }
  }
  
  // 跳转到追帖页面
  const navigateToAppendPost = (post) => {
    const params = tool.formatUrlParams({
      lotteryType: post.tname,
      id: post.id,
    })

    uni.setStorageSync("postContent", post.content)

    // 跳转到方案设置页面，让用户选择要追加的方案
    uni.navigateTo({
      url: `/pages/forum/post/created-scheme?` + params,
      success: () => {
      },
      fail: () => {
        uni.showToast({
          title: '跳转失败',
          icon: 'none'
        })
      }
    })
  }
export default {
    handleAppendPost
};
