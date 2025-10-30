<template>
  <view class="biaodan-container">
    <!-- 导航栏 -->
    <view class="navbar">
      <view class="nav-content">
        <view class="nav-left" @click="goBack">
          <uni-icons type="left" size="20" color="#fff"></uni-icons>
        </view>
        <text class="nav-title"></text>
        <view class="nav-right"></view>
      </view>
    </view>
    
    <!-- 主要内容区域 -->
    <view class="main-content">
      <!-- 标题 -->
      <view class="title-section">
        <text class="main-title">开奖号码记录</text>
      </view>
      
      <!-- 头部输入区域 -->
      <view class="input-section">
        <view class="input-row">
          <view class="input-item">
            <text class="input-label">期号:</text>
            <input class="input-box" v-model="formData.issueNo" placeholder="请输入期号" />
          </view>
          <view class="input-item">
            <text class="input-label">姓名:</text>
            <input class="input-box" v-model="formData.name1" placeholder="请输入姓名" />
          </view>
        </view>
        
        <view class="input-item">
            <text class="input-label">日期:</text>
            <input class="input-box" v-model="formData.date" placeholder="请输入日期" />
          </view>
        
      </view>
      
      <!-- 选项列表 -->
      <view class="options-section">
        <view 
          class="option-item" 
          v-for="(option, index) in options" 
          :key="index"
        >
          <!-- 选项头部：标签和输入框 -->
          <view class="option-header-row inline-input">
            <view class="option-content">
              <text class="option-text">{{ option.label }}</text>
              <text class="option-desc" v-if="option.desc">{{ option.desc }}</text>
            </view>
            <!-- 所有输入框都跟在文字后面 -->
            <view v-if="option.hasInputs" class="inline-input-box">
              <!-- 1个输入框 -->
              <view v-if="option.inputCount === 1" class="mini-input-row">
                <input class="mini-input-box" v-model="option.inputs[0]" placeholder="输入" />
              </view>
              <!-- 4个输入框 -->
              <view v-else-if="option.inputCount === 4" class="mini-input-row">
                <input class="mini-input-box" v-for="(item, inputIndex) in 4" :key="inputIndex" v-model="option.inputs[inputIndex]" placeholder="输入" />
              </view>
              <!-- 6个输入框 -->
              <view v-else-if="option.inputCount === 6" class="mini-input-row six-inputs">
                <input class="mini-input-box" v-for="(item, inputIndex) in 6" :key="inputIndex" v-model="option.inputs[inputIndex]" placeholder="输入" />
              </view>
            </view>
          </view>
        </view>
      </view>
      
      <!-- 备注栏 -->
      <view class="remark-section">
        <view class="remark-label">备注:</view>
        <textarea class="remark-input" v-model="remark" placeholder="请输入备注信息" :auto-height="true"></textarea>
      </view>
      
      <!-- 提交按钮 -->
      <view class="submit-section">
        <button class="submit-btn" @click="handleSubmit">提交</button>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { apiWordInsert } from '@/api/apis.js'
import { getCOSSecretKey } from '@/api/apis.js'

// 表单数据
const formData = ref({
  issueNo: '',
  name1: '',
  date: ''
})

// 选项列表
const options = ref([
  { label: '直码',  hasInputs: true, inputCount: 1, inputs: [''] },
  { label: '二字同上', hasInputs: true, inputCount: 4, inputs: ['', '', '', ''] },
  { label: '三字同上', hasInputs: true, inputCount: 4, inputs: ['', '', '', ''] },
  { label: '二定', hasInputs: true, inputCount: 6, inputs: ['', '', '', '', '', ''] },
  { label: '三定', hasInputs: true, inputCount: 6, inputs: ['', '', '', '', '', ''] },
  { label: '四字直码', hasInputs: true, inputCount: 6, inputs: ['', '', '', '', '', ''] },
  { label: '二定范围', hasInputs: true, inputCount: 4, inputs: ['', '', '', ''] },
  { label: '三定范围', hasInputs: true, inputCount: 4, inputs: ['', '', '', ''] },
  { label: '四定范围', hasInputs: true, inputCount: 4, inputs: ['', '', '', ''] }
])

