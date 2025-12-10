<template>
  <view class="pattern-predict-container">
    <!-- 导航栏 -->
    <view class="nav-bar">
      <view class="nav-left" @click="goBack">
        <uni-icons type="left" size="20" color="#333"></uni-icons>
      </view>
      <view class="nav-title">规律预测</view>
      <view class="nav-right"></view>
    </view>

    <!-- 主要内容 -->
    <view class="main-content">
      <!-- 我的方案区域 -->
      <view class="scheme-section">
        <view class="section-title">我的方案 (必选)</view>
        <view class="scheme-input" @click="goToSchemePage">
          <view class="issue-info">
            <text class="issue-number">第{{ issueNumber }}期</text>
          </view>
          <!-- 显示已设置的方案 -->
          <view v-if="schemes.length > 0" class="scheme-display">
            <view class="scheme-content">
              <!-- 期号显示 -->
              <text class="issue-number">第{{ issueNumber }}期</text>

              <!-- 方案详情 -->
              <view v-for="(scheme, index) in schemes" :key="index" class="scheme-item">
                <text class="scheme-name">[{{ scheme.id }}]</text>
                <view class="scheme-details">
                  <text v-for="(detail, detailIndex) in getSchemeDisplayData(scheme)" :key="detailIndex"
                    class="scheme-detail">
                    {{ detail }}
                  </text>
                </view>
              </view>
            </view>
          </view>
          <!-- 未设置方案时的提示 -->
          <view v-else class="scheme-placeholder">
            <text class="placeholder-text">还没有添加方案噢,点击可添加方案 ></text>
          </view>
        </view>
      </view>

      <!-- 添加规律图片区域 -->
      <view class="image-section">
        <view class="section-title">添加规律图片 (必选，最多6张)</view>
        <view class="image-upload-container">
          <!-- 已选择的图片 -->
          <view v-if="selectedImages.length > 0" class="selected-images">
            <view v-for="(image, index) in selectedImages" :key="index" class="image-item">
              <image :src="image" class="uploaded-image" mode="aspectFit"></image>
              <view class="image-delete" @click="removeImage(index)">
                <uni-icons type="close" size="16" color="#fff"></uni-icons>
              </view>
            </view>
          </view>

          <!-- 添加图片按钮 -->
          <view v-if="selectedImages.length < 6" class="add-image-btn" @click="selectImage">
            <uni-icons type="camera" size="40" color="#ccc"></uni-icons>
            <text class="add-text">添加图片</text>
            <text class="count-text">{{ selectedImages.length }}/6</text>
          </view>
        </view>
      </view>

      <!-- 免责声明 -->
      <view class="disclaimer">
        <text class="disclaimer-text">注: 帖子一旦发布, 将不能进行修改或删除操作</text>
      </view>

      <!-- 底部按钮区域 -->
      <view class="bottom-buttons">
        <button class="modify-btn" @click="goToSchemePage">修改</button>
        <button class="publish-btn" :class="{ disabled: !canPublish }" @click="handlePublish">
          发布
        </button>
      </view>


    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { apiGetIssueNo, apiPost, getCOSSecretKey } from '@/api/apis.js'
import { getAccount } from '@/utils/request.js'
import tool from '@/utils/tool.js'

// 响应式数据
const issueNumber = ref('')
const selectedImages = ref([]) // 改为数组支持多张图片
const schemes = ref([])
const lotteryType = ref(null)
const uploadedImageUrls = ref([]) // 改为数组存储多张图片URL
const isUploadingImage = ref(false)
// 请求锁 - 防止重复请求
const isLoadingIssueInfo = ref(false)

// 计算属性
const canPublish = computed(() => {
  return schemes.value.length > 0 && selectedImages.value.length > 0
})

// 页面加载时获取期号
onMounted(() => {
  loadIssueInfo()
  loadSchemesFromStorage()
})

// 页面显示时重新加载方案数据
onShow(() => {
  loadSchemesFromStorage()
})

