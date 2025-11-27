import { defineStore } from 'pinia';

export const useVideoStore = defineStore('video', () => {
  const player = ref(null);

  const getPlayer = () => {
    return player.value;
  };

  const setPlayer = (instance) => {
    player.value = instance;
  };

  const dispose = () => {
    player.value?.dispose();
    player.value = null;
  };

  const trackIdx = ref(0);
  const setTrackIdx = (idx) => {
    trackIdx.value = idx;
  };

  return {
    getPlayer,
    dispose,
    setPlayer,
    trackIdx,
    setTrackIdx,
  };
});
