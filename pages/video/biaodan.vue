<template>
  <view class="biaodan-container" @touchmove.stop.prevent>
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
      <!-- <view class="title-section">
        <text class="main-title">开奖号码记录</text>
      </view> -->

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
      <view class="options-section flex-1">
        <view class="option-item flex-1" v-for="(option, index) in options" :key="index">
          <!-- 选项头部：标签和输入框 -->
          <view class="option-header-row inline-input">
            <view class="option-content">
              <text class="option-text">{{ option.label }}</text>
              <text class="option-desc" v-if="option.desc">{{ option.desc }}</text>
            </view>
            <!-- 所有输入框都跟在文字后面 -->
            <view v-if="option.hasInputs" class="inline-input-box flex-1">
              <!-- 1个输入框 -->
              <view class="grid-container flex-1">
                <input class="item" v-for="(item, inputIndex) in option.inputCount" :key="inputIndex"
                  v-model="option.inputs[0]" placeholder="" />
              </view>
              <!-- 5个输入框 -->
              <!-- <view v-else-if="option.inputCount === 5" class="mini-input-row flex-1">
                <input class="mini-input-box" v-for="(item, inputIndex) in 5" :key="inputIndex"
                  v-model="option.inputs[inputIndex]" placeholder="" />
              </view> -->
              <!-- 4个输入框 -->
              <!-- <view v-else-if="option.inputCount === 4" class="mini-input-row flex-1">
                <input class="mini-input-box" v-for="(item, inputIndex) in 4" :key="inputIndex"
                  v-model="option.inputs[inputIndex]" placeholder="" />
              </view> -->
              <!-- 4个输入框 -->
              <!-- <view v-else-if="option.inputCount === 3" class="mini-input-row item3 flex-1">
                <input class="mini-input-box" v-for="(item, inputIndex) in 3" :key="inputIndex"
                  v-model="option.inputs[inputIndex]" placeholder="" />
              </view> -->
              <!-- 6个输入框 -->
              <!-- <view v-else class="mini-input-row six-inputs flex-1">
                <input class="mini-input-box" v-for="(item, inputIndex) in 6" :key="inputIndex"
                  v-model="option.inputs[inputIndex]" placeholder="" />
              </view> -->
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
      <!-- <view class="test-btn" @click="test">测试按钮</view> -->
      <!-- 隐藏的 Canvas（用于小程序环境生成图片） -->
      <canvas canvas-id="formCanvas" id="formCanvas" class="hidden-canvas"
        :style="{ width: canvasWidth + 'px', height: canvasHeight + 'px' }"></canvas>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { apiWordInsert, getCOSSecretKey } from '@/api/apis.js'

// 表单数据
const formData = ref({
  issueNo: '',
  name1: '',
  date: ''
})

// 接收从 video.vue 或 oss.vue 传递的参数
const routeParams = ref({
  videoId: '', // 视频ID
  issueno: '', // 期号
  tname: '', // 彩票名称
  opendate: '' // 开奖日期
})

