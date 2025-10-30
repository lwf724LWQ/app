<template>
  <view class="publish-container">
    <!-- 导航栏 -->
    <view class="navbar">
      <view class="nav-content">
        <view class="nav-left" @click="goBack">
          <text class="back-arrow">‹</text>
        </view>
        <text class="nav-title">预测</text>
        <view class="nav-right"></view>
      </view>
    </view>
    
    <!-- 主要内容区域 -->
    <view class="main-content">
      <!-- 我的方案标题 -->
      <view class="title-section">
        <text class="title-text">我的方案</text>
      </view>
      
      <!-- 方案列表 -->
      <view class="scheme-list">
        <view 
          class="scheme-item" 
          v-for="(scheme, index) in schemes" 
          :key="index"
        >
          <view class="scheme-content">
            <view class="scheme-header">
              <text class="scheme-name">{{ scheme.name }}</text>
              <view class="scheme-type">{{ scheme.id }}</view>
            </view>
            <view class="scheme-details">
              <view class="scheme-data">
                <view 
                  class="position-info" 
                  v-for="(info, index) in getSchemeDisplayData(scheme)" 
                  :key="index"
                >
                  {{ info }}
                </view>
              </view>
            </view>
          </view>
        </view>
        
        <!-- 空状态提示 -->
        <view class="empty-state" v-if="schemes.length === 0">
          <text class="empty-text">暂无方案数据</text>
        </view>
      </view>
      
      <!-- 期号信息 -->
      <view class="period-info">
        <text class="period-text">{{ lotteryType ? lotteryType.name : '彩票类型' }} 第{{ getIssueNumber() }}期</text>
        <text class="period-status">{{ issueInfo.status }}</text>
      </view>
      
      <!-- 追帖功能区域 -->
      <view class="append-section" v-if="postId || isAppendMode">
        <view class="append-title">
          <text class="append-title-text">追加内容</text>
          <text class="append-post-id">帖子ID: {{ postId }}</text>
        </view>
        <view class="append-info">
          <text class="append-info-text">将自动追加当前选择的方案到原帖子</text>
        </view>
        <view class="append-buttons">
          <button 
            class="append-btn" 
            :class="{ disabled: isAppending }"
            @click="handleAppendPost"
          >
            {{ isAppending ? '追加中...' : '追加发帖' }}
          </button>
        </view>
      </view>
    </view>
    
    <!-- 底部按钮区域 -->
    <view class="bottom-section" v-if="!isAppendMode">
      <!-- 警告信息 -->
      <view class="warning-section">
        <text class="warning-text">注:帖子一旦发布,将不能进行修改或删除操作</text>
      </view>
      
      <!-- 操作按钮 -->
      <view class="action-buttons">
        <button class="modify-btn" @click="modifyScheme">修改</button>
        <button class="publish-btn" @click="publishScheme">发布</button>
      </view>
    </view>
    
    <!-- 追帖模式底部提示 -->
    <view class="bottom-section" v-if="isAppendMode">
      <view class="warning-section">
        <text class="warning-text">追帖模式：追加内容到已发布的帖子</text>
      </view>
    </view>
    
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getAccount } from '@/utils/request.js'
import { apiPost, apiGetIssueNo, apiPostUpdate, apiPostListQuery } from '@/api/apis.js'

// 方案数据
const schemes = ref([])

// 追帖相关数据
const postId = ref('') // 当前帖子ID
const isAppending = ref(false) // 是否正在追帖
const appendContent = ref('') // 追帖内容
const isAppendMode = ref(false) // 是否为追帖模式

// 彩票类型和期号信息
const lotteryType = ref(null)
const issueInfo = ref({
  id: null,
  number: null,
  status: '待开奖',
  time: '今天 21:30'
})

// 请求锁 - 防止重复请求
const isLoadingIssueInfo = ref(false)
const isLoadingPostDetails = ref(false)
const isLoadingUserPosts = ref(false)

