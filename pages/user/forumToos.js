import { getAccount } from '@/utils/request.js'

// 彩票类别列表
const lotteryTypes = [
  { id: 16, name: '排列三', code: 'pl3', status: '待开奖', time: '今天 21:30' },
  { id: 17, name: '排列五', code: 'pl5', status: '待开奖', time: '今天 21:30' },
  { id: 15, name: '七星彩', code: 'qxc', status: '待开奖', time: '今天 21:30' },
  { id: 12, name: '福彩3D', code: 'fc3d', status: '待开奖', time: '今天 21:30' }
]

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
    try {
      // 从帖子内容中提取所有方案信息
      const schemeIds = extractSchemeFromContent(post.content)

      const lotteryType = lotteryTypes.find(type => post.tname.indexOf(type.name) >= 0)
      // 保存帖子信息到本地存储，供predict-scheme.vue使用
      const appendPostData = {
        postId: post.id,
        schemeIds: schemeIds, // 改为数组，包含所有方案
        postContent: post.content,
        period: post.issueno,
        lotteryType: lotteryType.name, // 添加彩票类型
        timestamp: Date.now()
      }
  
      uni.setStorageSync('appendPostData', appendPostData)
      debugger
      // 跳转到方案设置页面，让用户选择要追加的方案
      uni.navigateTo({
        url: '/pages/predict-scheme/predict-scheme',
        success: () => {
          uni.showToast({
            title: '请选择要追加的方案',
            icon: 'success'
          })
        },
        fail: () => {
          uni.showToast({
            title: '跳转失败',
            icon: 'none'
          })
        }
      })
  
    } catch (error) {
      uni.showToast({
        title: '跳转失败',
        icon: 'none'
      })
    }
  }
  
  // 从帖子内容中提取所有方案ID
  const extractSchemeFromContent = (content) => {
    try {
      if (!content) return []
  
      // 常见的方案类型列表
      const schemeTypes = [
        '头尾', '中肚', 'ABXX', 'AXCX', 'XBXD', 'XXCD', 'ABCX', 'ABXD', 'AXCD', 'XBCD',
        '芝麻', '二字现', '三字现', '定头', '定百', '定十', '定尾', '杀头', '杀百', '杀十', '杀尾',
        '稳码', '头尾合', '中肚合', '千百合', '千十合', '百个合', '十个合', '死数',
        '头尾不合', '中肚不合', '千百不合', '千十不合', '百个不合', '十个不合',
        '过滤王二定', '过滤王三定', '过滤王四定'
      ]
  
      const foundSchemes = []
  
      // 在内容中查找所有方案类型
      schemeTypes.forEach(scheme => {
        if (content.includes(scheme)) {
          foundSchemes.push(scheme)
        }
      })
  
      return foundSchemes
  
    } catch (error) {
      return []
    }
  }
export default {
    handleAppendPost
};