// 备注
const remark = ref('')
// 从上传页传来的本地生成视频ID
const videoId = ref('')

// 返回上一页
const goBack = () => {
  uni.navigateBack()
}

// 从存储中预填期号
onMounted(() => {
  try {
    const issueInfo = uni.getStorageSync('currentIssueInfo') || {}
    if (issueInfo && (issueInfo.number || issueInfo.id)) {
      formData.value.issueNo = issueInfo.number || issueInfo.id
    }
    // 预填日期：优先使用接口返回的 opendate；兼容 time
    if (issueInfo && (issueInfo.opendate || issueInfo.time)) {
      formData.value.date = issueInfo.opendate || issueInfo.time
    }
    const draft = uni.getStorageSync('paidVideoDraft') || {}
    if (draft && draft.videoId) {
      videoId.value = draft.videoId
    }
  } catch (e) {}
})

// 与 pattern-predict.vue 相同的 OSS 上传方法（目标目录 pimg/）
const uploadObject = async (file, callback) => {
  try {
    let fileName = file.name || 'form.jpg'
    const upload_file_name = new Date().getTime() + '.' + (fileName.split('.').pop() || 'jpg')
    let res = await getCOSSecretKey({})
    if (res.code !== 200) throw new Error('获取上传凭证失败')
    const OSS = await import('ali-oss')
    const client = new OSS.default({
      region: res.data.region || 'cn-guangzhou',
      accessKeyId: res.data.STSaccessKeyId,
      accessKeySecret: res.data.STSsecretAccessKey,
      stsToken: res.data.security_token,
      bucket: res.data.bucket || 'cjvd',
      endpoint: 'https://oss-cn-guangzhou.aliyuncs.com',
      refreshSTSToken: async () => {
        const n = await getCOSSecretKey({})
        return {
          accessKeyId: n.data.STSaccessKeyId,
          accessKeySecret: n.data.STSsecretAccessKey,
          stsToken: n.data.security_token
        }
      },
      refreshSTSTokenInterval: 300000
    })
    const result = await client.put(`wimg/${upload_file_name}`, file)
    if (result && result.url) {
      const customUrl = `http://video.caimizm.com/wimg/${upload_file_name}`
      callback(customUrl)
    } else {
      throw new Error('上传失败')
    }
  } catch (e) { throw e }
}

// 生成表单图片并上传，返回图片URL
const generateFormImage = () => {
  return new Promise((resolve, reject) => {
    try {
      const width = 750
      const lineHeight = 44
      const padding = 30
      const rows = 12 // 估算行数
      const height = padding * 2 + lineHeight * (rows + options.value.length)
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')
      // 背景
      ctx.fillStyle = '#fff'
      ctx.fillRect(0,0,width,height)
      ctx.fillStyle = '#333'
      ctx.font = 'bold 28px sans-serif'
      ctx.fillText('开奖号记录', padding, padding + 28)
      ctx.font = '24px sans-serif'
      let y = padding + 28 + 20
      ctx.fillText(`期号: ${formData.value.issueNo}`, padding, y); y += lineHeight
      ctx.fillText(`姓名: ${formData.value.name1 || ''}`, padding, y); y += lineHeight
      ctx.fillText(`日期: ${formData.value.date}`, padding, y); y += lineHeight

      // 各项内容
      options.value.forEach(opt => {
        const inputs = (opt.inputs || []).join(' ')
        ctx.fillText(`${opt.label}: ${inputs}`, padding, y)
        y += lineHeight
      })
      if (remark.value) { ctx.fillText(`备注: ${remark.value}`, padding, y); y += lineHeight }

      canvas.toBlob(async (blob) => {
        try {
          const file = new File([blob], 'form.jpg', { type: 'image/jpeg' })
          uploadObject(file, (url) => resolve(url))
        } catch (e) { reject(e) }
      }, 'image/jpeg', 0.92)
    } catch (err) { reject(err) }
  })
}

