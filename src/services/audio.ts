let currentAudio: HTMLAudioElement | null = null;

export const stopAudio = (): void => {
  if (!currentAudio) {
    return;
  }

  currentAudio.pause();
  currentAudio = null;
};

export const playAudio = async (src: string): Promise<void> => {
  stopAudio();

  const audio = new Audio(src);
  currentAudio = audio;

  try {
    await audio.play();
  } catch {
    // Browsers can reject playback (autoplay policy, unsupported or missing file); learning continues without sound.
  }
};
