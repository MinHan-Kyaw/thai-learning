// Speaks Thai with the browser's speech synthesis, for syllables that have no recorded audio.
// ponytail: depends on the device having a Thai voice; record audio files if pronunciation must be exact.
const LANGUAGE = 'th-TH';
const RATE = 0.8;

// Chrome can garbage-collect an utterance mid-speech unless something still references it.
const activeUtterances = new Set<SpeechSynthesisUtterance>();

const getSynthesis = (): SpeechSynthesis | undefined => (typeof window !== 'undefined' ? window.speechSynthesis : undefined);

export const stopSpeaking = (): void => {
  const synthesis = getSynthesis();

  // Chrome can drop the next speak() after a cancel() with nothing queued, so only cancel real speech.
  if (synthesis && (synthesis.speaking || synthesis.pending)) {
    synthesis.cancel();
  }
  activeUtterances.clear();
};

export const speakThai = (text: string): void => {
  const synthesis = getSynthesis();

  if (!synthesis) {
    return;
  }
  try {
    stopSpeaking();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = LANGUAGE;
    utterance.rate = RATE;
    const voice = synthesis.getVoices().find((item) => item.lang.replace('_', '-').startsWith('th'));
    if (voice) {
      utterance.voice = voice;
    }
    const release = () => activeUtterances.delete(utterance);
    utterance.onend = release;
    utterance.onerror = release;
    activeUtterances.add(utterance);
    // Chrome can leave the engine paused (e.g. after the tab was in the background).
    synthesis.resume();
    synthesis.speak(utterance);
  } catch {
    // Speech synthesis is optional; learning continues silently.
  }
};
