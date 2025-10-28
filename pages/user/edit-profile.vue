<template>
    <view class="edit-profile-container">
      <!-- 导航栏 -->
      <view class="navbar">
        <view class="nav-content">
          <view class="nav-left" @click="goBack">
            <text class="back-arrow">‹</text>
          </view>
          <text class="nav-title">编辑资料</text>
          <view class="nav-right" @click="saveProfile">
            <text class="save-text">保存</text>
          </view>
        </view>
      </view>
      
      <!-- 主要内容区域 -->
      <view class="main-content">
        <!-- 头像显示区域 -->
       <view class="avatar-section">
          <view class="avatar-container" @click="handleAvatarClick">
            <image 
              :src="userInfo.avatar" 
              mode="aspectFill" 
              class="avatar-image"
              @error="handleImageError"
            ></image>
            <view class="avatar-overlay">
              <uni-icons type="camera" size="24" color="#fff"></uni-icons>
              <text class="avatar-text">点击上传头像</text>
            </view>
          </view>
        </view>
		<!-- <view class="avatar-section">
		   <view class="avatar-container">
		     <image 
		       :src="userInfo.avatar" 
		       mode="aspectFill" 
		       class="avatar-image"
		       @error="handleImageError"
		     ></image>
		     <view class="avatar-overlay">
		       <uni-icons type="camera" size="24" color="#fff"></uni-icons>
		       <text class="avatar-text">点击上传头像</text>
		     </view>
		   </view>
		 </view> -->
        
        <!-- 用户信息表单 -->
        <view class="form-section">
          <view class="form-item">
            <text class="form-label">昵称</text>
            <input 
              type="text" 
              v-model="userInfo.nickname" 
              placeholder="请输入昵称"
              class="form-input"
              maxlength="20"
            />
          </view>
          
          <view class="form-item">
            <text class="form-label">手机号</text>
            <input 
              type="text" 
              v-model="userInfo.phone" 
              placeholder="手机号"
              class="form-input disabled"
              maxlength="11"
              disabled
            />
          </view>
        </view>
        
        <!-- 保存按钮 -->
        <view class="save-section">
          <button class="save-btn" @click="saveProfile" :disabled="isSaving">
            <uni-icons v-if="isSaving" type="spinner-cycle" size="16" color="#fff"></uni-icons>
            <text v-else class="save-btn-text">{{ isSaving ? '保存中...' : '保存修改' }}</text>
          </button>
          
        </view>
      </view>
    </view>
  </template>
  
  <script setup>
  import { ref, reactive, onMounted } from 'vue'
  import { getToken, getAccount } from '@/utils/request.js'
  import { apiUpdateUserProfile, getCOSSecretKey } from '@/api/apis.js'
  
  // 用户信息
  const userInfo = reactive({
    avatar: 'http://video.caimizm.com/himg/user.png',
    nickname: '',
    phone: ''
  })
  
  // 保存状态
  const isSaving = ref(false)
  
  // 按照图片示例实现的OSS上传函数
  const uploadObject = async (file, callback) => {
    try {
      let fileName = file.name || ''
      const origin_file_name = fileName.split(".").slice(0, fileName.split(".").length - 1).join('.') // 获取文件名
      
      // 获取当前时间戳
      const upload_file_name = new Date().getTime() + '.' + fileName.split(".")[fileName.split(".").length - 1]
      
      // 请求接口得到token
      let res = await getCOSSecretKey({})
      
      console.log('STS接口返回数据:', res)
      console.log('STS接口返回的data字段:', res.data)
      
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
      
      console.log('OSS配置:', {
        region: ossConfig.region,
        bucket: ossConfig.bucket,
        endpoint: ossConfig.endpoint,
        accessKeyId: ossConfig.accessKeyId ? '***' : 'MISSING',
        accessKeySecret: ossConfig.accessKeySecret ? '***' : 'MISSING',
        stsToken: ossConfig.stsToken ? '***' : 'MISSING'
      })
      
      const client = new OSS.default(ossConfig)
      
      console.log('开始上传文件:', upload_file_name)
      // 上传文件
      const result = await client.put(`himg/${upload_file_name}`, file)
      
      if (result && result.url) {
        // 直接使用固定的自定义域名前缀 + 唯一文件名
        const customUrl = `http://video.caimizm.com/himg/${upload_file_name}`
        
        console.log('上传成功，生成的自定义URL:', customUrl)
        callback(customUrl)
      } else {
        throw new Error('上传失败')
      }
      
    } catch (error) {
      console.error('OSS上传失败:', error)
      throw error
    }
  }
  
  // 返回上一页
  const goBack = () => {
    uni.navigateBack()
  }
  
  
  // 处理图片加载错误
  const handleImageError = () => {
    userInfo.avatar = 'http://video.caimizm.com/himg/user.png'
  }
  
  // 处理头像点击事件
  const handleAvatarClick = async () => {
    try {
      // 选择图片
      const chooseResult = await uni.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera']
      })
      
      if (chooseResult.tempFilePaths && chooseResult.tempFilePaths.length > 0) {
        const tempFilePath = chooseResult.tempFilePaths[0]
        
        // 显示上传进度
        uni.showLoading({
          title: '上传头像中...'
        })
        
        // 在H5环境中，需要将临时路径转换为File对象
        let fileToUpload
        if (process.env.NODE_ENV === 'development' || typeof window !== 'undefined') {
          // H5环境
          const response = await fetch(tempFilePath)
          const blob = await response.blob()
          fileToUpload = new File([blob], 'avatar.jpg', { type: 'image/jpeg' })
        } else {
          // 小程序环境
          fileToUpload = tempFilePath
        }
        
        // 上传到OSS
        await uploadObject(fileToUpload, (url) => {
          // 上传成功，更新头像
          userInfo.avatar = url
          
          uni.hideLoading()
          uni.showToast({
            title: '头像上传成功',
            icon: 'success'
          })
          
          // 立即保存到本地存储
          uni.setStorageSync('userInfo', {
            nickname: userInfo.nickname,
            avatar: userInfo.avatar
          })
          
          const loginData = uni.getStorageSync('loginData') || {}
          loginData.himg = userInfo.avatar
          uni.setStorageSync('loginData', loginData)
        })
        
      }
    } catch (error) {
      uni.hideLoading()
      console.error('头像上传失败:', error)
      uni.showToast({
        title: '头像上传失败',
        icon: 'none'
      })
    }
  }
  
  
  
  
  
  // 验证表单
  const validateForm = () => {
    if (!userInfo.nickname.trim()) {
      uni.showToast({
        title: '请输入昵称',
        icon: 'none'
      })
      return false
    }
    
    return true
  }
  
  // 保存用户信息
  const saveProfile = async () => {
    if (!validateForm()) {
      return
    }
    
    if (isSaving.value) {
      return
    }
    
    try {
      isSaving.value = true
      
      uni.showLoading({
        title: '保存中...'
      })
      
      // 准备保存的数据，根据API文档要求
      const saveData = {
        account: userInfo.phone, // 手机号作为account字段
        uname: userInfo.nickname // 昵称字段名改为 uname
      }
      
      // 如果头像已更新，只传递文件名给后端
      if (userInfo.avatar && userInfo.avatar !== 'http://video.caimizm.com/himg/user.png') {
        // 从完整URL中提取文件名
        const fileName = userInfo.avatar.replace('http://video.caimizm.com/himg/', '')
        saveData.himg = fileName
      }
      
      // 调用保存用户信息的API
      const response = await apiUpdateUserProfile(saveData)
      
      uni.hideLoading()
      
      if (response.code !== 200) {
        throw new Error(response.msg || '保存失败')
      }
      
      uni.showToast({
        title: '保存成功',
        icon: 'success'
      })
      
      // 保存到本地存储
      uni.setStorageSync('userInfo', {
        nickname: userInfo.nickname,
        avatar: userInfo.avatar
      })
      
      const loginData = uni.getStorageSync('loginData') || {}
      loginData.uname = userInfo.nickname
      loginData.himg = userInfo.avatar
      uni.setStorageSync('loginData', loginData)
      
      // 通知其他页面更新
      uni.$emit('userProfileUpdated', {
        nickname: userInfo.nickname,
        avatar: userInfo.avatar
      })
      
      // 延迟返回上一页
      setTimeout(() => {
        uni.navigateBack()
      }, 1500)
      
    } catch (error) {
      uni.hideLoading()
      console.error('保存失败:', error)
      uni.showToast({
        title: '保存失败，请重试',
        icon: 'none'
      })
    } finally {
      isSaving.value = false
    }
  }
  
  // 加载用户信息（从登录时保存的数据中获取）
  const loadUserInfo = async () => {
    const token = getToken()
    const account = getAccount()
    
    if (!token) {
      uni.showToast({
        title: '请先登录',
        icon: 'none'
      })
      setTimeout(() => {
        uni.navigateBack()
      }, 1500)
      return
    }
    
    try {
      // 从本地存储获取登录时保存的用户信息
      const savedUserInfo = uni.getStorageSync('userInfo') || {}
      const loginData = uni.getStorageSync('loginData') || {}
      
      // 加载用户信息
      if (loginData.uname || loginData.account) {
        userInfo.nickname = loginData.uname || '用户'
        userInfo.phone = loginData.account || account || ''
        userInfo.avatar = loginData.himg || 'http://video.caimizm.com/himg/user.png'
      } else {
        userInfo.nickname = savedUserInfo.nickname || '用户'
        userInfo.phone = account || '13637666646'
        userInfo.avatar = savedUserInfo.avatar || 'http://video.caimizm.com/himg/user.png'
      }
      
      console.log('加载的用户信息:', {
        nickname: userInfo.nickname,
        phone: userInfo.phone,
        avatar: userInfo.avatar,
        loginData: loginData
      })
      
    } catch (error) {
      console.error('加载用户信息失败:', error)
      // 使用默认值
      userInfo.nickname = account || '用户'
      userInfo.phone = account || '13637666646'
      userInfo.avatar = 'http://video.caimizm.com/himg/user.png'
    }
  }
  
  onMounted(() => {
    loadUserInfo()
  })
  </script>
  
  <style scoped>
  .edit-profile-container {
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
    width: 80rpx;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .back-arrow {
    font-size: 40rpx;
    color: #fff;
    font-weight: bold;
    line-height: 1;
  }
  
  .nav-title {
    font-size: 36rpx;
    font-weight: 600;
    color: #fff;
  }
  
  .save-text {
    font-size: 28rpx;
    color: #fff;
    font-weight: 500;
  }
  
  /* 主要内容区域 */
  .main-content {
    padding-top: 88rpx;
    padding: 88rpx 30rpx 30rpx;
  }
  
  /* 头像区域 */
  .avatar-section {
    display: flex;
    justify-content: center;
    margin-bottom: 60rpx;
  }
  
  .avatar-container {
    position: relative;
    width: 200rpx;
    height: 200rpx;
    border-radius: 50%;
    overflow: hidden;
    border: 4rpx solid #fff;
    box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.1);
  }
  
  .avatar-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  .avatar-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.3s ease;
  }
  
  .avatar-container:active .avatar-overlay {
    opacity: 1;
  }
  
  .avatar-text {
    font-size: 20rpx;
    color: #fff;
    margin-top: 8rpx;
  }
  
  
  /* 表单区域 */
  .form-section {
    background-color: #fff;
    border-radius: 20rpx;
    padding: 40rpx 30rpx;
    margin-bottom: 40rpx;
    box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
  }
  
  .form-item {
    margin-bottom: 40rpx;
  }
  
  .form-item:last-child {
    margin-bottom: 0;
  }
  
  .form-label {
    display: block;
    font-size: 28rpx;
    color: #333;
    font-weight: 500;
    margin-bottom: 20rpx;
  }
  
  .form-input {
    width: 100%;
    height: 80rpx;
    background-color: #f8f9fa;
    border: 2rpx solid #e9ecef;
    border-radius: 12rpx;
    padding: 0 20rpx;
    font-size: 28rpx;
    color: #333;
    box-sizing: border-box;
  }
  
  .form-input:focus {
    border-color: #28B389;
    background-color: #fff;
  }
  
  .form-input.disabled {
    background-color: #f5f5f5;
    color: #999;
    cursor: not-allowed;
  }
  
  .form-input.disabled:focus {
    border-color: #e9ecef;
    background-color: #f5f5f5;
  }
  
  .form-textarea {
    width: 100%;
    min-height: 120rpx;
    background-color: #f8f9fa;
    border: 2rpx solid #e9ecef;
    border-radius: 12rpx;
    padding: 20rpx;
    font-size: 28rpx;
    color: #333;
    box-sizing: border-box;
    resize: none;
  }
  
  .form-textarea:focus {
    border-color: #28B389;
    background-color: #fff;
  }
  
  /* 保存按钮区域 */
  .save-section {
    padding: 0 30rpx;
  }
  
  .save-btn {
    width: 100%;
    height: 88rpx;
    background: linear-gradient(135deg, #28B389 0%, #20a085 100%);
    color: #fff;
    border-radius: 25rpx;
    font-size: 32rpx;
    font-weight: 600;
    border: none;
    box-shadow: 0 4rpx 15rpx rgba(40, 179, 137, 0.3);
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10rpx;
  }
  
  .save-btn:disabled {
    background: #ccc;
    box-shadow: none;
    cursor: not-allowed;
  }
  
  .save-btn:active:not(:disabled) {
    transform: translateY(2rpx);
    box-shadow: 0 2rpx 8rpx rgba(40, 179, 137, 0.4);
  }
  
  .save-btn-text {
    font-size: 32rpx;
  }
  </style>
  