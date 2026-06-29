# xtf-jpush

`xtf-jpush` 是一个基于 UTS 的极光推送插件，当前代码中已包含 `Android`、`iOS`、`Harmony` 三端实现。

当前对外导出为函数式 API，不再使用 `JPushHelper.xxx()` 的调用方式。

## 支持平台

- `uni-app x` App Android
- `uni-app x` App iOS
- `uni-app x` App Harmony

## 引入方式

### uni-app x

```uts
import {
	addTags,
	checkTagBindState,
	cleanTags,
	deleteAlias,
	deleteTags,
	getAlias,
	getAllTags,
	getRegistrationID,
	goToAppNotificationSettings,
	initializeJpush,
	isNotificationEnabled,
	onListenerJpushMessage,
	setAlias,
	setChannel,
	setLatestNotificationNumber,
	setMobileNumber,
	setPowerSaveMode,
	setPushState,
	setTags,
	type MessageListener
} from "@/uni_modules/xtf-jpush"
```

### uni-app

```javascript
import {
	addTags,
	checkTagBindState,
	cleanTags,
	deleteAlias,
	deleteTags,
	getAlias,
	getAllTags,
	getRegistrationID,
	goToAppNotificationSettings,
	initializeJpush,
	isNotificationEnabled,
	onListenerJpushMessage,
	setAlias,
	setChannel,
	setLatestNotificationNumber,
	setMobileNumber,
	setPowerSaveMode,
	setPushState,
	setTags
} from "@/uni_modules/xtf-jpush"
```

如果你只用到部分能力，也可以按需导入。

如果 `uni-app` 和 `uni-app x` 写法一致，下文只保留一份示例；只有写法不同时，才会分别给出两套示例。

## 使用前说明

- Android 修改 `manifestPlaceholders.json` 后，需要重新制作自定义基座或重新云打包。
- iOS 修改 `info.plist` 中的极光配置后，需要重新打包或重新制作基座。
- Harmony 修改 `string.json` 中的极光配置后，需要重新编译运行包。
- 如果需要厂商推送，除了本地配置外，还需要在极光后台开启对应厂商通道。
- Harmony 厂商推送还需要在极光后台开通 `Harmony channel`，并确保应用 `bundleName` 与极光后台配置一致。

## 三端 key 配置

### Android

Android 端通过项目根目录的占位文件注入极光和厂商推送参数。

请在项目根目录创建：

`nativeResources/android/manifestPlaceholders.json`

示例内容：

```json
{
	"JPUSH_APPKEY": "你的极光 AppKey",
	"JPUSH_CHANNEL": "default_developer",
	"MEIZU_APPKEY": "魅族 AppKey",
	"MEIZU_APPID": "魅族 AppID",
	"XIAOMI_APPID": "小米 AppID",
	"XIAOMI_APPKEY": "小米 AppKey",
	"OPPO_APPKEY": "OPPO AppKey",
	"OPPO_APPID": "OPPO AppID",
	"OPPO_APPSECRET": "OPPO AppSecret",
	"VIVO_APPKEY": "VIVO AppKey",
	"VIVO_APPID": "VIVO AppID",
	"HONOR_APPID": "HONOR AppID",
	"NIO_APPID": "NIO AppID"
}
```

说明：

- `JPUSH_APPKEY` 为必填。
- `JPUSH_CHANNEL` 一般可填发布渠道名，例如 `default_developer`。
- 厂商字段按需填写，不使用某厂商时可以留空或不接入对应能力。
- 若不需要厂家推送，可以只保留极光基础能力所需配置。

### iOS

iOS 端在插件文件中读取极光 `AppKey`：

`uni_modules/xtf-jpush/utssdk/app-ios/info.plist`

当前配置项：

```xml
<key>JPushAppKey</key>
<string>你的极光 AppKey</string>
```

说明：

- 你需要把 `JPushAppKey` 改成自己的极光 `AppKey`。
- iOS 真机推送还需要你在苹果开发者平台和极光后台完成 APNs 相关配置，否则可能只能拿到注册流程，无法正常收到系统通知。

### Harmony

Harmony 端在资源文件中读取极光配置：

`uni_modules/xtf-jpush/utssdk/app-harmony/resources/base/element/string.json`

当前配置项：

```json
{
	"string": [
		{
			"name": "jpush_appkey",
			"value": "你的极光 AppKey"
		},
		{
			"name": "jpush_channel",
			"value": "huawei store"
		}
	]
}
```

说明：

- `jpush_appkey` 为极光 `AppKey`。
- `jpush_channel` 为渠道名，可按你的发布渠道调整。
- 如果要走 Harmony 厂商通道，需要在极光后台开启 `Harmony channel`。

## 快速开始

### 1. 注册消息监听

建议在页面加载后尽早注册监听。

