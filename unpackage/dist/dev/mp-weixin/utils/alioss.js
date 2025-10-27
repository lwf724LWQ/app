"use strict";
const common_vendor = require("../common/vendor.js");
const api_apis = require("../api/apis.js");
exports.client = null;
let isInitializing = false;
async function initOSS() {
  if (isInitializing) {
    return new Promise((resolve) => {
      const checkInterval = setInterval(() => {
        if (exports.client) {
          clearInterval(checkInterval);
          resolve(exports.client);
        }
      }, 100);
    });
  }
  isInitializing = true;
  try {
    const sts = await api_apis.apigetsts();
    common_vendor.index.__f__("log", "at utils/alioss.js:23", "STS获取成功:", sts);
    exports.client = new common_vendor.OSS({
      accessKeyId: sts.data.STSaccessKeyId,
      accessKeySecret: sts.data.STSsecretAccessKey,
      stsToken: sts.data.security_token,
      bucket: "cjvd",
      region: "oss-cn-guangzhou"
    });
    common_vendor.index.__f__("log", "at utils/alioss.js:33", "OSS客户端初始化成功");
    isInitializing = false;
    return exports.client;
  } catch (error) {
    common_vendor.index.__f__("error", "at utils/alioss.js:37", "OSS客户端初始化失败:", error);
    isInitializing = false;
    throw error;
  }
}
exports.initOSS = initOSS;
//# sourceMappingURL=../../.sourcemap/mp-weixin/utils/alioss.js.map