// 提交表单
const handleSubmit = async () => {
  try {
    // 基础校验
    if (!videoId.value) {
      uni.showToast({ title: '未获取到视频ID，请返回上传页重试', icon: 'none' })
      return
    }
    // 强依赖 video.vue 的来源数据，避免被手动改乱
    const issueInfo = uni.getStorageSync('currentIssueInfo') || {}
    const lot = uni.getStorageSync('currentLotteryType') || {}
    const outIssueno = issueInfo.number || issueInfo.id || formData.value.issueNo
    const outOpenDate = issueInfo.opendate || issueInfo.time || formData.value.date
    const outTname = lot.name || ''
    if (!outIssueno) { uni.showToast({ title: '期号不能为空', icon: 'none' }); return }
    if (!outOpenDate) { uni.showToast({ title: '日期不能为空', icon: 'none' }); return }

    // 序列化表格内容
    const content = {
      name: formData.value.name1 || '',
      remark: remark.value || '',
      options: options.value.map(o => ({ label: o.label, inputs: o.inputs }))
    }

    // 读取 tname 和 封面图（可选）
    const tname = outTname
    // 生成图片并上传，获取 wimg
    uni.showLoading({ title: '生成图片...' })
    let wimg = await generateFormImage()

    uni.showLoading({ title: '提交中...' })
    const res = await apiWordInsert({
      videoId: videoId.value,
      content: JSON.stringify(content),
      issueno: outIssueno,
      tname,
      opendate: outOpenDate,
      wimg
    })
    uni.hideLoading()

    if (res && res.code === 200) {
      uni.showToast({ title: res.msg || '提交成功', icon: 'success' })
      setTimeout(() => uni.navigateBack(), 800)
    } else {
      uni.showToast({ title: (res && res.msg) || '提交失败', icon: 'none' })
    }
  } catch (err) {
    uni.hideLoading()
    uni.showToast({ title: '网络错误，请重试', icon: 'none' })
  }
}
</script>

<style scoped>
.biaodan-container {
  min-height: 100vh;
  background-color: #fff;
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
  border-bottom: 1rpx solid #e8e8e8;
}

.nav-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100%;
  padding: 0 30rpx;
}

.nav-left, .nav-right {
  width: 80rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav-title {
  font-size: 36rpx;
  font-weight: 600;
  color: #fff;
}

/* 主要内容区域 */
.main-content {
  padding: 100rpx 10rpx 120rpx;
}

/* 输入区域 */
.input-section {
  margin-bottom: 5rpx;
  background-color: #fff;
  padding: 6rpx;
  border-radius: 6rpx;
  box-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.04);
}

.input-row {
  display: flex;
  gap: 6rpx;
  margin-bottom: 6rpx;
}

.input-row:last-child {
  margin-bottom: 0;
}

.input-item {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.input-label {
  font-size: 26rpx;
  color: #666;
  white-space: nowrap;
  min-width: 48rpx;
  font-weight: 500;
}

.input-box {
  flex: 1;
  height: 52rpx;
  padding: 0 10rpx;
  background-color: #fafafa;
  border: 1rpx solid #e8e8e8;
  border-radius: 4rpx;
  font-size: 24rpx;
  color: #333;
}

.input-box::placeholder {
  color: #bbb;
}

/* 标题区域 */
.title-section {
  text-align: center;
  margin-bottom: 5rpx;
  padding-bottom: 2rpx;
  border-bottom: 1rpx solid #e8e8e8;
}

.main-title {
  font-size: 30rpx;
  font-weight: bold;
  color: #333;
}

/* 选项列表 */
.options-section {
  margin-bottom: 10rpx;
}

.option-item {
  margin-bottom: 8rpx;
  background-color: #fff;
  border: 1rpx solid #e8e8e8;
  border-radius: 6rpx;
  box-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.04);
  transition: all 0.2s ease;
  overflow: hidden;
}

.option-item:active {
  transform: scale(0.98);
}

.option-header-row {
  padding: 8rpx 12rpx;
  background-color: #fafafa;
  border-bottom: 1rpx solid #f0f0f0;
}

.option-header-row.inline-input {
  display: flex;
  align-items: flex-start;
  gap: 10rpx;
  flex-wrap: wrap;
}

.option-content {
  display: flex;
  align-items: center;
  gap: 12rpx;
  flex-shrink: 0;
  white-space: nowrap;
}

