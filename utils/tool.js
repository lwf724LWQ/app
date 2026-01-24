import { client, initOSS, uploadForApp } from "./alioss.js";
import { nanoid } from "nanoid/non-secure";
import { apiAppversionQuery } from "../api/apis.js";
import h5wxsdk from "./uniwxsdk/h5.js";
import { useUserStore } from "../stores/userStore";

const tool = {
  oss: {
    async uploadImgForTempPath(tempFilePath, folder) {
      // 在H5环境中，需要将临时路径转换为File对象
      let fileToUpload;

      // #ifdef H5
      // H5环境
      const response = await fetch(tempFilePath);
      const blob = await response.blob();
      fileToUpload = new File([blob], "avatar.jpg", { type: "image/jpeg" });
      // #endif
      // #ifndef H5
      // 小程序 APP环境
      fileToUpload = tempFilePath;
      // #endif

      // 上传到OSS
      const uploadRes = await tool.oss.upload(fileToUpload, {
        folder: folder,
      });
      // console.log(uploadRes)
      return uploadRes.name;
    },
    async upload(file, options = {}) {
      // try {
      // 确保客户端已初始化
      // #ifdef H5
      let ossClient = client;
      if (!ossClient) {
        ossClient = await initOSS();
      }
      // #endif

      // 从选项中获取文件夹路径和文件名前缀
      const folder = options.folder || "uploads";
      const prefix = options.prefix || "";

      // #ifdef H5
      if (!(file instanceof File)) {
        // 不是file文件
        new Error("H5下必须传入file对象");
      }
      // #endif

      // 安全地获取文件名
      let fileName = "";
      console.log(file);
      if (file && file.name) {
        fileName = file.name;
      } else if (file && file.path) {
        const pathParts = file.path.split("/");
        fileName = pathParts[pathParts.length - 1];
      } else if (typeof file === "string") {
        fileName = file;
      } else {
        throw new Error("文件对象格式不正确，缺少 name 或 path 属性");
      }

      // 安全地截取文件后缀名
      const index = fileName.lastIndexOf(".");
      if (index === -1) {
        throw new Error("文件名不包含扩展名");
      }
      const suffix = fileName.substring(index + 1);

      // 生成唯一文件名
      const uuid = nanoid();
      const remoteFileName = `${folder}/${prefix}${uuid}.${suffix}`;

      console.log("上传文件信息:", {
        原始文件名: fileName,
        远程文件名: remoteFileName,
      });
      // return await uploadForApp(remoteFileName, file, options)
      // 使用 put 方法（兼容性更好）
      // #ifdef H5
      console.log("h5 oss库上传");
      const result = await client.multipartUpload(remoteFileName, file, {
        timeout: 600000,
        parallel: 4,
        partSize: 1024 * 1024,
        progress: function (p, cpt, res) {
          if (options.progress instanceof Function) {
            options.progress(p);
          }
          // console.log(p);
          // console.log(cpt);
          // console.log(res);
        },
      });
      return result;
      // #endif

      // #ifdef APP-PLUS
      console.log("app上传");
      return await uploadForApp(remoteFileName, file, options);
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
    },
    // 获取oss文件的完整url
    getFullUrl(url) {
      if (url.startsWith("http")) {
        return url;
      } else {
        if (!url.startsWith("/")) {
          url = "/" + url;
        }
        return "http://video.caimizm.com" + url;
      }
    },
  },

  pay() {
    return new Promise((resolve, reject) => {
      // #ifdef H5
      h5wxsdk.wxPay;
      // #endif

      // #ifdef APP-PLUS

      // #endif
    });
  },
  initWxSDK() {
    h5wxsdk.wxInit();
  },
  formatUrlParams(params) {
    return Object.keys(params)
      .filter((key) => params[key] !== null && params[key] !== "")
      .map((key) => `${key}=${encodeURIComponent(params[key])}`)
      .join("&");
  },
  optionsParamsDecode(options) {
    const newObj = {};

    if (typeof options === 'object') {
      for (const key in options) {
        if (Object.prototype.hasOwnProperty.call(options, key)) {
          newObj[key] = decodeURIComponent(options[key]);
        }
      }
    }

    return newObj;
  },
  isLogin(text) {
    const userStore = useUserStore();
    if (userStore.getUserInfo.account) {
      return true;
    } else {
      uni.showModal({
        title: "提示",
        content: text || "该功能需要登录，是否前往",
        success: async (res) => {
          if (res.confirm) {
            uni.navigateTo({ url: "/pages/login/login" });
          }
        },
        showCancel: true,
      });
      return false;
    }
  }
};

export default tool;