#### uni-app x

```uts
const messageListener: MessageListener = {
	onRegister(id: string) {
		console.log("onRegister", id)
	},
	onServerConnect(state: boolean) {
		console.log("onServerConnect", state)
	},
	multiActionClicked(msg: string) {
		console.log("multiActionClicked", msg)
	},
	messageListener(msg: string) {
		console.log("messageListener", msg)
	},
	notityMessageOpened(msg: string) {
		console.log("notityMessageOpened", msg)
	},
	notifyMessageDismiss(msg: string) {
		console.log("notifyMessageDismiss", msg)
	},
	notifyMessageArrived(msg: string) {
		console.log("notifyMessageArrived", msg)
	},
	commandResult(msg: string) {
		console.log("commandResult", msg)
	}
}

onListenerJpushMessage(messageListener)
```

#### uni-app

```javascript
const messageListener = {
	onRegister(id) {
		console.log("onRegister", id)
	},
	onServerConnect(state) {
		console.log("onServerConnect", state)
	},
	multiActionClicked(msg) {
		console.log("multiActionClicked", msg)
	},
	messageListener(msg) {
		console.log("messageListener", msg)
	},
	notityMessageOpened(msg) {
		console.log("notityMessageOpened", msg)
	},
	notifyMessageDismiss(msg) {
		console.log("notifyMessageDismiss", msg)
	},
	notifyMessageArrived(msg) {
		console.log("notifyMessageArrived", msg)
	},
	commandResult(msg) {
		console.log("commandResult", msg)
	}
}

onListenerJpushMessage(messageListener)
```

### 2. 初始化

```uts
initializeJpush()
```

建议先注册监听，再初始化。

### 3. 获取注册 ID

```uts
const registrationId = getRegistrationID()
console.log("registrationId", registrationId)
```

通常建议在 `onRegister` 回调之后再使用。

## API 说明

## 平台差异表

| 方法 | Android | iOS | Harmony |
| --- | --- | --- | --- |
| `initializeJpush()` | 已实现 | 已实现 | 已实现 |
| `onListenerJpushMessage()` | 已实现 | 已实现 | 已实现 |
| `getRegistrationID()` | 已实现 | 已实现 | 已实现 |
| `isNotificationEnabled()` | 已实现 | 已实现 | 已实现 |
| `goToAppNotificationSettings()` | 已实现 | 已实现 | 已实现 |
| `setPushState()` | 已实现 | 已实现 | 已实现 |
| `setAlias()` | 已实现 | 已实现 | 已实现 |
| `deleteAlias()` | 已实现 | 已实现 | 已实现 |
| `getAlias()` | 已实现 | 已实现 | 已实现 |
| `setTags()` | 已实现 | 已实现 | 已实现 |
| `addTags()` | 已实现 | 已实现 | 已实现 |
| `deleteTags()` | 已实现 | 已实现 | 已实现 |
| `cleanTags()` | 已实现 | 已实现 | 已实现 |
| `getAllTags()` | 已实现 | 已实现 | 已实现 |
| `checkTagBindState()` | 已实现 | 已实现 | 已实现 |
| `setMobileNumber()` | 已实现 | 已实现 | 已实现 |
| `setChannel()` | 已实现 | 已实现 | 已实现 |
| `setLatestNotificationNumber()` | 已实现 | 空实现 | 空实现 |
| `setPowerSaveMode()` | 已实现 | 空实现 | 空实现 |

说明：

- “已实现”表示当前插件代码中已有对应平台实现。
- “空实现”表示方法已导出，但当前平台代码中尚未接入实际原生能力。

### `initializeJpush()`

初始化极光推送。

```uts
initializeJpush()
```

### `onListenerJpushMessage(listener)`

注册推送消息监听器。

参数说明：

- `onRegister`：注册成功后返回 registrationId
- `onServerConnect`：与极光服务器连接状态变化
- `multiActionClicked`：通知多动作点击回调
- `messageListener`：自定义消息回调
- `notityMessageOpened`：点击通知回调
- `notifyMessageDismiss`：通知被清除回调
- `notifyMessageArrived`：收到通知回调
- `commandResult`：别名、标签、手机号等交互结果回调

```uts
onListenerJpushMessage(messageListener)
```

### `getRegistrationID(): string`

获取当前设备的极光注册 ID。

```uts
const id = getRegistrationID()
```

### `isNotificationEnabled(): boolean`

检查系统通知权限是否已开启。

```uts
const enabled = isNotificationEnabled()
console.log(enabled)
```

### `goToAppNotificationSettings()`

跳转到系统通知设置页。

```uts
goToAppNotificationSettings()
```

### `setPushState(checked: boolean)`

开启或关闭极光推送。

- `true`：开启推送
- `false`：关闭推送

```uts
setPushState(true)
```