// 格式化方案数据显示（保留原函数以兼容）
const formatSchemeData = (scheme) => {
  const data = scheme.data
  
  if (scheme.id === '二字现' || scheme.id === '三字现') {
    // 组合类方案
    if (data.combinations && data.combinations.length > 0) {
      return data.combinations.join(',')
    }
    return '未选择'
  } else {
    // 数字类方案 - 详细显示每位信息，包含主攻和重点
    let result = []
    
    // 千位
    if (data.thousands && data.thousands.length > 0) {
      let thousandsInfo = `千位: ${data.thousands.join('')}`
      if (data.thousandsMainAttack && data.thousandsMainAttack.length > 0) {
        thousandsInfo += ` 主攻${data.thousandsMainAttack.join('')}`
      }
      if (data.thousandsKeyPoint && data.thousandsKeyPoint.length > 0) {
        thousandsInfo += ` 重点${data.thousandsKeyPoint.join('')}`
      }
      result.push(thousandsInfo)
    }
    
    // 百位
    if (data.hundreds && data.hundreds.length > 0) {
      let hundredsInfo = `百位: ${data.hundreds.join('')}`
      if (data.hundredsMainAttack && data.hundredsMainAttack.length > 0) {
        hundredsInfo += ` 主攻${data.hundredsMainAttack.join('')}`
      }
      if (data.hundredsKeyPoint && data.hundredsKeyPoint.length > 0) {
        hundredsInfo += ` 重点${data.hundredsKeyPoint.join('')}`
      }
      result.push(hundredsInfo)
    }
    
    // 十位
    if (data.tens && data.tens.length > 0) {
      let tensInfo = `十位: ${data.tens.join('')}`
      if (data.tensMainAttack && data.tensMainAttack.length > 0) {
        tensInfo += ` 主攻${data.tensMainAttack.join('')}`
      }
      if (data.tensKeyPoint && data.tensKeyPoint.length > 0) {
        tensInfo += ` 重点${data.tensKeyPoint.join('')}`
      }
      result.push(tensInfo)
    }
    
    // 个位
    if (data.units && data.units.length > 0) {
      let unitsInfo = `个位: ${data.units.join('')}`
      if (data.unitsMainAttack && data.unitsMainAttack.length > 0) {
        unitsInfo += ` 主攻${data.unitsMainAttack.join('')}`
      }
      if (data.unitsKeyPoint && data.unitsKeyPoint.length > 0) {
        unitsInfo += ` 重点${data.unitsKeyPoint.join('')}`
      }
      result.push(unitsInfo)
    }
    
    return result.length > 0 ? result.join(' | ') : '未选择'
  }
}

// 获取分行显示的方案数据
const getSchemeDisplayData = (scheme) => {
  const data = scheme.data
  const result = []
  
  if (scheme.id === '二字现' || scheme.id === '三字现') {
    // 组合类方案
    if (data.combinations && data.combinations.length > 0) {
      result.push(data.combinations.join(','))
    } else {
      result.push('未选择')
    }
  } else {
    // 数字类方案 - 每位信息单独一行
    if (data.thousands && data.thousands.length > 0) {
      let thousandsInfo = `千位: ${data.thousands.join('')}`
      if (data.thousandsMainAttack && data.thousandsMainAttack.length > 0) {
        thousandsInfo += ` 主攻${data.thousandsMainAttack.join('')}`
      }
      if (data.thousandsKeyPoint && data.thousandsKeyPoint.length > 0) {
        thousandsInfo += ` 重点${data.thousandsKeyPoint.join('')}`
      }
      result.push(thousandsInfo)
    }
    
    if (data.hundreds && data.hundreds.length > 0) {
      let hundredsInfo = `百位: ${data.hundreds.join('')}`
      if (data.hundredsMainAttack && data.hundredsMainAttack.length > 0) {
        hundredsInfo += ` 主攻${data.hundredsMainAttack.join('')}`
      }
      if (data.hundredsKeyPoint && data.hundredsKeyPoint.length > 0) {
        hundredsInfo += ` 重点${data.hundredsKeyPoint.join('')}`
      }
      result.push(hundredsInfo)
    }
    
    if (data.tens && data.tens.length > 0) {
      let tensInfo = `十位: ${data.tens.join('')}`
      if (data.tensMainAttack && data.tensMainAttack.length > 0) {
        tensInfo += ` 主攻${data.tensMainAttack.join('')}`
      }
      if (data.tensKeyPoint && data.tensKeyPoint.length > 0) {
        tensInfo += ` 重点${data.tensKeyPoint.join('')}`
      }
      result.push(tensInfo)
    }
    
    if (data.units && data.units.length > 0) {
      let unitsInfo = `个位: ${data.units.join('')}`
      if (data.unitsMainAttack && data.unitsMainAttack.length > 0) {
        unitsInfo += ` 主攻${data.unitsMainAttack.join('')}`
      }
      if (data.unitsKeyPoint && data.unitsKeyPoint.length > 0) {
        unitsInfo += ` 重点${data.unitsKeyPoint.join('')}`
      }
      result.push(unitsInfo)
    }
    
    if (result.length === 0) {
      result.push('未选择')
    }
  }
  
  return result
}

