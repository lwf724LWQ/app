<template>
  <view class="container">
    <!-- 上传区域 -->
    <view class="upload-area" @click="chooseFile">
      <u-icon name="plus" size="50" color="#3498db"></u-icon>
      <view class="upload-text">点击选择文件</view>
      <view class="upload-hint">支持上传所有类型文件，大小不超过5MB</view>
    </view>
    
    <!-- 上传进度 -->
    <view class="progress-area" v-if="uploadProgress > 0">
      <u-line-progress 
        :percent="uploadProgress" 
        active-color="#3498db"
        :show-percent="true"
      />
    </view>
    
    <!-- 状态信息 -->
    <view class="status-message" :class="statusClass">
      {{ statusMessage }}
    </view>
    
    <!-- 操作按钮 -->
    <view class="action-buttons">
      <button 
        type="primary" 
        @click="startUpload"
        :disabled="fileList.length === 0"
      >
        开始上传
      </button>
      <button 
        type="default" 
        @click="clearFiles"
        :disabled="fileList.length === 0"
      >
        清空文件
      </button>
    </view>
    
    <!-- 上传结果 -->
   <view class="result-area" v-if="uploadResults.length > 0">
      <view class="file-list">
        <view v-for="(result, index) in uploadResults" :key="index" class="file-item">
          <view class="file-icon">
            <u-icon name="file" size="24" color="#409eff"></u-icon>
          </view>
          <view class="file-info">
            <text class="file-name">{{ result.name }}</text>
            <text class="file-size">{{ formatFileSize(result.size) }}</text>
          </view>
          <view class="file-url">
            <text>{{ result.url }}</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import tool from '@/utils/tool.js'

// 文件列表
const fileList = ref([])
// 上传结果
const uploadResults = ref([])
// 上传进度
const uploadProgress = ref(0)
// 状态信息
const statusMessage = ref('请选择要上传的文件')
const statusClass = ref('')

// 选择文件
const chooseFile = () => {
  uni.chooseImage({
    count: 5,
    sizeType: ['original', 'compressed'],//图片尺寸，可以是原图、压缩图
    sourceType: ['album', 'camera'],//表示可以从相册/相机选择
    success: (res) => {
      const tempFilePaths = res.tempFilePaths
	  console.log(res.tempFilePaths)
      fileList.value = res.tempFiles
      statusMessage.value = `已选择${fileList.value.length}个文件，点击"开始上传"按钮上传`
      statusClass.value = 'status-warning'
    }
  })
}

// 开始上传
const startUpload = async () => {
  if (fileList.value.length === 0) {
    statusMessage.value = '请先选择文件'
    statusClass.value = 'status-error'
    return
  }
  
  statusMessage.value = '正在上传...'
  statusClass.value = 'status-warning'
  uploadProgress.value = 0
  
  for (let i = 0; i < fileList.value.length; i++) {
    const file = fileList.value[i]
    try {
      // 执行上传
      const result = await tool.oss.upload(file, {
        progress: (percentage) => {
          uploadProgress.value = Math.floor(percentage * 100)
          statusMessage.value = `上传中: ${uploadProgress.value}%`
        }
      })
      console.log(result)
      // 添加到上传结果
      uploadResults.value.push({
        name: file.name,
        size: file.size,
        url: result.url,
      })
      
      statusMessage.value = `文件"${file.name}"上传成功`
      statusClass.value = 'status-success'
    } catch (error) {
      statusMessage.value = `文件"${file.name}"上传失败: ${error.message}`
      statusClass.value = 'status-error'
    }
  }
}

// 清空文件
const clearFiles = () => {
  fileList.value = []
  uploadResults.value = []
  uploadProgress.value = 0
  statusMessage.value = '已清空所有文件'
  statusClass.value = 'status-warning'
}

// 格式化文件大小
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}
</script>

<style>
.container {
  padding: 20rpx;
}

.upload-area {
  border: 2px dashed #3498db;
  border-radius: 8px;
  padding: 30px;
  text-align: center;
  background: #f8fafc;
  margin-bottom: 20px;
}

.upload-text {
  font-size: 18px;
  margin: 10px 0;
  
}

.upload-hint {
  font-size: 14px;
  color: #7f8c8d;
}

.progress-area {
  margin: 20px 0;
}

.status-message {
  padding: 10px;
  border-radius: 4px;
  text-align: center;
  margin-bottom: 20px;
}

.status-success {
  background-color: #e8f6ef;
  color: #27ae60;
}

.status-error {
  background-color: #fdecea;
  color: #e74c3c;
}

.status-warning {
  background-color: #e8f4fc;
  color: #3498db;
}

.action-buttons {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.result-area {
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  padding: 15px;
}

.file-list {
  margin-top: 10px;
}

.file-item {
  display: flex;
  align-items: center;
  padding: 10px;
  border-bottom: 1px solid #e4e7ed;
}

.file-icon {
  margin-right: 10px;
}

.file-info {
  flex: 1;
}

.file-name {
  font-weight: bold;
}

.file-size {
  font-size: 12px;
  color: #909399;
}

.file-url {
  word-break: break-all;
  font-size: 14px;
  color: #666;
}
</style>