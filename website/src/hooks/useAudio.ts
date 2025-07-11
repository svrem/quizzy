import { useEffect, useState } from 'react';

const context = new AudioContext();

export function useAudio(url: string) {
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);

  useEffect(() => {
    const fetchAudio = async () => {
      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Failed to fetch audio: ${response.statusText}`);
        }
        const arrayBuffer = await response.arrayBuffer();
        const buffer = await context.decodeAudioData(arrayBuffer);
        setAudioBuffer(buffer);
      } catch (error) {
        console.error('Error fetching audio:', error);
      }
    };
    fetchAudio();

    return () => {
      // Cleanup if necessary
      setAudioBuffer(null);
    };
  }, [url]);

  const play = () => {
    if (audioBuffer) {
      const source = context.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(context.destination);
      source.start(0);
    } else {
      console.warn('Audio buffer is not loaded yet.');
    }
  };

  return { play, audioBuffer };
}
