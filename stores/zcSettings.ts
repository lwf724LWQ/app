import { defineStore } from "pinia";
import { ref, reactive } from "vue";

interface NoticeConfig {
  sound: boolean;
  vibrate: boolean;
  popup: boolean;
}

interface SoundConfig {
  home: number;
  away: number;
}

const STORAGE_KEY = "zc_notify_settings";

const DEFAULT_SETTINGS = {
  onlyFollowed: false,
  goalNotice: { sound: true, vibrate: true, popup: true },
  cornerNotice: { sound: false, vibrate: true, popup: true },
  yellowCardNotice: { sound: false, vibrate: true, popup: true },
  redCardNotice: { sound: true, vibrate: true, popup: true },
  goalSound: { home: 0, away: 0 },
  cornerSound: { home: 0, away: 0 },
  redCardSound: { home: 0, away: 0 },
  yellowCardSound: { home: 0, away: 0 },
};

function loadFromStorage() {
  try {
    const saved = uni.getStorageSync(STORAGE_KEY);
    if (saved) {
      return { ...DEFAULT_SETTINGS, ...saved };
    }
  } catch (e) {
    console.error("加载设置失败:", e);
  }
  return { ...DEFAULT_SETTINGS };
}

function saveToStorage(state: Record<string, unknown>) {
  try {
    uni.setStorageSync(STORAGE_KEY, state);
  } catch (e) {
    console.error("保存设置失败:", e);
  }
}

export const useZcSettingsStore = defineStore("zcSettings", () => {
  const initial = loadFromStorage();

  const onlyFollowed = ref<boolean>(initial.onlyFollowed);
  const goalNotice = reactive<NoticeConfig>({ ...initial.goalNotice });
  const cornerNotice = reactive<NoticeConfig>({ ...initial.cornerNotice });
  const yellowCardNotice = reactive<NoticeConfig>({ ...initial.yellowCardNotice });
  const redCardNotice = reactive<NoticeConfig>({ ...initial.redCardNotice });
  const goalSound = reactive<SoundConfig>({ ...initial.goalSound });
  const cornerSound = reactive<SoundConfig>({ ...initial.cornerSound });
  const redCardSound = reactive<SoundConfig>({ ...initial.redCardSound });
  const yellowCardSound = reactive<SoundConfig>({ ...initial.yellowCardSound });

  function persist() {
    saveToStorage({
      onlyFollowed: onlyFollowed.value,
      goalNotice: { ...goalNotice },
      cornerNotice: { ...cornerNotice },
      yellowCardNotice: { ...yellowCardNotice },
      redCardNotice: { ...redCardNotice },
      goalSound: { ...goalSound },
      cornerSound: { ...cornerSound },
      redCardSound: { ...redCardSound },
      yellowCardSound: { ...yellowCardSound },
    });
  }

  function setOnlyFollowed(value: boolean) {
    onlyFollowed.value = value;
    persist();
  }

  function toggleGoalNotice(key: keyof NoticeConfig) {
    goalNotice[key] = !goalNotice[key];
    persist();
  }

  function toggleCornerNotice(key: keyof NoticeConfig) {
    cornerNotice[key] = !cornerNotice[key];
    persist();
  }

  function toggleYellowCardNotice(key: keyof NoticeConfig) {
    yellowCardNotice[key] = !yellowCardNotice[key];
    persist();
  }

  function toggleRedCardNotice(key: keyof NoticeConfig) {
    redCardNotice[key] = !redCardNotice[key];
    persist();
  }

  function setGoalSoundHome(value: number) {
    goalSound.home = value;
    persist();
  }

  function setGoalSoundAway(value: number) {
    goalSound.away = value;
    persist();
  }

  function setCornerSoundHome(value: number) {
    cornerSound.home = value;
    persist();
  }

  function setCornerSoundAway(value: number) {
    cornerSound.away = value;
    persist();
  }

  function setRedCardSoundHome(value: number) {
    redCardSound.home = value;
    persist();
  }

  function setRedCardSoundAway(value: number) {
    redCardSound.away = value;
    persist();
  }

  function setYellowCardSoundHome(value: number) {
    yellowCardSound.home = value;
    persist();
  }

  function setYellowCardSoundAway(value: number) {
    yellowCardSound.away = value;
    persist();
  }

  return {
    onlyFollowed,
    goalNotice,
    cornerNotice,
    yellowCardNotice,
    redCardNotice,
    goalSound,
    cornerSound,
    redCardSound,
    yellowCardSound,
    setOnlyFollowed,
    toggleGoalNotice,
    toggleCornerNotice,
    toggleYellowCardNotice,
    toggleRedCardNotice,
    setGoalSoundHome,
    setGoalSoundAway,
    setCornerSoundHome,
    setCornerSoundAway,
    setRedCardSoundHome,
    setRedCardSoundAway,
    setYellowCardSoundHome,
    setYellowCardSoundAway,
  };
});