 import whistleMp3 from "@/static/zc/whistle.mp3";
import mixkitSoftwareInterfaceRemove2576 from "@/static/zc/mixkit-software-interface-remove-2576.wav";
import wow from "@/static/zc/wow.wav";
import yes from "@/static/zc/yes-victory-2012.wav";
import magic from "@/static/zc/mixkit-magic-festive-melody-2986.wav";
import win from "@/static/zc/u_it78ck90s3-orchestral-win-331233.mp3";

interface SoundItem {
  name: string;
  url: string;
}

const SOUND_CONFIG: SoundItem[] = [
  { name: "默认", url: whistleMp3 },
  { name: "叮咚声", url: mixkitSoftwareInterfaceRemove2576 },
  { name: "欢呼声", url: wow },
  { name: "人声", url: yes },
  { name: "游戏胜利", url: magic },
  { name: "游戏胜利2", url: win },
];

const innerList: UniApp.InnerAudioContext[] = [];

function init() {
  if (innerList.length > 0) return;
  SOUND_CONFIG.forEach((item) => {
    const ctx = uni.createInnerAudioContext();
    ctx.autoplay = false;
    ctx.src = item.url;
    innerList.push(ctx);
  });
}

export function useZcSoundPlayer() {
  function getSoundConfig() {
    return SOUND_CONFIG;
  }

  function playSound(index: number) {
    init();
    const ctx = innerList[index];
    if (ctx) {
      ctx.play();
    }
  }

  function destroy() {
    innerList.forEach((ctx) => {
      ctx.destroy();
    });
    innerList.length = 0;
  }

  return {
    getSoundConfig,
    playSound,
    destroy,
  };
}
