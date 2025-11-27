import { client, initOSS, uploadForApp } from "./alioss.js";
import { nanoid } from 'nanoid/non-secure';

const tool = {
  oss: {
    async upload(file, options = {}) {
      // try {
        // 确保客户端已初始化
        // #ifdef H5
        let ossClient = client
        if (!ossClient) {
          ossClient = await initOSS()
        }
        // #endif
        
        // 从选项中获取文件夹路径和文件名前缀
        const folder = options.folder || 'uploads'
        const prefix = options.prefix || ''
        
        // 安全地获取文件名
        let fileName = ''
		console.log(file)
        if (file && file.name) {
          fileName = file.name
        } else if (file && file.path) {
          const pathParts = file.path.split('/')
          fileName = pathParts[pathParts.length - 1]
        } else if (typeof file === 'string') {
			fileName = file
		} else {
          throw new Error('文件对象格式不正确，缺少 name 或 path 属性')
        }
        
        // 安全地截取文件后缀名
        const index = fileName.lastIndexOf('.')
        if (index === -1) {
          throw new Error('文件名不包含扩展名')
        }
        const suffix = fileName.substring(index + 1)
        
        // 生成唯一文件名
        const uuid = nanoid()
        const remoteFileName = `${folder}/${prefix}${uuid}.${suffix}`
        
        console.log('上传文件信息:', {
          原始文件名: fileName,
          远程文件名: remoteFileName,
        })
        // return await uploadForApp(remoteFileName, file, options)
        // 使用 put 方法（兼容性更好）
        // #ifdef H5
		    console.log("h5 oss库上传")
        const result = await client.multipartUpload(remoteFileName, file, {
          timeout: 600000,
          parallel: 4,
          partSize: 1024 * 1024,
          progress: function (p, cpt, res) {
            if (options.progress instanceof Function) {
              options.progress(p)
            }
            // console.log(p);
            // console.log(cpt);
            // console.log(res);
          }
        });
        return result;
        // #endif

        // #ifdef APP-PLUS
        console.log('app上传')
        return await uploadForApp(remoteFileName, file, options)
        // #endif
        

        // return await ossClient.put(remoteFileName, file, {
        //   timeout: options.timeout || 600000,
        //   progress: options.progress || function(p) {
        //     if (options.callback instanceof Function) {
        //       options.callback(Math.round(p * 100))
        //     }
        //     console.log('上传进度:', Math.round(p * 100) + '%')
        //   },
        // })
      
    }
  },
}

export default tool