// 修改方案
const modifyScheme = () => {
  // 将当前方案数据传递回上级页面进行修改
  uni.navigateBack({
    delta: 1,
    // 通过事件总线或全局状态传递数据
    success: () => {
      // 通知上级页面有数据需要修改
      uni.$emit('modifySchemes', schemes.value)
    }
  })
}

// 发布方案
const publishScheme = async () => {
  uni.showModal({
    title: '确认发布',
    content: '确定要发布这些方案吗？发布后将无法修改或删除。',
    success: async (res) => {
      if (res.confirm) {
        await handlePublish()
      }
    }
  })
}

// 测试追帖功能
const testAppendFunction = () => {
  console.log('=== 测试追帖功能 ===')
  console.log('当前帖子ID:', postId.value)
  console.log('追帖模式:', isAppendMode.value)
  
  if (!postId.value) {
    uni.showModal({
      title: '测试结果',
      content: '帖子ID缺失，无法测试追帖功能',
      showCancel: false
    })
    return
  }
  
  uni.showModal({
    title: '测试追帖功能',
    content: `帖子ID: ${postId.value}\n方案数量: ${schemes.value.length}\n\n是否执行追帖？`,
    confirmText: '执行追帖',
    cancelText: '取消',
    success: (res) => {
      if (res.confirm) {
        handleAppendPost()
      }
    }
  })
}

// 处理追帖逻辑
const handleAppendPost = async () => {
  if (!postId.value) {
    uni.showToast({
      title: '帖子ID缺失',
      icon: 'none'
    })
    return
  }
  
  try {
    isAppending.value = true
    uni.showLoading({
      title: '追加中...'
    })
    
    // 自动生成追加内容（包含原帖子内容）
    const appendText = await generateAppendContent()
    
    // 调用追帖接口 - 只传递必要的参数，不包含pimg
    const response = await apiPostUpdate({
      id: postId.value,
      content: appendText
    })
    
    uni.hideLoading()
    
    if (response.code === 200) {
      uni.showToast({
        title: '追加成功',
        icon: 'success'
      })
      
      // 清理追帖相关数据
      uni.removeStorageSync('appendPostData')
      uni.removeStorageSync('currentAppendPostData')
      uni.removeStorageSync('appendModeTipShown')
      
      // 延迟返回论坛页面
      setTimeout(() => {
        uni.reLaunch({
          url: '/pages/forum/forum'
        })
      }, 1500)
    } else {
      uni.showToast({
        title: response.msg || '追加失败',
        icon: 'none'
      })
    }
    
  } catch (error) {
    uni.hideLoading()
    uni.showToast({
      title: '追加失败，请重试',
      icon: 'none'
    })
  } finally {
    isAppending.value = false
  }
}

