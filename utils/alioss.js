import OSS from 'ali-oss'
import { apigetsts } from '@/api/apis.js'

let client = null
let isInitializing = false

async function initOSS() {
  if (isInitializing) {
    // 如果正在初始化，等待完成
    return new Promise(resolve => {
      const checkInterval = setInterval(() => {
        if (client) {
          clearInterval(checkInterval)
          resolve(client)
        }
      }, 100)
    })
  }
  
  isInitializing = true
  try {
    const sts = await apigetsts()
    console.log('STS获取成功:', sts)

    client = new OSS({
      accessKeyId: sts.data.STSaccessKeyId,
      accessKeySecret: sts.data.STSsecretAccessKey,
      stsToken: sts.data.security_token,
      bucket: 'cjvd',
      region: 'oss-cn-guangzhou',
    })
    
    console.log('OSS客户端初始化成功')
    isInitializing = false
    return client
  } catch (error) {
    console.error('OSS客户端初始化失败:', error)
    isInitializing = false
    throw error
  }
}

function uploadForApp(remoteFileName, file,options = {}) {
  return new Promise((resolve, reject) => { 
    apigetsts().then(stsRes => {
      const STS = stsRes.data
	  console.log("STS:",STS)
	  const formData = {
            'success_action_status': '200',
            'policy': STS.policy,
            'x-oss-signature': STS.signature,
			'x-oss-credential': STS.x_oss_credential,
            'x-oss-signature-version': STS.x_oss_signature_version,
            'x-oss-date': STS.x_oss_date,
            'key': remoteFileName,
            'x-oss-security-token': STS.security_token
          }
		  console.log("formData", formData)
      const uploadTask = uni.uploadFile({
          url: `http://cjvd.oss-cn-guangzhou.aliyuncs.com`, //仅为示例，非真实的接口地址
          filePath: file,
          timeout: 9999999999,
          name: 'file',
          formData,
          success: (uploadFileRes) => {
            console.log("上传完成")
            console.log(uploadFileRes);
            resolve({
              name: remoteFileName, // 文件名
            })
          },
          error: (err) => {
            console.log(err);
            reject(err)
          }
        });
        console.log("上传任务", uploadTask)
        uploadTask.onProgressUpdate((res) => {
          console.log('上传进度:', res.progress)
          console.log('已经上传的数据长度:', res.totalBytesSent)
          console.log('预期需要上传的数据总长度:', res.totalBytesExpectedToSend)
          if (options.progress instanceof Function) {
            options.progress(res.progress / 100)
          }
        })
      })
  });
  
}
// 导出初始化函数和客户端
export { client, initOSS, uploadForApp }