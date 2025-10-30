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
						<radio value="1" :checked="isCharge === 1" @click="isCharge = 1">免费</radio>
					</label>

					<label class="radio-label">
						<radio value="2" :checked="isCharge === 2" @click="isCharge = 2">收费</radio>
					</label>

				</view>
			</view>

			<view class="form-item" v-if="isCharge === 2">
				<text class="form-label">收费价格</text>
				<input class="form-input" v-model="chargePrice" type="number" placeholder="请输入价格" />
				<text class="price-unit">元</text>
			</view>
		</view>

        <!-- 视频上传区域 -->
        <view class="upload-area" @click="chooseFile">
            <block v-if="selectedVideoUrl">
                <video :src="selectedVideoUrl" class="video-preview" controls muted></video>
                <view class="file-brief">{{ selectedVideoName }}</view>
            </block>
            <block v-else>
                <uni-icons name="plus" size="50" color="#3498db"></uni-icons>
                <view class="upload-text">点击选择视频文件</view>
                <view class="upload-hint">支持上传所有类型文件，大小不超过5MB</view>
            </block>
        </view>

		<!-- 封面选择区域 -->
		<view class="cover-area" v-if="fileList.length > 0">
			<text class="section-title">视频封面</text>
			<view class="cover-preview" @click="chooseCover">
				<image v-if="coverImage" :src="coverImage" class="cover-image"></image>
				<view v-else class="cover-placeholder">
					<uni-icons name="image" size="40" color="#ccc"></uni-icons>
					<text>点击选择封面</text>
				</view>
			</view>
		</view>

		<!-- 上传进度 -->
		<view class="progress-area" v-if="uploadProgress > 0">
			<progress :percent="uploadProgress" active-color="#3498db" show-info />
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
						<uni-icons name="file" size="24" color="#409eff"></uni-icons>
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

    // 封面图片
	const coverImage = ref('')
	const coverFile = ref(null)

    // 视频预览
    const selectedVideoUrl = ref('')
    const selectedVideoName = ref('')

    // 条件满足时跳转到表单页（收费视频）
    const tryGotoBiaodan = () => {
        if (isCharge.value === 2 && fileList.value.length > 0 && (coverFile.value || coverImage.value)) {
            // 缓存草稿数据，便于表单页读取
            try {
                uni.setStorageSync('paidVideoDraft', {
                    title: videoTitle.value,
                    price: Number(chargePrice.value) || 0,
                    videoPath: fileList.value[0].path || fileList.value[0].tempFilePath || '',
                    coverPath: coverImage.value || (coverFile.value && coverFile.value.path) || '',
                    account: getAccount(),
                    timestamp: Date.now()
                })
            } catch (e) {}
            uni.navigateTo({ url: '/pages/video/biaodan' })
        }
    }

    // 选择视频文件（跨端：优先使用 chooseVideo）
    const chooseFile = () => {
        uni.chooseVideo({
            sourceType: ['album','camera'],
            success: (res) => {
                // 统一成与 tempFiles 相似的数据结构，确保包含扩展名
                const path = res.tempFilePath || ''
                const filenameFromPath = path.split('/').pop() || 'video.mp4'
                const hasExt = filenameFromPath.includes('.')
                const name = hasExt ? filenameFromPath : `${filenameFromPath}.mp4`
                const item = { path, size: res.size, name }
                fileList.value = [item]
                selectedVideoUrl.value = item.path
                selectedVideoName.value = item.name
                statusMessage.value = `已选择1个文件，点击"开始上传"按钮上传`
                statusClass.value = 'status-warning'
            },
            fail: () => {
                statusMessage.value = '未选择到文件'
                statusClass.value = 'status-error'
            }
        })
    }

	// 选择封面
	const chooseCover = () => {
		uni.chooseImage({
			count: 1,
			sizeType: ['original', 'compressed'],
			sourceType: ['album', 'camera'],
			success: (res) => {
				const tempFilePath = res.tempFilePaths[0]
				coverImage.value = tempFilePath
				coverFile.value = res.tempFiles[0]
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
    if (isCharge.value === 2 && (!coverImage.value && !coverFile.value)) {
        uni.showToast({ title: '请先选择封面', icon: 'none' })
        return
    }
    try {
        uni.showLoading({ title: '上传视频...' })
        const raw = fileList.value[0]
        let uploadVideo = raw
        if (typeof window !== 'undefined' && raw && raw.path && !raw.slice) {
            const resp = await fetch(raw.path)
            const blob = await resp.blob()
            uploadVideo = new File([blob], raw.name || 'video.mp4', { type: blob.type || 'video/mp4' })
        }
        const videoResult = await tool.oss.upload(uploadVideo, {
            folder: 'videos',
            progress: (p) => { uploadProgress.value = Math.floor(p * 100) }
        })
        let coverUrl = ''
        if (coverFile.value) {
            uni.showLoading({ title: '上传封面...' })
            let uploadCover = coverFile.value
            if (typeof window !== 'undefined' && coverImage.value) {
                const r = await fetch(coverImage.value)
                const b = await r.blob()
                uploadCover = new File([b], (coverFile.value && coverFile.value.name) || 'cover.jpg', { type: b.type || 'image/jpeg' })
            }
            const coverResult = await tool.oss.upload(uploadCover, {
                folder: 'vimg',
                progress: () => {}
            })
            coverUrl = coverResult.name
        }
        uni.hideLoading()
        uni.setStorageSync('paidVideoDraft', {
            title: videoTitle.value,
            price: Number(chargePrice.value) || 0,
            account: getAccount(),
            videoId: videoResult.name,
            coverPath: coverUrl,
            timestamp: Date.now()
        })
        uni.navigateTo({ url: '/pages/video/biaodan' })
    } catch (e) {
        uni.hideLoading()
        uni.showToast({ title: '上传失败，请重试', icon: 'none' })
    }
}
	

	// 清空文件
	const clearFiles = () => {
		fileList.value = []
		uploadResults.value = []
		uploadProgress.value = 0
		coverImage.value = ''
		coverFile.value = null
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

	.navbar-left {
		width: 44px;
		height: 44px;
		display: flex;
		align-items: center;
		justify-content: flex-start;
	}

	.navbar-left .uni-icons {
		color: #fff !important;
		font-size: 22px !important;
	}

	.navbar-title {
		font-size: 18px;
		font-weight: 500;
		text-align: center;
		position: absolute;
		left: 0;
		right: 0;
		pointer-events: none;
	}

	.navbar-right {
		width: 44px;
		/* 与左侧相同的宽度 */
		height: 44px;
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

	/* 新增：封面选择区域 */
	.cover-area {
		margin-bottom: 20px;
	}

	.section-title {
		font-size: 16px;
		font-weight: bold;
		margin-bottom: 10px;
		display: block;
	}

	.cover-preview {
		width: 100%;
		height: 200px;
		border: 1px dashed #ccc;
		border-radius: 8px;
		display: flex;
		align-items: center;
		justify-content: center;
		overflow: hidden;
		background-color: #f8f8f8;
	}

	.cover-image {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.cover-placeholder {
		display: flex;
		flex-direction: column;
		align-items: center;
		color: #999;
		font-size: 14px;
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