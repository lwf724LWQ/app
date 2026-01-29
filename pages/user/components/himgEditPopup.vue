<template>
	<uni-popup
		 ref="popupRef" type="dialog" class="himgEditPopup" :mask-click="false"
	>
	<view class="popup-content">
		<qf-image-cropper :src="imageSrc" :width="180" :height="100" :radius="0" @crop="onConfirm"></qf-image-cropper>

	</view>
		
	</uni-popup>
</template>

<script>
	import qfImageCropper from "@/uni_modules/qf-image-cropper/components/qf-image-cropper/qf-image-cropper.vue"
	export default {
		components:{qfImageCropper
		},
		data(){
			return {
				imageSrc: ""
			}
		},
		methods:{
			open(imgsrc, callBack){
				
				// #ifdef APP-PLUS
				uni.showLoading({
					title: "处理图片中..."
				})
				uni.compressImage({
				  src: imgsrc,
				  quality: 80,
				  compressedWidth: 300,
				  success: res => {
				    uni.hideLoading()
					
					this.imageSrc = res.tempFilePath
					this.$refs.popupRef.open()
					this.callBack = callBack
					
				  }
				})
				return
				// #endif
				
				this.imageSrc = imgsrc
				this.$refs.popupRef.open()
				this.callBack = callBack
			},
			onConfirm(obj){
				console.log(obj)
				const filePath = obj.tempFilePath;
				this.callBack(filePath)
				this.onCancel()
			},
			onCancel(){
				this.$refs.popupRef.close()
			}
		}
	}
</script>

<style lang="scss">
	.himgEditPopup{
		.popup-content{
			height: 100vh;
			width: 90vw;
		}
		.content{
			z-index: 200;
			
		}
		.t-cropper{
			left: 0;
		}
	}
</style>