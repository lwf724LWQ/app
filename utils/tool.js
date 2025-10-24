import { client } from "./alioss.js";
import { nanoid } from 'nanoid';

const tool = {
  oss: {
    async upload(file, options = {}) {
      try {
        // 从选项中获取文件夹路径和文件名前缀
        const folder = options.folder || 'uploads'; // 默认文件夹
        const prefix = options.prefix || ''; // 文件名前缀
        
        // 安全地获取文件名 - 添加防御性检查
        let fileName = '';
        if (file && file.name) {
          fileName = file.name;
        } else if (file && file.path) {
          // 如果 file.name 不存在，尝试从 file.path 提取文件名
          const pathParts = file.path.split('/');
          fileName = pathParts[pathParts.length - 1];
        } else {
          throw new Error('文件对象格式不正确，缺少 name 或 path 属性');
        }
        
        // 安全地截取文件后缀名
        const index = fileName.lastIndexOf('.');
        if (index === -1) {
          throw new Error('文件名不包含扩展名');
        }
        const suffix = fileName.substring(index + 1);
        
        // 生成唯一文件名（可选添加前缀）
        const uuid = nanoid();
        const remoteFileName = `${folder}/${prefix}${uuid}.${suffix}`;
        
        console.log('上传文件信息:', {
          原始文件名: fileName,
          远程文件名: remoteFileName,
          文件对象: file
        });
        
        // 执行上传操作
        return await client.multipartUpload(remoteFileName, file, {
          progress: options.progress || function(percentage, checkpoint) {
            console.log('上传进度:', percentage, checkpoint, remoteFileName);
          },
        });
      } catch (error) {
        console.error('上传文件时发生错误:', error);
        throw error;
      }
    }
  },
}

export default tool;