### `setAlias(sequence: number, alias: string, callback)`

设置别名。该接口是覆盖逻辑，不是增量追加逻辑。

#### uni-app x

```uts
setAlias(1, "demo_alias", (msg: string) => {
	console.log(msg)
})
```

#### uni-app

```javascript
setAlias(1, "demo_alias", (msg) => {
	console.log(msg)
})
```

### `deleteAlias(sequence: number, callback)`

删除别名。

#### uni-app x

```uts
deleteAlias(2, (msg: string) => {
	console.log(msg)
})
```

#### uni-app

```javascript
deleteAlias(2, (msg) => {
	console.log(msg)
})
```

### `getAlias(sequence: number, callback)`

查询当前别名。

#### uni-app x

```uts
getAlias(3, (msg: string) => {
	console.log(msg)
})
```

#### uni-app

```javascript
getAlias(3, (msg) => {
	console.log(msg)
})
```

### `setTags(sequence: number, tags: string[], callback)`

设置标签。该接口是覆盖逻辑，不是增量追加逻辑。

#### uni-app x

```uts
setTags(4, ["news", "vip"] as string[], (msg: string) => {
	console.log(msg)
})
```

#### uni-app

```javascript
setTags(4, ["news", "vip"], (msg) => {
	console.log(msg)
})
```

### `addTags(sequence: number, tags: string[], callback)`

追加标签。

#### uni-app x

```uts
addTags(5, ["promo"] as string[], (msg: string) => {
	console.log(msg)
})
```

#### uni-app

```javascript
addTags(5, ["promo"], (msg) => {
	console.log(msg)
})
```

### `deleteTags(sequence: number, tags: string[], callback)`

删除指定标签。

#### uni-app x

```uts
deleteTags(6, ["promo"] as string[], (msg: string) => {
	console.log(msg)
})
```

#### uni-app

```javascript
deleteTags(6, ["promo"], (msg) => {
	console.log(msg)
})
```

### `cleanTags(sequence: number, callback)`

清空全部标签。

#### uni-app x

```uts
cleanTags(7, (msg: string) => {
	console.log(msg)
})
```

#### uni-app

```javascript
cleanTags(7, (msg) => {
	console.log(msg)
})
```

### `getAllTags(sequence: number, callback)`

查询全部标签。

#### uni-app x

```uts
getAllTags(8, (msg: string) => {
	console.log(msg)
})
```

#### uni-app

```javascript
getAllTags(8, (msg) => {
	console.log(msg)
})
```

### `checkTagBindState(sequence: number, tag: string, callback)`

查询指定标签的绑定状态。

#### uni-app x

```uts
checkTagBindState(9, "vip", (msg: string) => {
	console.log(msg)
})
```

#### uni-app

```javascript
checkTagBindState(9, "vip", (msg) => {
	console.log(msg)
})
```

### `setMobileNumber(sequence: number, phone: string, callback)`

设置手机号。

#### uni-app x

```uts
setMobileNumber(10, "13800138000", (msg: string) => {
	console.log(msg)
})
```

#### uni-app

```javascript
setMobileNumber(10, "13800138000", (msg) => {
	console.log(msg)
})
```

### `setChannel(c: string)`

设置渠道名。

```uts
setChannel("default_developer")
```

### `setLatestNotificationNumber(num: number)`

设置最近保留的通知数量。

```uts
setLatestNotificationNumber(5)
```

平台说明：

- Android：已实现
- iOS：当前为空实现
- Harmony：当前为空实现

### `setPowerSaveMode(e: boolean)`

设置省电模式。

```uts
setPowerSaveMode(true)
```

平台说明：

- Android：已实现
- iOS：当前为空实现
- Harmony：当前为空实现

## 回调结果说明

别名、标签、手机号等接口的 `callback` 参数，当前各平台统一返回 `string`，通常是极光 SDK 回传对象的 JSON 字符串。建议你在业务代码里按需 `JSON.parse` 后再处理。

## 常见问题

### Android 修改配置后不生效

通常是因为你修改的是 `manifestPlaceholders.json`，但没有重新制作自定义基座或重新打包。

### iOS 能初始化但收不到系统通知

通常需要继续检查：

- `JPushAppKey` 是否正确
- 苹果证书 / Profile / Push 能力是否配置完整
- 极光后台 APNs 配置是否正确

### Harmony 能注册但厂商消息不下来

通常需要继续检查：

- 极光后台是否已开通 `Harmony channel`
- 应用 `bundleName` 是否与极光后台一致
- 渠道配置和签名配置是否与后台一致

## 额外说明

- 如果你不需要 Android 厂商推送，可以只保留极光基础 SDK 依赖。
- 如果你需要应用内消息能力，Android 端请按原插件说明处理 `res.zip` 中的资源。