// 页面加载时接收参数
onLoad((pageOptions) => {
  // 从 URL 参数获取 videoId（优先）
  if (pageOptions.videoId) {
    routeParams.value.videoId = decodeURIComponent(pageOptions.videoId)
  }

  // 从 URL 参数获取其他参数
  if (pageOptions.issueno) {
    routeParams.value.issueno = decodeURIComponent(pageOptions.issueno)
    formData.value.issueNo = routeParams.value.issueno
  }
  if (pageOptions.tname) {
    routeParams.value.tname = decodeURIComponent(pageOptions.tname)

  }
  if (pageOptions.opendate) {
    routeParams.value.opendate = decodeURIComponent(pageOptions.opendate)
    formData.value.date = routeParams.value.opendate
  }

  // 从本地存储获取（如果从 oss.vue 跳转过来）
  try {
    const paidVideoInfo = uni.getStorageSync('paidVideoInfo')
    if (paidVideoInfo) {
      if (!routeParams.value.videoId && paidVideoInfo.videoId) {
        routeParams.value.videoId = paidVideoInfo.videoId
      }
      if (!routeParams.value.issueno && paidVideoInfo.issueno) {
        routeParams.value.issueno = paidVideoInfo.issueno
        formData.value.issueNo = paidVideoInfo.issueno
      }
      if (!routeParams.value.tname && paidVideoInfo.tname) {
        routeParams.value.tname = paidVideoInfo.tname
      }
      if (!routeParams.value.opendate && paidVideoInfo.opendate) {
        routeParams.value.opendate = paidVideoInfo.opendate
        formData.value.date = paidVideoInfo.opendate
      }
    }
  } catch (error) {
    // 静默处理错误
  }

  // 从 video.vue 的当前状态获取（如果视频页面的期号信息存在）
  try {
    const currentIssueInfo = uni.getStorageSync('currentIssueInfo')
    const currentLotteryType = uni.getStorageSync('currentLotteryType')

    if (currentIssueInfo && currentIssueInfo.number && !formData.value.issueNo) {
      routeParams.value.issueno = currentIssueInfo.number
      formData.value.issueNo = currentIssueInfo.number
    }

    if (currentLotteryType && currentLotteryType.name && !routeParams.value.tname) {
      routeParams.value.tname = currentLotteryType.name
    }

    if (!formData.value.date) {
      const today = new Date()
      const year = today.getFullYear()
      const month = String(today.getMonth() + 1).padStart(2, '0')
      const day = String(today.getDate()).padStart(2, '0')
      formData.value.date = `${year}-${month}-${day}`
      routeParams.value.opendate = formData.value.date
    }
  } catch (error) {
    // 静默处理错误
  }
  const type = (['福彩3D', '排列3', '排列三'].includes(routeParams.value.tname)) ? 0 : 1;
  options.value = optionType[type]

})
const defFillValue = '1234'
const optionType = [
  [{ label: '直码', hasInputs: true, inputCount: 1, inputs: [defFillValue] },
  { label: '猪胆', hasInputs: true, inputCount: 1, inputs: new Array(1).fill(defFillValue) },
  { label: '四码', hasInputs: true, inputCount: 4, inputs: new Array(4).fill(defFillValue) },
  { label: '五码', hasInputs: true, inputCount: 5, inputs: new Array(5).fill(defFillValue) },
  { label: '六码', hasInputs: true, inputCount: 6, inputs: new Array(6).fill(defFillValue) },
  { label: '百', hasInputs: true, inputCount: 1, inputs: new Array(1).fill(defFillValue) },
  { label: '十', hasInputs: true, inputCount: 1, inputs: new Array(1).fill(defFillValue) },
  { label: '个', hasInputs: true, inputCount: 1, inputs: new Array(1).fill(defFillValue) }],
  [
    { label: '直码', hasInputs: true, inputCount: 1, inputs: [defFillValue] },
    { label: '二字同上', hasInputs: true, inputCount: 3, inputs: new Array(3).fill(defFillValue) },
    { label: '三字同上', hasInputs: true, inputCount: 3, inputs: new Array(3).fill(defFillValue) },
    { label: '二定', hasInputs: true, inputCount: 3, inputs: new Array(3).fill(defFillValue) },
    { label: '三定', hasInputs: true, inputCount: 3, inputs: new Array(3).fill(defFillValue) },
    { label: '四字直码', hasInputs: true, inputCount: 3, inputs: new Array(3).fill(defFillValue) },
    { label: '小范围', hasInputs: true, inputCount: 3, inputs: new Array(3).fill(defFillValue) },
    { label: '大范围', hasInputs: true, inputCount: 3, inputs: new Array(3).fill(defFillValue) },
    // { label: '二定范围', hasInputs: true, inputCount: 4, inputs: new Array(4).fill(defFillValue) },
    // { label: '三定范围', hasInputs: true, inputCount: 4, inputs: new Array(4).fill(defFillValue) },
    // { label: '四定范围', hasInputs: true, inputCount: 4, inputs: new Array(4).fill(defFillValue) }
  ]
]

// 选项列表
const options = ref(optionType[0])

// 备注
const remark = ref('')

// Canvas 尺寸（用于小程序环境）
const canvasWidth = ref(750)
const canvasHeight = ref(1200)

// 返回上一页
const goBack = () => {
  uni.navigateBack()
}

// test
function test() {
  generateFormImageH5().then(blob => {
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = "123";
    link.click();
  })

}

