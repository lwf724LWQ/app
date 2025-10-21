<template>
	<view class="container">
		<view class="navbar">
			<!-- 返回按钮 -->
			<view class="navbar-left" @click="goBack">
			   <uni-icons type="left" size="30"></uni-icons>
			 </view>
			 <!-- 标题 -->
			 <view class="navbar-title">上传视频</view>
			
		</view>
		
		<!-- 视频信息表单 -->
		<view class="form-area">
			<view class="form-item">
				<text class="form-label">视频标题</text>
				<input class="form-input" v-model="videoTitle" placeholder="请输入视频标题" />
			</view>
			
			<view class="form-item">
				<text class="form-label">是否收费</text>
				<view class="radio-group">
					<label class="radio-label">
						<radio value="1" :checked="isCharge === 1" @click="isCharge = 1" >免费</radio>
					</label>
					
					<label class="radio-label">
						<radio value="2" :checked="isCharge === 2" @click="isCharge = 2" >收费</radio>
					</label>
					
				</view>
			</view>
			
			<view class="form-item" v-if="isCharge === 2">
				<text class="form-label">收费价格</text>
				<input class="form-input" v-model="chargePrice" type="number" placeholder="请输入价格" />
				<text class="price-unit">元</text>
			</view>
		</view>

		<!-- 上传区域 -->
		<view class="upload-area" @click="chooseFile">
			<u-icon name="plus" size="50" color="#3498db"></u-icon>
			<view class="upload-text">点击选择文件</view>
			<view class="upload-hint">支持上传所有类型文件，大小不超过5MB</view>
		</view>

		<!-- 上传进度 -->
		<view class="progress-area" v-if="uploadProgress > 0">
			<u-line-progress :percent="uploadProgress" active-color="#3498db" :show-percent="true" />
		</view>

		<!-- 状态信息 -->
		<view class="status-message" :class="statusClass">
			{{ statusMessage }}
		</view>

		<!-- 操作按钮 -->
		<view class="action-buttons">
			<button type="primary" @click="startUpload" :disabled="fileList.length === 0">
				开始上传
			</button>
			<button type="default" @click="clearFiles" :disabled="fileList.length === 0">
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
	import {
		ref
	} from 'vue'
	import tool from '@/utils/tool.js'
	import {
		apiSubmitVideo
	} from '@/api/apis';
	import {
		setToken,
		getToken,
		setAccount,
		getAccount
	} from '@/utils/request.js'; // 导入setToken，账号
	
	//导航栏
	const goBack = () => {
	  uni.navigateBack({
	    delta: 1
	  });
	};

	// 文件列表
	const fileList = ref([])
	// 上传结果
	const uploadResults = ref([])
	// 上传进度
	const uploadProgress = ref(0)
	// 状态信息
	const statusMessage = ref('请选择要上传的文件')
	const statusClass = ref('')
	
	// 新增：视频信息表单
	const videoTitle = ref('')
	const isCharge = ref(1) // 1=免费，2=收费
	const chargePrice = ref('')
	const videoData = {
	    title: videoTitle.value,
	    flag: isCharge.value === 2, 
	    price: isCharge.value === 2 ? chargePrice.value : '0', 
	}

	// 选择文件
	const chooseFile = () => {
		uni.chooseImage({
			count: 1, // 限制只能选择一个文件
			sizeType: ['original', 'compressed'],
			sourceType: ['album', 'camera'],
			success: (res) => {
				const tempFilePaths = res.tempFilePaths
				console.log(res.tempFilePaths)
				fileList.value = res.tempFiles
				statusMessage.value = `已选择${fileList.value.length}个文件，点击"开始上传"按钮上传`
				statusClass.value = 'status-warning'
				
				// 自动生成默认标题（可选）
				if (!videoTitle.value && fileList.value.length > 0) {
					const fileName = fileList.value[0].name
					videoTitle.value = fileName.replace(/\.[^/.]+$/, "") // 移除文件扩展名
				}
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
		
		// 验证表单
		if (!videoTitle.value.trim()) {
			statusMessage.value = '请输入视频标题'
			statusClass.value = 'status-error'
			return
		}
		
		if (isCharge.value === 2 && (!chargePrice.value || Number(chargePrice.value) <= 0)) {
			statusMessage.value = '请输入有效的收费价格'
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
					},
				})
				
				console.log(result.name)
				
				// 准备发送到后端的数据
				const videoData = {
					title: videoTitle.value,
					flag: isCharge.value,
					price: isCharge.value === 2 ? Number(chargePrice.value) : 0,
					account:getAccount(),
					url: result.name
				}
				
				// 这里添加发送到后端的代码
				// 假设有一个 apiSubmitVideo 函数
				const submitResult = await apiSubmitVideo(videoData)
				
				// 添加到上传结果
				uploadResults.value.push({
					name: file.name,
					size: file.size,
					url: result.url,
				})

				statusMessage.value = `文件"${file.name}"上传成功`
				statusClass.value = 'status-success'
				
				// 重置表单（可选）
				videoTitle.value = ''
				isCharge.value = 1
				chargePrice.value = ''
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
	.navbar-left {
	  width: 44px;
	  height: 44px;
	  display: flex;
	  align-items: center;
	  justify-content: flex-start;
	  .uni-icons{
	    color: #fff!important;
	    font-size: 22px!important;
	  }
	}
	.navbar-title {
	  font-size: 18px;
	  font-weight: 500;
	  flex: 1;
	  text-align: center;
	}
	.navbar {
	  height: 44px;
	  background-color: #1677ff;
	  color: white;
	  display: flex;
	  align-items: center;
	  justify-content: space-between;
	  padding: 0 16px;
	  margin-bottom: 3rpx;
	  position: relative;
	  z-index: 10;
	}
	.container {
		padding: 20rpx;
	}
	
	/* 新增：表单样式 */
	.form-area {
		background: white;
		border-radius: 8px;
		padding: 20rpx;
		margin-bottom: 20px;
		box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
	}
	
	.form-item {
		display: flex;
		flex-direction: column;
		margin-bottom: 30rpx;
	}
	
	.form-label {
		font-size: 32rpx;
		font-weight: 500;
		margin-bottom: 15rpx;
		color: #333;
	}
	
	.form-input {
		border: 1px solid #e4e7ed;
		border-radius: 8rpx;
		padding: 20rpx;
		font-size: 28rpx;
	}
	
	.radio-group {
		display: flex;
		gap: 40rpx;
		font-size: 30rpx;
	}
	
	.radio-label {
		display: flex;
		align-items: center;
		font-size: 30rpx;
	}
	
	.price-unit {
		margin-left: 10rpx;
		color: #999;
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