.option-text {
  font-size: 28rpx;
  color: #333;
  font-weight: 600;
}

.option-desc {
  font-size: 24rpx;
  color: #666;
  background-color: #fff;
  padding: 4rpx 12rpx;
  border-radius: 4rpx;
}

.inline-input-box {
  flex: 1;
  display: flex;
  align-items: flex-start;
  justify-content: flex-end;
  padding-left: 20rpx;
}

.inline-input-box .mini-input-row {
  gap: 10rpx;
  flex-wrap: wrap;
  width: 100%;
}

.inline-input-box .mini-input-row .mini-input-box {
  width: 110rpx;
  height: 56rpx;
  font-size: 24rpx;
  padding: 0 10rpx;
}

/* 6个输入框：每行3个 */
.inline-input-box .mini-input-row.six-inputs .mini-input-box {
  width: calc(33.333% - 7rpx);
  flex: 0 0 calc(33.333% - 7rpx);
}

.option-inputs {
  width: 100%;
  padding: 4rpx 8rpx 8rpx;
  background-color: #fff;
  box-sizing: border-box;
}

.mini-input-row {
  display: flex;
  gap: 6rpx;
  flex-wrap: wrap;
  width: 100%;
}

.mini-input-box {
  min-width: 0;
  height: 42rpx;
  padding: 0 4rpx;
  background-color: #f9f9f9;
  border: 1rpx solid #e0e0e0;
  border-radius: 4rpx;
  font-size: 20rpx;
  color: #333;
  text-align: center;
  box-sizing: border-box;
  transition: all 0.2s ease;
}

.mini-input-box:focus {
  background-color: #fff;
  border-color: #28B389;
  box-shadow: 0 0 0 2rpx rgba(40, 179, 137, 0.1);
}

/* 4个输入框的布局 */
.mini-input-row:not(.six-inputs) {
  gap: 4rpx;
}

.mini-input-row:not(.six-inputs) .mini-input-box {
  flex: 0 0 calc(25% - 3rpx);
}

/* 6个输入框的布局 - 一行6个 */
.mini-input-row.six-inputs {
  gap: 4rpx;
}

.mini-input-row.six-inputs .mini-input-box {
  flex: 0 0 calc(16.666% - 3.33rpx);
}

.mini-input-box::placeholder {
  color: #999;
  text-align: center;
}

/* 备注栏 */
.remark-section {
  margin-bottom: 10rpx;
  background-color: #fff;
  padding: 10rpx;
  border-radius: 6rpx;
  box-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.04);
}

.remark-label {
  font-size: 28rpx;
  color: #333;
  font-weight: 600;
  margin-bottom: 8rpx;
}

.remark-input {
  width: 100%;
  min-height: 100rpx;
  padding: 12rpx;
  background-color: #fafafa;
  border: 1rpx solid #e8e8e8;
  border-radius: 6rpx;
  font-size: 26rpx;
  color: #333;
  box-sizing: border-box;
}

.remark-input::placeholder {
  color: #bbb;
}

/* 提交按钮 */
.submit-section {
  position: fixed;
  bottom: 20rpx;
  left: 0;
  right: 0;
  padding: 0 20rpx;
  z-index: 100;
}

/* 支持安全区域的设备 */
@supports (padding-bottom: env(safe-area-inset-bottom)) {
  .submit-section {
    bottom: calc(20rpx + env(safe-area-inset-bottom));
  }
}

.submit-btn {
  width: 100%;
  height: 78rpx;
  background: linear-gradient(135deg, #28B389 0%, #20A576 100%);
  color: #fff;
  border: none;
  border-radius: 39rpx;
  font-size: 30rpx;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 8rpx 20rpx rgba(40, 179, 137, 0.3);
  position: relative;
  overflow: hidden;
}

.submit-btn::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  transform: translate(-50%, -50%);
  transition: width 0.6s, height 0.6s;
}

.submit-btn:active::before {
  width: 400rpx;
  height: 400rpx;
}

.submit-btn:active {
  transform: scale(0.95);
  box-shadow: 0 4rpx 12rpx rgba(40, 179, 137, 0.3);
}
</style>