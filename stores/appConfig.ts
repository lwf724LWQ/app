import { defineStore } from "pinia";
import { computed, ref } from "vue";
import type { InjectionKey, Ref } from "vue";

export interface Appconfig {
  notice: Notice[];
  wxInfo: WxInfo;
  shareConfig: ShareConfig[];
  banner: Banner[];
  fullBaseApkInfo: FullBaseApkInfo;
}

export interface WxInfo {
  image: OSSFile;
  wxNumber: string;
}

export interface FullBaseApkInfo {
  apkUrl: OSSFile;
  version: string;
}

export interface Notice {
  title?: string;
  link?: string;
  type: emitLineType;
  needLoginWord?: string;
}

export interface Banner extends Notice {
  image: OSSFile;
}

export type emitLineType = "link" | "inline" | "none";

export interface OSSFile {
  name?: string;
  url?: string;
  folder?: string;
}

export interface ShareConfig {
  type: number;
  title: string;
  scene: string;
  summary: string;
  href: string;
  imageUrl: OSSFile;
  mediaUrl: OSSFile;
  miniProgram: MiniProgram;
  viewtitle: string;
  viewsubtitle: string;
  btntext: string;
}

export interface MiniProgram {
  appId: string;
  path: string;
}

const config: Ref<Appconfig> = ref({
  banner: [],
  notice: [],
  shareConfig: [],
  wxInfo: {
    image: {},
    wxNumber: "",
  },
  fullBaseApkInfo: {
    apkUrl: {},
    version: "",
  },
});

function getConfig() {
  let url = "http://caimizm.com/static/app-config.json";
  if (process.env.NODE_ENV === "development") {
    url = "http://192.168.31.235:5173/static/app-config.json";
  }
  uni.request({
    url,
    method: "GET",
    data: {},
    header: {
      "content-type": "application/json",
    },
    success: (res) => {
      config.value = res.data as Appconfig;
    },
    fail: (err) => {
      console.log(err);
    },
  });
}
getConfig()
export const useAppConfigStore = defineStore("appConfig", () => {
  
  return {
    banner: computed(() => config.value.banner || []),
    notice: computed(() => config.value.notice || []),
    wxInfo: computed(() => config.value.wxInfo || {}),
    shareConfig: computed(() => config.value.shareConfig || []),
    fullBaseApkInfo: computed(() => config.value.fullBaseApkInfo || {}),
    getConfig,
  };
});