// 生成追加内容
const generateAppendContent = async () => {
  try {
    // 首先获取原帖子的内容
    let originalContent = ''
    
    if (postId.value) {
      try {
        // 尝试通过帖子列表查询获取原帖子内容
        const response = await apiPostListQuery({
          page: 1,
          size: 50,
          tname: currentLotteryType.value?.name || '预测方案'
        })
        
        if (response.code === 200 && response.data && response.data.records && Array.isArray(response.data.records)) {
          // 在查询结果中查找目标帖子
          const targetPost = response.data.records.find(post => post.id == postId.value)
          
          if (targetPost) {
            originalContent = targetPost.content || ''
          }
        }
      } catch (error) {
        // 如果API查询失败，尝试从本地存储获取
        const appendData = uni.getStorageSync('currentAppendPostData')
        if (appendData && appendData.postContent) {
          originalContent = appendData.postContent
        }
      }
    }
    
    // 生成追加内容
    let appendContent = '\n\n--- 追加内容 ---\n'
    appendContent += `追加时间: ${new Date().toLocaleString()}\n`
    
    if (schemes.value.length > 0) {
      appendContent += '\n追加方案:\n'
      schemes.value.forEach((scheme, index) => {
        appendContent += `${index + 1}. [${scheme.id}]\n`
        
        const displayData = getSchemeDisplayData(scheme)
        displayData.forEach(info => {
          appendContent += `   ${info}\n`
        })
      })
    } else {
      appendContent += '\n追加内容: 方案数据\n'
    }
    
    // 将追加内容添加到原内容后面
    const finalContent = originalContent + appendContent
    
    return finalContent
    
  } catch (error) {
    // 如果获取原内容失败，至少返回追加内容
    let appendContent = '\n\n--- 追加内容 ---\n'
    appendContent += `追加时间: ${new Date().toLocaleString()}\n`
    
    if (schemes.value.length > 0) {
      appendContent += '\n追加方案:\n'
      schemes.value.forEach((scheme, index) => {
        appendContent += `${index + 1}. [${scheme.id}]\n`
        
        const displayData = getSchemeDisplayData(scheme)
        displayData.forEach(info => {
          appendContent += `   ${info}\n`
        })
      })
    }
    
    return appendContent
  }
}

// 处理发布逻辑
const handlePublish = async () => {
  try {
    uni.showLoading({
      title: '发布中...'
    })
    
    // 准备发帖数据
    const postData = {
      tname: lotteryType.value ? lotteryType.value.name : '预测方案', // 彩票名称
      issueno: getIssueNumber(), // 期号 - 使用统一的期号获取函数
      content: generatePostContent(), // 发帖内容
      account: getAccount() || '', // 账号
      pimg: '', // 预测帖不需要图片
      flag: true // 无需审核
    }
    
    console.log('发帖数据:', postData)
    
    const response = await apiPost(postData)
    
    uni.hideLoading()
    
    if (response.code === 200) {
      // 保存帖子ID到本地存储，用于后续追帖
      if (response.data && response.data.id) {
        postId.value = response.data.id
        uni.setStorageSync('currentPostId', response.data.id)
        
        // 保存今天已发布的方案和帖子ID映射
        savePublishedSchemeData(response.data.id)
      }
      
        uni.showToast({
          title: '发布成功',
          icon: 'success'
        })
      
      // 清除本地存储的方案数据
      uni.removeStorageSync('predict_schemes_data')
      
      // 延迟返回论坛页面
        setTimeout(() => {
        uni.reLaunch({
          url: '/pages/forum/forum'
        })
        }, 1500)
    } else {
      uni.showToast({
        title: response.msg || '发布失败',
        icon: 'none'
      })
    }
    
  } catch (error) {
    uni.hideLoading()
    uni.showToast({
      title: '发布失败，请重试',
      icon: 'none'
    })
  }
}