// OSS上传函数，和edit-profile.vue相同的方法
const uploadObject = async (file, callback) => {
  try {
    let fileName = file.name || ''
    const origin_file_name = fileName.split(".").slice(0, fileName.split(".").length - 1).join('.') // 获取文件名

    // 获取当前时间戳
    const upload_file_name = new Date().getTime() + '.' + fileName.split(".")[fileName.split(".").length - 1]

    // 请求接口得到token
    let res = await getCOSSecretKey({})

    if (res.code !== 200) {
      throw new Error('获取上传凭证失败')
    }

    // 动态导入ali-oss
    const OSS = await import('ali-oss')

    // 根据STS接口实际返回的数据结构创建OSS客户端
    const ossConfig = {
      region: res.data.region || 'cn-guangzhou',
      accessKeyId: res.data.STSaccessKeyId,
      accessKeySecret: res.data.STSsecretAccessKey,
      stsToken: res.data.security_token,
      bucket: res.data.bucket || 'cjvd',
      // 使用正确的endpoint
      endpoint: 'https://oss-cn-guangzhou.aliyuncs.com',
      // 添加STS token刷新机制
      refreshSTSToken: async () => {
        const newRes = await getCOSSecretKey({})
        return {
          accessKeyId: newRes.data.STSaccessKeyId,
          accessKeySecret: newRes.data.STSsecretAccessKey,
          stsToken: newRes.data.security_token
        }
      },
      refreshSTSTokenInterval: 300000 // 5分钟刷新一次
    }

    const client = new OSS.default(ossConfig)

    // 上传文件
    const result = await client.put(`pimg/${upload_file_name}`, file)

    if (result && result.url) {
      // 直接使用固定的自定义域名前缀 + 唯一文件名（改用 pimg）
      const customUrl = `http://video.caimizm.com/pimg/${upload_file_name}`

      callback(customUrl)
    } else {
      throw new Error('上传失败')
    }

  } catch (error) {
    throw error
  }
}

