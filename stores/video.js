// stores/video.js
import { defineStore } from 'pinia'

export const useVideoStore = defineStore('video', {
  state: () => ({
    currentVideo: null
  }),
  
  actions: {
    setCurrentVideo(video) {
      this.currentVideo = video
	  console.log(video,"这是仓库中的")
    },
    
    clearCurrentVideo() {
      this.currentVideo = null
    }
  },
  
  getters: {
    getCurrentVideo: (state) => state.currentVideo
  }
})