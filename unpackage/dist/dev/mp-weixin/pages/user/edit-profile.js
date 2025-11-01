"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_request = require("../../utils/request.js");
const api_apis = require("../../api/apis.js");
if (!Array) {
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  _easycom_uni_icons2();
}
const _easycom_uni_icons = () => "../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
if (!Math) {
  _easycom_uni_icons();
}
const _sfc_main = {
  __name: "edit-profile",
  setup(__props) {
    const userInfo = common_vendor.reactive({
      avatar: "http://video.caimizm.com/himg/user.png",
      nickname: "",
      phone: ""
    });
    const isSaving = common_vendor.ref(false);
    const uploadObject = async (file, callback) => {
      try {
        let fileName = file.name || "";
        const origin_file_name = fileName.split(".").slice(0, fileName.split(".").length - 1).join(".");
        const upload_file_name = (/* @__PURE__ */ new Date()).getTime() + "." + fileName.split(".")[fileName.split(".").length - 1];
        let res = await api_apis.getCOSSecretKey({});
        common_vendor.index.__f__("log", "at pages/user/edit-profile.vue:113", "STS接口返回数据:", res);
        common_vendor.index.__f__("log", "at pages/user/edit-profile.vue:114", "STS接口返回的data字段:", res.data);
        if (res.code !== 200) {
          throw new Error("获取上传凭证失败");
        }
        const OSS = await "../../common/vendor.js".then((n) => n.aliyunOssSdk);
        const ossConfig = {
          region: res.data.region || "cn-guangzhou",
          accessKeyId: res.data.STSaccessKeyId,
          accessKeySecret: res.data.STSsecretAccessKey,
          stsToken: res.data.security_token,
          bucket: res.data.bucket || "cjvd",
          // 使用正确的endpoint
          endpoint: "https://oss-cn-guangzhou.aliyuncs.com",
          // 添加STS token刷新机制
          refreshSTSToken: async () => {
            const newRes = await api_apis.getCOSSecretKey({});
            return {
              accessKeyId: newRes.data.STSaccessKeyId,
              accessKeySecret: newRes.data.STSsecretAccessKey,
              stsToken: newRes.data.security_token
            };
          },
          refreshSTSTokenInterval: 3e5
          // 5分钟刷新一次
        };
        common_vendor.index.__f__("log", "at pages/user/edit-profile.vue:144", "OSS配置:", {
          region: ossConfig.region,
          bucket: ossConfig.bucket,
          endpoint: ossConfig.endpoint,
          accessKeyId: ossConfig.accessKeyId ? "***" : "MISSING",
          accessKeySecret: ossConfig.accessKeySecret ? "***" : "MISSING",
          stsToken: ossConfig.stsToken ? "***" : "MISSING"
        });
        const client = new OSS.default(ossConfig);
        common_vendor.index.__f__("log", "at pages/user/edit-profile.vue:155", "开始上传文件:", upload_file_name);
        const result = await client.put(`himg/${upload_file_name}`, file);
        if (result && result.url) {
          const customUrl = `http://video.caimizm.com/himg/${upload_file_name}`;
          common_vendor.index.__f__("log", "at pages/user/edit-profile.vue:163", "上传成功，生成的自定义URL:", customUrl);
          callback(customUrl);
        } else {
          throw new Error("上传失败");
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/user/edit-profile.vue:170", "OSS上传失败:", error);
        throw error;
      }
    };
    const goBack = () => {
      common_vendor.index.navigateBack();
    };
    const handleImageError = () => {
      userInfo.avatar = "http://video.caimizm.com/himg/user.png";
    };
    const handleAvatarClick = async () => {
      try {
        const chooseResult = await common_vendor.index.chooseImage({
          count: 1,
          sizeType: ["compressed"],
          sourceType: ["album", "camera"]
        });
        if (chooseResult.tempFilePaths && chooseResult.tempFilePaths.length > 0) {
          const tempFilePath = chooseResult.tempFilePaths[0];
          common_vendor.index.showLoading({
            title: "上传头像中..."
          });
          let fileToUpload;
          if (true) {
            const response = await fetch(tempFilePath);
            const blob = await response.blob();
            fileToUpload = new File([blob], "avatar.jpg", { type: "image/jpeg" });
          }
          await uploadObject(fileToUpload, (url) => {
            userInfo.avatar = url;
            common_vendor.index.hideLoading();
            common_vendor.index.showToast({
              title: "头像上传成功",
              icon: "success"
            });
            common_vendor.index.setStorageSync("userInfo", {
              nickname: userInfo.nickname,
              avatar: userInfo.avatar
            });
            const loginData = common_vendor.index.getStorageSync("loginData") || {};
            loginData.himg = userInfo.avatar;
            common_vendor.index.setStorageSync("loginData", loginData);
          });
        }
      } catch (error) {
        common_vendor.index.hideLoading();
        common_vendor.index.__f__("error", "at pages/user/edit-profile.vue:241", "头像上传失败:", error);
        common_vendor.index.showToast({
          title: "头像上传失败",
          icon: "none"
        });
      }
    };
    const validateForm = () => {
      if (!userInfo.nickname.trim()) {
        common_vendor.index.showToast({
          title: "请输入昵称",
          icon: "none"
        });
        return false;
      }
      return true;
    };
    const saveProfile = async () => {
      if (!validateForm()) {
        return;
      }
      if (isSaving.value) {
        return;
      }
      try {
        isSaving.value = true;
        common_vendor.index.showLoading({
          title: "保存中..."
        });
        const saveData = {
          account: userInfo.phone,
          // 手机号作为account字段
          uname: userInfo.nickname
          // 昵称字段名改为 uname
        };
        if (userInfo.avatar && userInfo.avatar !== "http://video.caimizm.com/himg/user.png") {
          const fileName = userInfo.avatar.replace("http://video.caimizm.com/himg/", "");
          saveData.himg = fileName;
        }
        const response = await api_apis.apiUpdateUserProfile(saveData);
        common_vendor.index.hideLoading();
        if (response.code !== 200) {
          throw new Error(response.msg || "保存失败");
        }
        common_vendor.index.showToast({
          title: "保存成功",
          icon: "success"
        });
        common_vendor.index.setStorageSync("userInfo", {
          nickname: userInfo.nickname,
          avatar: userInfo.avatar
        });
        const loginData = common_vendor.index.getStorageSync("loginData") || {};
        loginData.uname = userInfo.nickname;
        loginData.himg = userInfo.avatar;
        common_vendor.index.setStorageSync("loginData", loginData);
        common_vendor.index.$emit("userProfileUpdated", {
          nickname: userInfo.nickname,
          avatar: userInfo.avatar
        });
        setTimeout(() => {
          common_vendor.index.navigateBack();
        }, 1500);
      } catch (error) {
        common_vendor.index.hideLoading();
        common_vendor.index.__f__("error", "at pages/user/edit-profile.vue:334", "保存失败:", error);
        common_vendor.index.showToast({
          title: "保存失败，请重试",
          icon: "none"
        });
      } finally {
        isSaving.value = false;
      }
    };
    const loadUserInfo = async () => {
      const token = utils_request.getToken();
      const account = utils_request.getAccount();
      if (!token) {
        common_vendor.index.showToast({
          title: "请先登录",
          icon: "none"
        });
        setTimeout(() => {
          common_vendor.index.navigateBack();
        }, 1500);
        return;
      }
      try {
        const savedUserInfo = common_vendor.index.getStorageSync("userInfo") || {};
        const loginData = common_vendor.index.getStorageSync("loginData") || {};
        if (loginData.uname || loginData.account) {
          userInfo.nickname = loginData.uname || "用户";
          userInfo.phone = loginData.account || account || "";
          userInfo.avatar = loginData.himg || "http://video.caimizm.com/himg/user.png";
        } else {
          userInfo.nickname = savedUserInfo.nickname || "用户";
          userInfo.phone = account || "13637666646";
          userInfo.avatar = savedUserInfo.avatar || "http://video.caimizm.com/himg/user.png";
        }
        common_vendor.index.__f__("log", "at pages/user/edit-profile.vue:376", "加载的用户信息:", {
          nickname: userInfo.nickname,
          phone: userInfo.phone,
          avatar: userInfo.avatar,
          loginData
        });
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/user/edit-profile.vue:384", "加载用户信息失败:", error);
        userInfo.nickname = account || "用户";
        userInfo.phone = account || "13637666646";
        userInfo.avatar = "http://video.caimizm.com/himg/user.png";
      }
    };
    common_vendor.onMounted(() => {
      loadUserInfo();
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.o(goBack),
        b: common_vendor.o(saveProfile),
        c: userInfo.avatar,
        d: common_vendor.o(handleImageError),
        e: common_vendor.p({
          type: "camera",
          size: "24",
          color: "#fff"
        }),
        f: common_vendor.o(handleAvatarClick),
        g: userInfo.nickname,
        h: common_vendor.o(($event) => userInfo.nickname = $event.detail.value),
        i: userInfo.phone,
        j: common_vendor.o(($event) => userInfo.phone = $event.detail.value),
        k: isSaving.value
      }, isSaving.value ? {
        l: common_vendor.p({
          type: "spinner-cycle",
          size: "16",
          color: "#fff"
        })
      } : {
        m: common_vendor.t(isSaving.value ? "保存中..." : "保存修改")
      }, {
        n: common_vendor.o(saveProfile),
        o: isSaving.value
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-af41d2d2"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/user/edit-profile.js.map
