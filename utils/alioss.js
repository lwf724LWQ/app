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

// 导出初始化函数和客户端
export { client, initOSS }