"use strict";
const common_vendor = require("../common/vendor.js");
const BASE_URL = "http://caimi.s7.tunnelfrp.com";
let globalToken = "";
function setToken(token) {
  globalToken = token;
  common_vendor.index.setStorageSync("token", token);
}
function getToken() {
  const localToken = common_vendor.index.getStorageSync("token");
  return globalToken || localToken;
}
function removeToken() {
  globalToken = "";
  common_vendor.index.removeStorageSync("token");
}
let globalAccount = "";
function setAccount(account) {
  globalAccount = account;
  common_vendor.index.setStorageSync("account", account);
}
function getAccount() {
  const localAccount = common_vendor.index.getStorageSync("account");
  return globalAccount || localAccount;
}
function request(config = {}) {
  let {
    url,
    data = {},
    method = "GET",
    header = {}
  } = config;
  url = BASE_URL + url;
  const token = getToken();
  if (token) {
    header.Authorization = `${token}`;
  }
  return new Promise((resolve, reject) => {
    common_vendor.index.request({
      url,
      data,
      method,
      header,
      success: (res) => {
        if (res.statusCode === 200) {
          if (res.data && res.data.code === 200) {
            resolve(res.data);
          } else {
            reject(res.data);
          }
        } else {
          reject({
            code: res.statusCode,
            msg: `HTTP错误: ${res.statusCode}`,
            data: res.data
          });
        }
      },
      fail: (err) => {
        reject(err);
      }
    });
  });
}
exports.getAccount = getAccount;
exports.getToken = getToken;
exports.removeToken = removeToken;
exports.request = request;
exports.setAccount = setAccount;
exports.setToken = setToken;
//# sourceMappingURL=../../.sourcemap/mp-weixin/utils/request.js.map
