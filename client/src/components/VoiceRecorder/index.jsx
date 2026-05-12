import { useState, useRef } from "react";
import "./VoiceRecorder.css";

const VoiceRecorder = ({ onSubmit, disabled }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [recordingTime, setRecordingTime] = useState(0);

  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, {
          type: "audio/webm",
        });
        setAudioBlob(blob);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setAudioBlob(null);

      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (error) {
      alert("Microphone access denied. Please allow microphone access.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearInterval(timerRef.current);
      setRecordingTime(0);
    }
  };

  const handleSubmit = () => {
    if (audioBlob && onSubmit) {
      onSubmit(audioBlob);
      setAudioBlob(null);
    }
  };

  const handleDiscard = () => {
    setAudioBlob(null);
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  return (
    <div className="voice-recorder">
      {isRecording && (
        <div className="recording-state">
          <div className="recording-indicator">
            <span className="recording-dot"></span>
            Recording... {formatTime(recordingTime)}
          </div>
          <button className="stop-btn" onClick={stopRecording}>
            ⏹ Stop Recording
          </button>
        </div>
      )}

      {!isRecording && audioBlob && (
        <div className="preview-state">
          <audio
            src={URL.createObjectURL(audioBlob)}
            controls
            className="audio-preview"
          />
          <div className="preview-buttons">
            <button className="discard-btn" onClick={handleDiscard}>
              🗑 Discard
            </button>
            <button
              className="submit-audio-btn"
              onClick={handleSubmit}
              disabled={disabled}
            >
              Submit Answer
            </button>
          </div>
        </div>
      )}

      {!isRecording && !audioBlob && (
        <button
          className="record-btn"
          onClick={startRecording}
          disabled={disabled}
        >
          🎤 Record Answer
        </button>
      )}
    </div>
  );
};

export default VoiceRecorder;