// OSS上传函数（参考 pattern-predict.vue）
const uploadObject = async (file, callback) => {
  try {
    // 处理不同环境：file 可能是 File 对象或路径字符串
    let fileName = ''
    let fileToUpload = file

    if (typeof file === 'string') {
      // 小程序环境：file 是路径字符串
      fileName = file.split('/').pop() || `form-${Date.now()}.png`
      fileToUpload = file
    } else {
      // H5 环境：file 是 File 对象
      fileName = file.name || `form-${Date.now()}.png`
      fileToUpload = file
    }

    const origin_file_name = fileName.split(".").slice(0, fileName.split(".").length - 1).join('.')

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
      endpoint: 'https://oss-cn-guangzhou.aliyuncs.com',
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

    // 处理上传文件：小程序环境可能需要读取文件
    // #ifdef MP
    // 小程序环境：如果 file 是路径字符串，需要读取文件
    if (typeof fileToUpload === 'string') {
      const fs = uni.getFileSystemManager()
      try {
        const fileData = fs.readFileSync(fileToUpload)
        // 转换为 Blob/File 对象
        const blob = new Blob([fileData], { type: 'image/png' })
        fileToUpload = new File([blob], upload_file_name, { type: 'image/png' })
      } catch (error) {
        throw new Error('读取文件失败')
      }
    }
    // #endif

    // 上传文件
    const result = await client.put(`wimg/${upload_file_name}`, fileToUpload)

    if (result && result.url) {
      // 直接使用固定的自定义域名前缀 + 唯一文件名
      const customUrl = `http://video.caimizm.com/wimg/${upload_file_name}`

      callback(customUrl)
    } else {
      throw new Error('上传失败')
    }

  } catch (error) {
    throw error
  }
}

// 生成表单图片 - H5环境
// #ifdef H5
const generateFormImageH5 = () => {
  return new Promise((resolve, reject) => {
    try {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')

      const width = 750
      const height = 1200
      canvas.width = width
      canvas.height = height

      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, width, height)

      ctx.font = 'bold 32px Arial'
      ctx.fillStyle = '#333333'
      ctx.textAlign = 'center'
      ctx.fillText('开奖号码记录', width / 2, 60)

      ctx.font = '24px Arial'
      ctx.textAlign = 'left'
      ctx.fillStyle = '#666666'
      let yPos = 120

      ctx.fillText(`期号: ${formData.value.issueNo || ''}`, 40, yPos)
      yPos += 40
      ctx.fillText(`姓名: ${formData.value.name1 || ''}`, 40, yPos)
      yPos += 40
      ctx.fillText(`日期: ${formData.value.date || ''}`, 40, yPos)
      yPos += 80

      options.value.forEach((option, index) => {
        if (option.hasInputs && option.inputs && option.inputs.some(input => input.trim())) {
          ctx.fillStyle = '#333333'
          ctx.font = 'bold 25px Arial'
          const validInputs = option.inputs.filter(input => input.trim())
          ctx.fillText(option.label, 25, yPos)
          const fontsize = ((width - 25 - (option.label.length * 30)) / (validInputs.length * (4)) * 1.45)
          ctx.font = `bold ${Math.min(fontsize, 60)}px Arial`
          ctx.fillText(`${validInputs.join(', ')}`, 25 + (option.label.length * 30), yPos)
          yPos += 80
        }
      })

      if (remark.value.trim()) {
        yPos += 20
        ctx.fillStyle = '#666666'
        ctx.font = '60px Arial'
        ctx.fillText(`备注: ${remark.value}`, 40, yPos)
      }

      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], `form-${Date.now()}.png`, { type: 'image/png' })
          resolve(file)
        } else {
          reject(new Error('生成图片失败'))
        }
      }, 'image/png')
    } catch (error) {
      reject(error)
    }
  })
}
// #endif

// 生成表单图片 - 小程序/App环境
// #ifndef H5
const generateFormImageMP = () => {
  return new Promise((resolve, reject) => {
    try {
      const ctx = uni.createCanvasContext('formCanvas')
      const width = canvasWidth.value
      const height = canvasHeight.value

      ctx.setFillStyle('#ffffff')
      ctx.fillRect(0, 0, width, height)

      ctx.setFillStyle('#333333')
      ctx.setFontSize(32)
      ctx.setTextAlign('center')
      ctx.fillText('开奖号码记录', width / 2, 60)

      ctx.setFontSize(24)
      ctx.setTextAlign('left')
      ctx.setFillStyle('#666666')
      let yPos = 120

      ctx.fillText(`期号: ${formData.value.issueNo || ''}`, 40, yPos)
      yPos += 40
      ctx.fillText(`姓名: ${formData.value.name1 || ''}`, 40, yPos)
      yPos += 40
      ctx.fillText(`日期: ${formData.value.date || ''}`, 40, yPos)
      yPos += 60

      options.value.forEach((option) => {
        if (option.hasInputs && option.inputs && option.inputs.some(input => input.trim())) {
          ctx.setFillStyle('#333333')
          ctx.setFontSize(26)
          const validInputs = option.inputs.filter(input => input.trim())
          ctx.fillText(`${option.label}: ${validInputs.join(', ')}`, 40, yPos)
          yPos += 35
        }
      })

      if (remark.value.trim()) {
        yPos += 20
        ctx.setFillStyle('#666666')
        ctx.setFontSize(24)
        ctx.fillText(`备注: ${remark.value}`, 40, yPos)
      }

      ctx.draw(false, () => {
        setTimeout(() => {
          uni.canvasToTempFilePath({
            canvasId: 'formCanvas',
            success: (res) => {
              resolve(res.tempFilePath)
            },
            fail: () => {
              reject(new Error('生成图片失败'))
            }
          })
        }, 300)
      })
    } catch (error) {
      reject(error)
    }
  })
}
// #endif

