# 安卓 APK 签名证书

> 本文档记录 APK 打包签名所需的证书信息与包名配置。
> **注意：keystore 文件和口令属于敏感信息，请勿外传或提交到公开仓库。**

---

## 一、基本信息

| 项目 | 值 |
| --- | --- |
| 应用名称 | 彩迷 |
| uni-app appid | `__UNI__CB678CE` |
| 版本名 | 2.0.3 |
| 版本号 | 20260519 |
| **安卓包名** | **`com.caimizm.app.yunxu`** |

---

## 二、证书文件

| 项目 | 值 |
| --- | --- |
| 文件名 | `caimi-release.keystore` |
| 存放路径 | `docs/caimi-release.keystore` |
| 证书库类型 | JKS |
| **证书别名（Alias）** | **`caimi`** |
| **证书库口令（Store Password）** | **`123456`** |
| **密钥口令（Key Password）** | **`123456`** |

> 证书库口令与密钥口令相同，均为 `123456`。

### 证书详情

| 项目 | 值 |
| --- | --- |
| 密钥算法 | RSA 2048 bit |
| 签名算法 | SHA256withRSA |
| 创建日期 | 2026-10-21 |
| 有效期 | 100 年（至 2126-09-27） |
| 证书条目类型 | PrivateKeyEntry |
| 主题（DNAME） | `CN=caimi, OU=caimi, O=caimi, L=Beijing, ST=Beijing, C=CN` |

### 证书指纹

```
SHA1:
18:8D:03:82:42:73:42:30:44:67:5A:45:B6:68:52:8D:D4:13:D7:58

SHA256:
F4:63:27:92:97:19:93:6E:AA:E6:93:57:01:B0:86:C7:B0:BA:D7:EB:C1:82:1F:4E:E5:0E:5B:82:94:DC:91:A7
```

> 指纹用于接入第三方 SDK（微信登录/支付、推送、地图等）时填写。注意不同 SDK 要求的可能不是这个"证书指纹"，而是「签名 MD5」（需去掉冒号转小写）或「微信开放平台的签名」，请以各平台文档为准。

---

## 三、HBuilderX 云打包填法

打开 HBuilderX → 发行 → 原生 App 云打包 → 勾选 Android → 选择「使用自有证书」，按下表填写：

| 界面字段 | 填写内容 |
| --- | --- |
| 证书别名 | `caimi` |
| 私钥密码 | `123456` |
| 证书文件 | 选择 `docs/caimi-release.keystore` |

同时确认 **应用包名** 一栏填 `com.caimizm.app.yunxu`。

---

## 四、包名需要在 manifest.json 中配置

当前 `manifest.json` 的 `app-plus.distribute.android` 节点下**没有配置 `packagename`**，若不填，云打包会使用默认包名 `io.dcloud.__UNI__CB678CE`。

建议在 `manifest.json` 中补充（位置：`app-plus` → `distribute` → `android` 内）：

```json
"app-plus": {
  "distribute": {
    "android": {
      "packagename": "com.caimizm.app.yunxu",
      "permissions": [ ... ]
    }
  }
}
```

也可以在 HBuilderX 图形界面「manifest.json 可视化视图 → App 常用其它设置 → Android 包名」里填写。

### ⚠️ 与插件的包名不一致问题

`manifest.json` 中 `ZYJ-Android-Share` 插件的 `android_package_name` 目前是 `com.caimizmapp.demo`（与 iOS bundle id 相同）。若把安卓包名改为 `com.caimizm.app.yunxu`：

- 一般插件（原生分享）不依赖包名，通常不受影响；
- 但如果该插件在云端是按包名做鉴权的，需要在插件配置里同步改成新包名，否则可能授权失败。

上线前建议实测一次分享功能。

---

## 五、命令行打包参考

如果走本地命令行签名，可使用如下参数（供参考，实际以 HBuilderX 产出的未签名 APK 为准）：

```bash
# 签名
jarsigner -verbose -sigalg SHA256withRSA -digestalg SHA-256 \
  -keystore docs/caimi-release.keystore \
  -storepass 123456 -keypass 123456 \
  app-release-unsigned.apk caimi

# 校验
jarsigner -verify -verbose -certs app-release-unsigned.apk
```

---

## 六、注意事项（重要）

1. **证书丢失 = 无法更新已上架的应用。** Play 商店、国内各应用市场都要求后续版本使用同一证书签名，证书一旦丢失，只能用新包名重新上架。请务必多处备份 `caimi-release.keystore`。

2. **口令弱。** 当前沿用 `123456`。JKS 的口令只用于防误操作、不提供强加密，但如果证书文件外泄，弱口令意味着密钥可被直接取出。**不要把 keystore 传到公开仓库或网盘公开链接。**

3. **`.gitignore` 未忽略 keystore。** 当前仓库并没有屏蔽 `*.keystore`。如果这个仓库是公开的，请把它加入 `.gitignore`。如需提交到私有仓库做备份，注意仓库的访问权限。

4. 这是**新生成的发布证书**，与仓库里旧的 `test.keystore`（别名 `caimizm` / `testalias`）不是同一套。如果之前已经用旧证书在应用市场上架过「彩迷」，**必须继续使用旧证书**，否则会被判定为不同应用、无法覆盖升级。

---

## 七、快速自查清单

- [ ] `docs/caimi-release.keystore` 已备份到至少两个安全位置
- [ ] `manifest.json` 的 `packagename` 已填 `com.caimizm.app.yunxu`
- [ ] 云打包证书别名、密码填写正确
- [ ] 已在真机安装验证（安装后「设置 → 应用信息」里确认包名）
- [ ] 微信登录/支付、分享等功能在新包名下实测通过
- [ ] 若仓库公开，keystore 已加入 `.gitignore`