// 获取期号显示
const getIssueNumber = () => {
  return issueInfo.value.number || issueInfo.value.id || '--'
}


// 加载期号信息
const loadIssueInfo = async () => {
  // 防止重复请求
  if (isLoadingIssueInfo.value) {
    console.log('正在加载期号信息，跳过重复请求')
    return
  }
  
  try {
    isLoadingIssueInfo.value = true
    if (!lotteryType.value || !lotteryType.value.id) {
      return
    }
    
    uni.showLoading({ title: '加载期号中...' })
    
    const response = await apiGetIssueNo({ tname: lotteryType.value.name })
    
    uni.hideLoading()
    
    if (response.code === 200 && response.data !== null && response.data !== undefined) {
      let issueNumber = null
      let issueStatus = '待开奖'
      let issueTime = '今天 21:30'
      
      if (typeof response.data === 'number' || typeof response.data === 'string') {
        issueNumber = response.data.toString()
      } else if (typeof response.data === 'object') {
        issueNumber = response.data.issueno || response.data.number || response.data.id
        issueStatus = response.data.status || '待开奖'
        issueTime = response.data.time || '今天 21:30'
      }
      
      issueInfo.value = {
        id: issueNumber,
        number: issueNumber,
        status: issueStatus,
        time: issueTime
      }
      
      uni.showToast({ title: `期号加载成功: ${issueNumber}`, icon: 'success' })
    } else {
      uni.showToast({ title: '期号数据为空', icon: 'none' })
    }
  } catch (error) {
    uni.hideLoading()
    console.error('加载期号信息失败:', error)
    uni.showToast({ title: '期号加载异常', icon: 'none' })
  } finally {
    isLoadingIssueInfo.value = false
  }
}

// 加载追帖模式下的方案数据
const loadSchemeForAppend = async (schemeId) => {
  try {
    console.log('=== 加载追帖方案数据 ===')
    console.log('方案ID:', schemeId)
    
    const today = new Date().toDateString()
    const publishedPosts = uni.getStorageSync(`publishedPosts_${today}`) || {}
    
    console.log('已发布的帖子映射:', publishedPosts)
    
    // 获取该方案对应的帖子ID
    const schemePostId = publishedPosts[schemeId]
    if (schemePostId) {
      postId.value = schemePostId
      console.log(`加载方案 ${schemeId} 对应的帖子ID:`, schemePostId)
      
      // 从接口获取帖子详细信息
      await loadPostDetails(schemePostId)
    } else {
      console.log(`未找到方案 ${schemeId} 对应的帖子ID`)
      
      // 尝试从接口获取用户已发布的帖子
      await loadUserPublishedPosts(schemeId)
    }
    
  } catch (error) {
    console.error('加载追帖方案数据失败:', error)
  }
}

// 从接口获取帖子详细信息
const loadPostDetails = async (postId) => {
  // 防止重复请求
  if (isLoadingPostDetails.value) {
    console.log('正在加载帖子详情，跳过重复请求')
    return
  }
  
  try {
    isLoadingPostDetails.value = true
    console.log('=== 获取帖子详细信息 ===')
    console.log('帖子ID:', postId)
    
    // 调用帖子列表查询接口获取帖子详情
    const response = await apiPostListQuery({
      page: 1,
      size: 1,
      id: postId
    })
    
    if (response.code === 200 && response.data && response.data.records && response.data.records.length > 0) {
      const post = response.data.records[0]
      console.log('帖子详情:', post)
      
      // 从帖子内容中解析方案数据
      if (post.content) {
        parseSchemeFromPostContent(post.content)
      }
    }
    
  } catch (error) {
    console.error('获取帖子详情失败:', error)
  } finally {
    isLoadingPostDetails.value = false
  }
}