// 生成表单图片（统一入口）
const generateFormImage = async () => {
  // #ifdef H5
  return await generateFormImageH5()
  // #endif
  // #ifndef H5
  return await generateFormImageMP()
  // #endif
}

// 提交表单
const handleSubmit = async () => {
  // 优先使用 routeParams 中的值，否则从本地存储获取
  let videoId = routeParams.value.videoId || null
  let issueno = routeParams.value.issueno || formData.value.issueNo
  let tname = routeParams.value.tname || ''
  let opendate = routeParams.value.opendate || formData.value.date

  // 从本地存储获取（如果 routeParams 中没有）
  try {
    const paidVideoInfo = uni.getStorageSync('paidVideoInfo')
    if (paidVideoInfo) {
      if (!videoId && paidVideoInfo.videoId) {
        videoId = paidVideoInfo.videoId
      }
      if (!issueno && paidVideoInfo.issueno) {
        issueno = paidVideoInfo.issueno
      }
      if (!tname && paidVideoInfo.tname) {
        tname = paidVideoInfo.tname
      }
      if (!opendate && paidVideoInfo.opendate) {
        opendate = paidVideoInfo.opendate
      }
    }
  } catch (error) {
    // 静默处理错误
  }

  // 验证必填字段
  if (!videoId || videoId === null || videoId === 'null' || videoId === '') {
    uni.showToast({
      title: '视频ID不能为空，请重新上传视频',
      icon: 'none',
      duration: 3000
    })
    return
  }

  if (!issueno) {
    uni.showToast({
      title: '期号不能为空',
      icon: 'none'
    })
    return
  }

  if (!tname) {
    uni.showToast({
      title: '彩票名称不能为空',
      icon: 'none'
    })
    return
  }

  if (!opendate) {
    uni.showToast({
      title: '开奖日期不能为空',
      icon: 'none'
    })
    return
  }

  // 构建表单内容
  let content = `姓名: ${formData.value.name1}\n\n`

  options.value.forEach((option, index) => {
    if (option.hasInputs && option.inputs && option.inputs.some(input => input.trim())) {
      content += `${option.label}: `
      const validInputs = option.inputs.filter(input => input.trim())
      if (validInputs.length > 0) {
        content += validInputs.join(', ')
      }
      content += '\n'
    }
  })

  if (remark.value.trim()) {
    content += `\n备注: ${remark.value}`
  }

  // 生成图片并上传
  let wimgUrl = ''
  try {
    uni.showLoading({ title: '正在生成图片...' })

    // 生成图片
    const imageResult = await generateFormImage()

    uni.showLoading({ title: '正在上传图片...' })

    // 处理不同环境返回的结果
    let uploadFile = imageResult

    // #ifdef H5
    if (typeof imageResult === 'string') {
      // H5 环境：将路径转换为 File 对象
      const response = await fetch(imageResult)
      const blob = await response.blob()
      uploadFile = new File([blob], `form-${Date.now()}.png`, { type: 'image/png' })
    }
    // #endif

    // 上传到 OSS
    wimgUrl = await new Promise((resolve, reject) => {
      uploadObject(uploadFile, (url) => {
        resolve(url)
      })
    })
  } catch (error) {
    uni.showToast({
      title: '生成图片失败，将继续提交表单',
      icon: 'none',
      duration: 2000
    })
  }

  try {
    uni.showLoading({
      title: '提交中...'
    })

    // 准备提交数据
    const submitData = {
      videoId: videoId,
      content: content,
      issueno: issueno,
      tname: tname,
      opendate: opendate,
      wimg: wimgUrl // 表单图片URL
    }

    const response = await apiWordInsert(submitData)

    uni.hideLoading()

    if (response.code === 200) {
      // 保存表单图片 URL 到本地存储（以便视频播放后可以显示）
      if (wimgUrl && videoId) {
        try {
          const formImageData = {
            videoId: videoId,
            wimgUrl: wimgUrl,
            timestamp: Date.now()
          }
          uni.setStorageSync(`formImage_${videoId}`, formImageData)
        } catch (e) {
          // 静默处理存储错误
        }
      }

      uni.showToast({
        title: '提交成功',
        icon: 'success'
      })

      // 延迟返回上一页
      setTimeout(() => {
        uni.navigateBack()
      }, 1500)
    } else {
      uni.showToast({
        title: response.msg || '提交失败',
        icon: 'none'
      })
    }
  } catch (error) {
    uni.hideLoading()
    uni.showToast({
      title: '提交失败，请重试',
      icon: 'none'
    })
  }
}
</script>

