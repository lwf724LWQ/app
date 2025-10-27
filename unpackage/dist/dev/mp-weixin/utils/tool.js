"use strict";
const common_vendor = require("../common/vendor.js");
const utils_alioss = require("./alioss.js");
const tool = {
  oss: {
    async upload(file, options = {}) {
      try {
        let ossClient = utils_alioss.client;
        if (!ossClient) {
          ossClient = await utils_alioss.initOSS();
        }
        const folder = options.folder || "uploads";
        const prefix = options.prefix || "";
        let fileName = "";
        if (file && file.name) {
          fileName = file.name;
        } else if (file && file.path) {
          const pathParts = file.path.split("/");
          fileName = pathParts[pathParts.length - 1];
        } else {
          throw new Error("文件对象格式不正确，缺少 name 或 path 属性");
        }
        const index = fileName.lastIndexOf(".");
        if (index === -1) {
          throw new Error("文件名不包含扩展名");
        }
        const suffix = fileName.substring(index + 1);
        const uuid = common_vendor.nanoid();
        const remoteFileName = `${folder}/${prefix}${uuid}.${suffix}`;
        common_vendor.index.__f__("log", "at utils/tool.js:40", "上传文件信息:", {
          原始文件名: fileName,
          远程文件名: remoteFileName
        });
        return await ossClient.put(remoteFileName, file, {
          progress: options.progress || function(p) {
            common_vendor.index.__f__("log", "at utils/tool.js:48", "上传进度:", Math.round(p * 100) + "%");
          }
        });
      } catch (error) {
        common_vendor.index.__f__("error", "at utils/tool.js:52", "上传文件时发生错误:", error);
        throw error;
      }
    }
  }
};
exports.tool = tool;
//# sourceMappingURL=../../.sourcemap/mp-weixin/utils/tool.js.map