// 从接口获取用户已发布的帖子
const loadUserPublishedPosts = async (schemeId) => {
  // 防止重复请求
  if (isLoadingUserPosts.value) {
    console.log('正在加载用户帖子，跳过重复请求')
    return
  }
  
  try {
    isLoadingUserPosts.value = true
    console.log('=== 获取用户已发布帖子 ===')
    console.log('方案ID:', schemeId)
    
    const response = await apiPostListQuery({
      page: 1,
      size: 20,
      account: uni.getStorageSync('account') || ''
    })
    
    if (response.code === 200 && response.data && response.data.records) {
      // 查找包含指定方案的帖子
      const targetPost = response.data.records.find(post => 
        post.content && post.content.includes(schemeId)
      )
      
      if (targetPost) {
        postId.value = targetPost.id
        console.log(`找到方案 ${schemeId} 对应的帖子:`, targetPost.id)
        
        // 解析方案数据
        parseSchemeFromPostContent(targetPost.content)
      } else {
        console.log(`未找到包含方案 ${schemeId} 的帖子`)
      }
    }
    
  } catch (error) {
    console.error('获取用户已发布帖子失败:', error)
  } finally {
    isLoadingUserPosts.value = false
  }
}

// 从帖子内容中解析方案数据
const parseSchemeFromPostContent = (content) => {
  try {
    console.log('=== 解析帖子内容 ===')
    console.log('帖子内容:', content)
    
    // 这里可以根据帖子内容的格式来解析方案数据
    // 暂时使用本地存储的方案数据作为备用
    const savedSchemesData = uni.getStorageSync('predict_schemes_data')
    console.log('本地存储的方案数据:', savedSchemesData)
    
    if (savedSchemesData && savedSchemesData.schemeData) {
      // 尝试从本地存储中找到对应的方案数据
      const schemeKeys = Object.keys(savedSchemesData.schemeData)
      const matchingScheme = schemeKeys.find(key => content.includes(key))
      
      if (matchingScheme) {
        const schemeData = savedSchemesData.schemeData[matchingScheme]
        const schemeObj = {
          id: matchingScheme,
          name: matchingScheme,
          data: schemeData
        }
        schemes.value = [schemeObj]
        console.log('解析出的方案数据:', schemeObj)
      }
    }
    
  } catch (error) {
    console.error('解析帖子内容失败:', error)
  }
}

// 保存已发布的方案数据
const savePublishedSchemeData = (postId) => {
  try {
    const today = new Date().toDateString()
    
    // 获取今天已发布的方案列表
    const publishedSchemes = uni.getStorageSync(`publishedSchemes_${today}`) || []
    
    // 获取今天已发布的帖子ID映射
    const publishedPosts = uni.getStorageSync(`publishedPosts_${today}`) || {}
    
    // 遍历当前方案，记录已发布的方案
    schemes.value.forEach(scheme => {
      const schemeId = scheme.id
      
      // 如果方案还没有被标记为已发布，则添加
      if (!publishedSchemes.includes(schemeId)) {
        publishedSchemes.push(schemeId)
      }
      
      // 保存方案对应的帖子ID
      publishedPosts[schemeId] = postId
    })
    
    // 保存到本地存储
    uni.setStorageSync(`publishedSchemes_${today}`, publishedSchemes)
    uni.setStorageSync(`publishedPosts_${today}`, publishedPosts)
    
    console.log('已保存发布数据:', {
      publishedSchemes,
      publishedPosts,
      postId
    })
    
  } catch (error) {
    console.error('保存已发布方案数据失败:', error)
  }
}

// 生成发帖内容
const generatePostContent = () => {
  if (schemes.value.length === 0) {
    return '暂无方案数据'
  }
  
  let content = '【预测方案】\n\n'
  
  schemes.value.forEach((scheme, index) => {
    content += `${index + 1}. ${scheme.name} (${scheme.id})\n`
    
    const displayData = getSchemeDisplayData(scheme)
    displayData.forEach(info => {
      content += `   ${info}\n`
    })
    content += '\n'
  })
  
      content += `期号: 第${getIssueNumber()}期\n`
  content += `发布时间: ${new Date().toLocaleString()}`
  
  return content
}