<style lang="scss" scoped>
.test-btn {
  position: absolute;
  top: 100rpx;

}

.biaodan-container {
  min-height: 100vh;
  background-color: #fff;
  display: flex;
  flex-direction: column;
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

.nav-left,
.nav-right {
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
  padding: 100rpx 10rpx 30rpx;
  width: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  flex: 1;

  .flex-1 {
    flex: 1
  }
}

/* 输入区域 */
.input-section {
  box-sizing: border-box;
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
  // gap: 12rpx;
}

.input-label {
  font-size: 36rpx;
  color: #f00;
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
  font-size: 34rpx;
  color: #333;
}

.input-box::placeholder {
  color: #bbb;
}

/* 标题区域 */
.title-section {
  text-align: center;
  margin-bottom: 5rpx;
  /* padding-bottom: 2rpx; */
  border-bottom: 1rpx solid #e8e8e8;
}

.main-title {
  font-size: 30rpx;
  font-weight: bold;
  color: #333;
}

/* 选项列表 */
.options-section {
  /* margin-bottom: 10rpx; */
  display: flex;
  flex-direction: column;
}

.option-item {
  /* margin-bottom: 8rpx; */
  background-color: #fff;
  border: 1rpx solid #e8e8e8;
  border-radius: 6rpx;
  box-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.04);
  transition: all 0.2s ease;
  overflow: hidden;
  display: flex;
}

.option-item:active {
  transform: scale(0.98);
}

.option-header-row {
  width: 100%;
  box-sizing: border-box;
  padding: 0 12rpx;
  background-color: #fafafa;
  border-bottom: 1rpx solid #f0f0f0;
}

.option-header-row.inline-input {
  display: flex;
  align-items: center;
  gap: 10rpx;
  flex-wrap: wrap;
}

.option-content {
  display: flex;
  align-items: center;
  gap: 12rpx;
  flex-shrink: 0;
  white-space: nowrap;
  // flex: 30rpx;
}

.option-text {
  font-size: 35rpx;
  width: 80rpx;
  color: #ff0000;
  font-weight: 600;
}

.option-desc {
  font-size: 24rpx;
  color: #666;
  background-color: #fff;
  padding: 0 12rpx;
  border-radius: 4rpx;
}

.option-inputs {
  width: 100%;
  padding: 4rpx 8rpx 8rpx;
  background-color: #fff;
  box-sizing: border-box;
}


/* 备注栏 */
.remark-section {
  display: flex;
  background-color: #fff;
  padding: 0 10rpx;
  border-radius: 6rpx;
  box-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.04);
}

.remark-label {
  font-size: 38rpx;
  width: 135rpx;
  color: #f00;
  font-weight: 600;
  line-height: 80rpx;
  margin-bottom: 8rpx;
}

.remark-input {
  width: 100%;
  min-height: 60rpx;
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
  // position: fixed;
  // bottom: 20rpx;
  // left: 0;
  // right: 0;
  margin-top: 30rpx;
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

/* 隐藏的 Canvas（用于小程序环境生成图片） */
.hidden-canvas {
  position: fixed;
  top: -9999px;
  left: -9999px;
  visibility: hidden;
  z-index: -1;
}


.grid-container {
  display: grid;
  height: 100%;
}

.inline-input-box {
  height: 100%;
}

/* 默认情况：1-4个子项不换行，撑满宽度 */
.grid-container {
  grid-template-columns: repeat(auto-fit, minmax(10rpx, 1fr));

  .item {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    background-color: #f9f9f9;
    border: 1rpx solid #e0e0e0;
    border-radius: 4rpx;

    height: 100%;

    font-size: 40rpx;
    text-align: center;
  }
}

/* 5个子项时：每4个换行 */
.grid-container:has(.item:nth-child(5):last-child) {
  grid-template-columns: repeat(4, 1fr);
}

/* 6个子项时：每3个换行 */
.grid-container:has(.item:nth-child(6):last-child) {
  grid-template-columns: repeat(3, 1fr);
}
</style>