const permissionMap = {
  storage: {
    permission: [
      'android.permission.WRITE_EXTERNAL_STORAGE',
      'android.permission.READ_EXTERNAL_STORAGE'
    ],
    title: '存储'
  },
  calendar: {
    permission: ['android.permission.READ_CALENDAR', 'android.permission.WRITE_CALENDAR'],
    title: '日历'
  },
  contact: {
    permission: ['android.permission.READ_CONTACTS', 'android.permission.WRITE_CONTACTS'],
    title: '联系人'
  },
  sms: {
    permission: [
      'android.permission.READ_SMS',
      'android.permission.SEND_SMS',
      'android.permission.RECEIVE_SMS'
    ],
    title: '短信'
  },
  camera: {
    permission: ['android.permission.CAMERA'],
    title: '相机'
  },
  location: {
    permission: ['android.permission.ACCESS_FINE_LOCATION'],
    title: '位置'
  },
  record: {
    permission: ['android.permission.RECORD_AUDIO'],
    title: '麦克风'
  },
  state: {
    permission: ['android.permission.READ_PHONE_STATE'],
    title: '手机识别码'
  },
  phone: {
    permission: ['android.permission.CALL_PHONE'],
    title: '电话'
  },
  log: {
    permission: ['android.permission.READ_CALL_LOG'],
    title: '通话记录'
  }
}

export const myDirective = {
  install(Vue) {
    /**
     * 获取权限
     * 
     * 支持数组传入，第一个为成功申请后的业务函数，第二个为权限申请说明
     * 或者直接传入函数，则默认权限申请说明为`需要${permissionMeta.title}权限`
     * 
     * v-permission:需要的权限="[成功申请后的业务函数,'权限申请说明']"
     * v-permission:需要的权限="成功申请后的业务函数"
    */
    Vue.directive('permission', {
      mounted(el, binding) {
        el.addEventListener('click', () => {
          const systemInfo = uni.getSystemInfoSync();
          const isIOS = systemInfo.platform === 'ios' || systemInfo.osName === 'ios';
          if (isIOS) {
            return binding.value()
          }
          // #ifdef APP
          let fn, permissionText;
          if (binding.value instanceof Array) {
            fn = binding.value[0]
            permissionText = binding.value[1]
          } else {
            fn = binding.value
          }
          const permissionMeta = permissionMap[binding.arg]
          let compat = plus.android.importClass('androidx.core.content.ContextCompat')
          let context = plus.android.runtimeMainActivity()
          let result

          const permissions = permissionMeta.permission.map((permission) => {
            return compat.checkSelfPermission(context, permission)
          })
          permissions.every((permission) => permission === 0) ? (result = 0) : (result = -1)

          if (result !== 0) {
            uni.showModal({
              title: '权限申请',
              content: permissionText || `需要${permissionMeta.title}权限`,
              showCancel: true,
              confirmText: '去设置',
              success: ({ confirm, cancel }) => {
                if (confirm) {
                  plus.android.requestPermissions([permissionMeta.permission], (e) => {
                    if (e.deniedAlways.length > 0) {
                      fn()
                    }
                  })
                }
              }
            })
          } else {
            fn()
          }
          // #endif

          // #ifdef H5
          fn()
          // #endif
        })
      }
    })
  }
}