// 返回
const goBack = () => {
  uni.showModal({
    title: '提示',
    content: '返回会清空内容,确定返回吗?',
    confirmText: '确定',
    cancelText: '取消',
    confirmColor: '#ff4757',
    success: (res) => {
      if (res.confirm) {
        // 清除本地存储的方案数据
        try {
          uni.removeStorageSync('predict_schemes_data')
        } catch (error) {
          console.error('清除本地存储失败:', error)
        }
        
        // 点击确定，返回论坛页面
        uni.reLaunch({
          url: '/pages/forum/forum'
        })
      }
      // 点击取消不做任何操作
    }
  })
}

// 页面加载时获取传递的方案数据
onMounted(() => {
  // 获取页面参数
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1]
  const options = currentPage.options
  
  console.log('=== 页面加载调试信息 ===')
  console.log('页面参数:', options)
  
  // 检查是否有帖子ID（用于追帖功能）
  if (options.postId) {
    postId.value = options.postId
    uni.setStorageSync('currentPostId', options.postId)
    console.log('接收到帖子ID，进入追帖模式:', options.postId)
    
    // 进入追帖模式，隐藏发帖相关功能
    isAppendMode.value = true
    console.log('追帖模式已设置:', isAppendMode.value)
    
    // 如果有schemeId，加载对应的方案数据
    if (options.schemeId) {
      console.log('加载方案数据:', options.schemeId)
      loadSchemeForAppend(options.schemeId)
    }
  } else {
    // 从本地存储获取帖子ID - 只有在明确进入追帖模式时才设置
    const savedPostId = uni.getStorageSync('currentPostId')
    if (savedPostId) {
      // 检查是否真的是追帖模式（通过检查是否有追帖数据）
      const appendData = uni.getStorageSync('appendPostData')
      if (appendData && appendData.postId === savedPostId) {
        postId.value = savedPostId
        isAppendMode.value = true
        console.log('从本地存储恢复追帖模式:', savedPostId)
      } else {
        // 清除可能残留的帖子ID，确保是新帖模式
        uni.removeStorageSync('currentPostId')
        console.log('清除残留的帖子ID，确保新帖模式')
      }
    }
  }
  
  console.log('最终状态 - 帖子ID:', postId.value, '追帖模式:', isAppendMode.value)
  
  if (options.data) {
    try {
      const publishData = JSON.parse(decodeURIComponent(options.data))
      
      schemes.value = publishData.schemes || []
      lotteryType.value = publishData.lotteryType || null
      issueInfo.value = publishData.issueInfo || {
        id: null,
        number: null,
        status: '待开奖',
        time: '今天 21:30'
      }
      
      // 如果期号信息为空或无效，主动获取期号
      if (!issueInfo.value.number && !issueInfo.value.id) {
        loadIssueInfo()
      }
    } catch (error) {
      uni.showToast({
        title: '数据解析失败',
        icon: 'none'
      })
    }
  } else if (options.schemes) {
    // 兼容旧的URL参数格式
    try {
      const decodedSchemes = decodeURIComponent(options.schemes)
      schemes.value = JSON.parse(decodedSchemes)
    } catch (error) {
      uni.showToast({
        title: '数据解析失败',
        icon: 'none'
      })
    }
  } else {
    // 如果没有接收到数据，显示空状态
    schemes.value = []
    uni.showToast({
      title: '没有方案数据',
      icon: 'none'
    })
  }
})
</script>

<style scoped>
.publish-container {
  min-height: 100vh;
  background-color: #f5f5f5;
}

/* 导航栏 */
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 88rpx;
  background-color: #28B389;
  z-index: 999;
}

.nav-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100%;
  padding: 0 30rpx;
}

