import { useEffect, useRef } from "react";

const AudioPlayer = ({ audioBase64, onEnded }) => {
  const audioRef = useRef(null);

  useEffect(() => {
    if (!audioBase64) return;

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
    }

    const byteCharacters = atob(audioBase64);
    const byteNumbers = Array.from(byteCharacters).map((c) => c.charCodeAt(0));
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: "audio/mpeg" });

    const url = URL.createObjectURL(blob);

    const audio = new Audio(url);
    audioRef.current = audio;

    audio.onended = () => {
      URL.revokeObjectURL(url);
      if (onEnded) onEnded();
    };

    audio.play().catch((err) => {
      console.error("Audio play failed:", err);
      if (onEnded) onEnded();
    });

    return () => {
      audio.pause();
      URL.revokeObjectURL(url);
    };
  }, [audioBase64]);

  return null;
};

export default AudioPlayer;