// 获取分行显示的方案数据
const getSchemeDisplayData = (scheme) => {
  const data = scheme.data
  const result = []

  if (scheme.id === '二字现' || scheme.id === '三字现') {
    // 组合类方案
    if (data.combinations && data.combinations.length > 0) {
      result.push(`组合: ${data.combinations.join(',')}`)
    } else {
      result.push('组合: 未选择')
    }
  } else {
    // 数字类方案 - 按照图片格式显示
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

// 从本地存储加载方案数据
const loadSchemesFromStorage = () => {
  try {
    const savedData = uni.getStorageSync('predict_schemes_data')
    if (savedData && savedData.addedSchemes && Array.isArray(savedData.addedSchemes)) {
      schemes.value = savedData.addedSchemes
    } else {
      schemes.value = []
    }
  } catch (error) {
    schemes.value = []
  }
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
    // 从本地存储获取当前彩票类型
    const savedLotteryType = uni.getStorageSync('currentLotteryType')
    if (savedLotteryType) {
      lotteryType.value = savedLotteryType
    } else {
      // 默认使用排列三
      lotteryType.value = { id: 16, code: 16, name: '排列三' }
    }

    if (!lotteryType.value || !lotteryType.value.id) {
      return
    }

    uni.showLoading({ title: '加载期号中...' })

    const response = await apiGetIssueNo({ tname: lotteryType.value.name })

    uni.hideLoading()

    if (response.code === 200 && response.data !== null && response.data !== undefined) {
      let issueNumberValue = null
      let issueStatus = '待开奖'
      let issueTime = '今天 21:30'

      if (typeof response.data === 'number' || typeof response.data === 'string') {
        issueNumberValue = response.data.toString()
      } else if (typeof response.data === 'object') {
        issueNumberValue = response.data.issueno || response.data.number || response.data.id
        issueStatus = response.data.status || '待开奖'
        issueTime = response.data.time || '今天 21:30'
      }

      // 直接使用获取到的期号，即使是0也使用
      issueNumber.value = issueNumberValue || '0'
      uni.showToast({ title: `期号加载成功: ${issueNumber.value}`, icon: 'success' })
    } else {
      // 如果接口失败，使用0作为默认期号
      issueNumber.value = '0'
      uni.showToast({ title: '使用默认期号: 0', icon: 'none' })
    }
  } catch (error) {
    uni.hideLoading()
    console.error('加载期号信息失败:', error)
    // 如果加载失败，也使用0作为期号
    issueNumber.value = '0'
    uni.showToast({ title: '期号加载异常，使用默认期号: 0', icon: 'none' })
  } finally {
    isLoadingIssueInfo.value = false
  }
}

// 返回上一页
const goBack = () => {
  uni.navigateBack()
}

// 跳转到方案页面
const goToSchemePage = () => {
  console.log('=== 规律帖跳转到方案页面 ===')
  console.log('当前页面:', 'pages/pattern-predict/pattern-predict')

  // 准备传递的数据
  const publishData = {
    lotteryType: lotteryType.value,
    issueInfo: {
      id: issueNumber.value,
      number: issueNumber.value,
      status: '待开奖',
      time: '今天 21:30'
    },
    schemes: schemes.value
  }

  uni.navigateTo({
    url: `/pages/predict-scheme/predict-scheme?data=${encodeURIComponent(JSON.stringify(publishData))}`,
    success: () => {
      // 跳转成功
    },
    fail: (err) => {
      uni.showToast({
        title: '跳转失败',
        icon: 'none'
      })
    }
  })
}

// 选择图片
const selectImage = async () => {
  if (isUploadingImage.value) {
    uni.showToast({
      title: '图片正在上传中，请稍候',
      icon: 'none'
    })
    return
  }

  // 计算还能选择多少张图片
  const remainingCount = 6 - selectedImages.value.length
  if (remainingCount <= 0) {
    uni.showToast({
      title: '最多只能选择6张图片',
      icon: 'none'
    })
    return
  }

  try {
    // 选择图片
    const chooseResult = await uni.chooseImage({
      count: remainingCount, // 最多选择剩余数量
      sizeType: ['compressed'],
      sourceType: ['album', 'camera']
    })

    if (chooseResult.tempFilePaths && chooseResult.tempFilePaths.length > 0) {
      // 显示上传进度
      uni.showLoading({
        title: '上传图片中...'
      })

      isUploadingImage.value = true

      // 批量上传图片
      const uploadPromises = chooseResult.tempFilePaths.map(async (tempFilePath, index) => {
        const url = await tool.oss.uploadImgForTempPath(tempFilePath, 'pimg')
        return { tempFilePath, url: `http://video.caimizm.com/${url}` }
      })

      // 等待所有图片上传完成
      const uploadResults = await Promise.all(uploadPromises)

      // 更新图片列表
      uploadResults.forEach(({ tempFilePath, url }) => {
        selectedImages.value.push(tempFilePath)
        uploadedImageUrls.value.push(url)
      })

      uni.hideLoading()
      uni.showToast({
        title: `成功上传${uploadResults.length}张图片`,
        icon: 'success'
      })

      isUploadingImage.value = false
    }
  } catch (error) {
    console.log(error)
    uni.hideLoading()
    isUploadingImage.value = false
    uni.showToast({
      title: '图片上传失败',
      icon: 'none'
    })
  }
}

// 删除图片
const removeImage = (index) => {
  selectedImages.value.splice(index, 1)
  uploadedImageUrls.value.splice(index, 1)
}

// 生成帖子内容
const generatePostContent = () => {
  let content = '【规律预测】\n\n'

  if (schemes.value.length > 0) {
    schemes.value.forEach((scheme, index) => {
      content += `${index + 1}. [${scheme.id}]\n`

      // 获取方案显示数据
      const schemeDetails = getSchemeDisplayData(scheme)
      schemeDetails.forEach(detail => {
        content += `   ${detail}\n`
      })
      content += '\n'
    })
  }

  // 使用获取到的期号，即使是0也使用
  const validIssueNumber = issueNumber.value || '0'
  content += `期号: 第${validIssueNumber}期\n`
  content += `发布时间: ${new Date().toLocaleString()}`

  return content
}

// 处理发布
const handlePublish = async () => {
  if (!canPublish.value) {
    uni.showToast({
      title: '请完善方案和图片',
      icon: 'none'
    })
    return
  }

  if (!uploadedImageUrls.value || uploadedImageUrls.value.length === 0) {
    uni.showToast({
      title: '请等待图片上传完成',
      icon: 'none'
    })
    return
  }

  try {
    uni.showLoading({
      title: '发布中...'
    })

    // 获取当前登录用户的头像URL
    let currentUserAvatar = ''
    const loginData = uni.getStorageSync('loginData') || {}
    if (loginData.himg) {
      currentUserAvatar = loginData.himg
    }

    // 准备发帖数据
    const postData = {
      tname: lotteryType.value.name,
      // tname: lotteryType.value ? `${lotteryType.value.name}-规律预测` : '规律预测', // 彩票名称 - 添加"规律预测"标识
      issueno: parseInt(issueNumber.value) || 0, // 期号转换为数字
      content: generatePostContent(), // 发帖内容
      account: getAccount() || '', // 账号
      pimg: uploadedImageUrls.value.join(','), // 多张图片URL用逗号分隔
      flag: false // 需要审核
    }

    // 检查必要参数
    if (!postData.account) {
      uni.showToast({
        title: '账号信息缺失，请重新登录',
        icon: 'none'
      })
      return
    }

    if (postData.issueno === null || postData.issueno === undefined || postData.issueno === '') {
      uni.showToast({
        title: '期号信息缺失',
        icon: 'none'
      })
      return
    }

    if (!postData.content) {
      uni.showToast({
        title: '发帖内容为空',
        icon: 'none'
      })
      return
    }

    if (!postData.pimg || postData.pimg.trim() === '') {
      uni.showToast({
        title: '请至少上传一张图片',
        icon: 'none'
      })
      return
    }

    const response = await apiPost(postData)

    uni.hideLoading()

    if (response.code === 200) {
      uni.showToast({
        title: '规律帖已提交审核',
        icon: 'success'
      })

      // 清除本地存储的方案数据和图片URL
      uni.removeStorageSync('predict_schemes_data')
      selectedImages.value = []
      uploadedImageUrls.value = []

      // 延迟返回规律预测页面
      setTimeout(() => {
        uni.navigateBack()
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
      title: error?.msg || '发布失败，请重试',
      icon: 'none'
    })
  }
}



</script>

<style scoped>
.pattern-predict-container {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.nav-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx 30rpx;
  background-color: #fff;
  border-bottom: 1rpx solid #eee;
}

.nav-left {
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
}

.nav-right {
  width: 60rpx;
}

.main-content {
  padding: 30rpx;
}

.scheme-section {
  margin-bottom: 40rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 20rpx;
}

.scheme-input {
  background-color: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
  border: 2rpx solid #eee;
}

.issue-info {
  margin-bottom: 20rpx;
}

.issue-number {
  font-size: 28rpx;
  color: #333;
  font-weight: bold;
}

.scheme-placeholder {
  padding: 20rpx 0;
}

.placeholder-text {
  font-size: 28rpx;
  color: #999;
}

.scheme-display {
  padding: 20rpx 0;
}

.scheme-content {
  background-color: #f8f8f8;
  padding: 30rpx;
  border-radius: 15rpx;
  margin-top: 20rpx;
}

.scheme-item {
  margin-bottom: 15rpx;
}

.scheme-name {
  font-size: 28rpx;
  color: #ff4757;
  font-weight: bold;
  display: block;
  margin-bottom: 10rpx;
}

.scheme-details {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.scheme-detail {
  font-size: 26rpx;
  color: #333;
  line-height: 1.5;
}

.image-section {
  margin-bottom: 40rpx;
}

.image-upload-container {
  background-color: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
  border: 2rpx solid #eee;
}

.selected-images {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
  margin-bottom: 20rpx;
}

.image-item {
  position: relative;
  width: 200rpx;
  height: 200rpx;
}

.uploaded-image {
  width: 100%;
  height: 100%;
  border-radius: 12rpx;
}

.image-delete {
  position: absolute;
  top: -10rpx;
  right: -10rpx;
  width: 40rpx;
  height: 40rpx;
  background-color: #ff4757;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.add-image-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 200rpx;
  height: 200rpx;
  border: 2rpx dashed #ccc;
  border-radius: 12rpx;
  background-color: #f8f8f8;
}

.add-text {
  font-size: 24rpx;
  color: #999;
  margin-top: 10rpx;
}

.count-text {
  font-size: 20rpx;
  color: #ccc;
  margin-top: 5rpx;
}

.disclaimer {
  margin-bottom: 40rpx;
}

.disclaimer-text {
  font-size: 24rpx;
  color: #ff4757;
  line-height: 1.5;
}

.bottom-buttons {
  margin-top: 40rpx;
  display: flex;
  gap: 20rpx;
}

.modify-btn,
.publish-btn {
  flex: 1;
  height: 88rpx;
  border: none;
  border-radius: 44rpx;
  font-size: 32rpx;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modify-btn {
  background-color: #f0f0f0;
  color: #666;
}

.publish-btn {
  background-color: #ff4757;
  color: #fff;
}

.publish-btn.disabled {
  background-color: #ccc;
  color: #999;
}
</style>