.nav-left, .nav-right {
  width: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.back-arrow {
  font-size: 40rpx;
  color: #fff;
  font-weight: bold;
}

.nav-title {
  font-size: 36rpx;
  font-weight: 600;
  color: #fff;
}

/* 主要内容区域 */
.main-content {
  padding-top: 88rpx;
  padding-bottom: 200rpx; /* 为底部按钮留出空间 */
  padding-left: 30rpx;
  padding-right: 30rpx;
}

/* 标题区域 */
.title-section {
  margin-bottom: 30rpx;
}

.title-text {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
}

/* 方案列表 */
.scheme-list {
  margin-bottom: 40rpx;
}

.scheme-item {
  background-color: #fff;
  border-radius: 15rpx;
  margin-bottom: 20rpx;
  padding: 30rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
}

.scheme-content {
  display: flex;
  flex-direction: column;
  gap: 15rpx;
}

.scheme-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 10rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.scheme-name {
  font-size: 32rpx;
  font-weight: 600;
  color: #ff4757;
}

.scheme-type {
  background-color: #28B389;
  color: #fff;
  padding: 8rpx 16rpx;
  border-radius: 20rpx;
  font-size: 22rpx;
  font-weight: 500;
}

.scheme-details {
  padding: 10rpx 0;
}

.scheme-data {
  background-color: #f8f9fa;
  padding: 15rpx;
  border-radius: 10rpx;
  border-left: 4rpx solid #28B389;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.position-info {
  font-size: 28rpx;
  color: #333;
  line-height: 1.4;
  word-wrap: break-word;
  word-break: break-all;
}

/* 空状态样式 */
.empty-state {
  text-align: center;
  padding: 60rpx 30rpx;
}

.empty-text {
  font-size: 28rpx;
  color: #999;
}


/* 期号信息 */
.period-info {
  text-align: center;
  margin-bottom: 30rpx;
}

.period-text {
  font-size: 24rpx;
  color: #999;
  margin-bottom: 8rpx;
}

.period-status {
  font-size: 22rpx;
  color: #ff4757;
}

/* 底部区域 */
.bottom-section {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: #fff;
  padding: 20rpx 30rpx;
  box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.1);
}

/* 警告信息 */
.warning-section {
  margin-bottom: 20rpx;
  text-align: center;
}

.warning-text {
  font-size: 24rpx;
  color: #ff4757;
}

/* 操作按钮 */
.action-buttons {
  display: flex;
  gap: 20rpx;
}

.modify-btn, .publish-btn {
  flex: 1;
  height: 80rpx;
  border-radius: 40rpx;
  font-size: 28rpx;
  font-weight: 500;
  border: none;
}

.modify-btn {
  background-color: #f0f0f0;
  color: #666;
}

.publish-btn {
  background-color: #ff4757;
  color: #fff;
}

/* 追帖功能样式 */
.append-section {
  margin-top: 40rpx;
  background-color: #fff;
  border-radius: 15rpx;
  padding: 30rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
}

.append-title {
  margin-bottom: 20rpx;
  display: flex;
  flex-direction: column;
  gap: 10rpx;
}

.append-title-text {
  font-size: 30rpx;
  font-weight: 600;
  color: #333;
}

.append-post-id {
  font-size: 24rpx;
  color: #666;
  background-color: #f0f0f0;
  padding: 8rpx 16rpx;
  border-radius: 20rpx;
  align-self: flex-start;
}

.append-info {
  margin: 20rpx 0;
  padding: 20rpx;
  background-color: #f8f9fa;
  border-radius: 10rpx;
  text-align: center;
}

.append-info-text {
  font-size: 26rpx;
  color: #666;
}

.append-buttons {
  display: flex;
  justify-content: center;
  gap: 20rpx;
  margin-top: 30rpx;
}

.append-btn {
  width: 200rpx;
  height: 70rpx;
  background-color: #28B389;
  color: #fff;
  border: none;
  border-radius: 35rpx;
  font-size: 26rpx;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
}

.append-btn.disabled {
  background-color: #ccc;
  color: #999;
}

</style>

