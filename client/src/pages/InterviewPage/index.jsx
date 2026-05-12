import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../../api/axios.js";
import Navbar from "../../components/Navbar/index.jsx";
import AudioPlayer from "../../components/AudioPlayer/index.jsx";
import VoiceRecorder from "../../components/VoiceRecorder/index.jsx";
import "./InterviewPage.css";

const InterviewPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [interview, setInterview] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [currentQuestionNum, setCurrentQuestionNum] = useState(1);
  const [totalQuestions, setTotalQuestions] = useState(5);

  const [interviewState, setInterviewState] = useState("speaking");

  const [audioBase64, setAudioBase64] = useState("");

  const [interviewerMessage, setInterviewerMessage] = useState("");

  const [textAnswer, setTextAnswer] = useState("");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadInterview = async () => {
      try {
        const response = await API.get(`/interview/${id}`);
        const data = response.data.data;

        setInterview(data);
        setCurrentQuestionNum(data.currentQuestion);
        setTotalQuestions(data.totalQuestions);

        const qIndex = data.currentQuestion - 1;
        const question =
          data.questions[qIndex]?.question || data.questions[0]?.question;
        setCurrentQuestion(question);

        const greeting = data.messages[0]?.content || "";
        const firstQuestion = data.messages[1]?.content || "";
        const fullMessage = `${greeting} ${firstQuestion}`;
        setInterviewerMessage(fullMessage);

        await generateNatalieAudio(fullMessage);
      } catch (error) {
        setError("Failed to load interview.");
      } finally {
        setLoading(false);
      }
    };

    loadInterview();
  }, [id]);

  const generateNatalieAudio = async (text) => {
    try {
      const response = await API.post("/interview/audio", { text });
      setAudioBase64(response.data.data.audioBase64);
      setInterviewState("speaking");
    } catch (error) {
      console.error("Audio generation failed:", error);
      setInterviewState("listening");
    }
  };

  const handleAudioEnded = () => {
    setInterviewState("listening");
  };

  const processAnswerResult = async (result) => {
    if (result.isComplete) {
      setInterviewState("farewell");
      try {
        await API.post(`/interview/${id}/end`);
        setTimeout(() => {
          navigate(`/feedback/${id}`);
        }, 3000);
      } catch (error) {
        navigate(`/feedback/${id}`);
      }
      return;
    }

    setCurrentQuestionNum(result.currentQuestion);
    setCurrentQuestion(result.nextQuestion);

    // Natalie speaks follow up
    const message = result.followUp;
    setInterviewerMessage(message);

    // generate audio for follow up
    await generateNatalieAudio(message);
  };

  // submit text answer
  const handleTextSubmit = async () => {
    if (!textAnswer.trim()) return;

    setSubmitting(true);
    setInterviewState("thinking");
    setError("");

    try {
      const response = await API.post(`/interview/${id}/answer`, {
        answer: textAnswer,
      });

      setTextAnswer("");
      await processAnswerResult(response.data.data);
    } catch (error) {
      setError("Failed to submit answer. Please try again.");
      setInterviewState("listening");
    } finally {
      setSubmitting(false);
    }
  };

  // submit voice answer
  const handleVoiceSubmit = async (audioBlob) => {
    setSubmitting(true);
    setInterviewState("thinking");
    setError("");

    try {
      const formData = new FormData();
      formData.append("audio", audioBlob, "answer.webm");

      const response = await API.post(`/interview/${id}/voice`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      await processAnswerResult(response.data.data);
    } catch (error) {
      setError("Failed to process voice answer. Please try again.");
      setInterviewState("listening");
    } finally {
      setSubmitting(false);
    }
  };

  // end interview manually
  const handleEndInterview = async () => {
    if (!window.confirm("Are you sure you want to end the interview?")) return;

    try {
      await API.post(`/interview/${id}/end`);
      navigate(`/feedback/${id}`);
    } catch (error) {
      navigate(`/feedback/${id}`);
    }
  };

  if (loading) {
    return (
      <div className="interview-loading">
        <Navbar />
        <div className="loading-content">
          <div className="loading-spinner"></div>
          <p>Loading your interview...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="interview-container">
      <Navbar />

      {/* Audio Player — invisible, just plays audio */}
      <AudioPlayer audioBase64={audioBase64} onEnded={handleAudioEnded} />

      <div className="interview-content">
        {/* Progress Bar */}
        <div className="interview-progress">
          <span className="progress-text">
            Question {currentQuestionNum} of {totalQuestions}
          </span>
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{
                width: `${(currentQuestionNum / totalQuestions) * 100}%`,
              }}
            />
          </div>
        </div>

        {/* Interviewer Card */}
        <div className="interviewer-card">
          <div className="interviewer-avatar">🤖</div>
          <div className="interviewer-info">
            <span className="interviewer-name">Natalie</span>
            <span className={`interviewer-status ${interviewState}`}>
              {interviewState === "speaking" && "🔊 Speaking..."}
              {interviewState === "thinking" && "🤔 Thinking..."}
              {interviewState === "listening" && "👂 Listening"}
              {interviewState === "farewell" && "👋 Goodbye!"}
            </span>
          </div>
        </div>

        {/* Interviewer Message */}
        <div className="interviewer-message">
          <p>{interviewerMessage}</p>
        </div>

        {/* Current Question */}
        <div className="current-question">
          <h3>Current Question:</h3>
          <p>{currentQuestion}</p>
        </div>

        {/* Error */}
        {error && <div className="interview-error">{error}</div>}

        {/* Answer Section */}
        {interviewState === "listening" && (
          <div className="answer-section">
            {/* Voice Answer */}
            <div className="answer-card">
              <h3>🎤 Answer by Voice</h3>
              <VoiceRecorder
                onSubmit={handleVoiceSubmit}
                disabled={submitting}
              />
            </div>

            {/* Divider */}
            <div className="answer-divider">
              <span>OR</span>
            </div>

            {/* Text Answer */}
            <div className="answer-card">
              <h3>⌨️ Answer by Text</h3>
              <textarea
                className="text-answer"
                value={textAnswer}
                onChange={(e) => setTextAnswer(e.target.value)}
                placeholder="Type your answer here..."
                rows={4}
                disabled={submitting}
              />
              <button
                className="submit-text-btn"
                onClick={handleTextSubmit}
                disabled={submitting || !textAnswer.trim()}
              >
                {submitting ? "Processing..." : "Submit Answer →"}
              </button>
            </div>
          </div>
        )}

        {/* Thinking State */}
        {interviewState === "thinking" && (
          <div className="thinking-state">
            <div className="thinking-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
            <p>Natalie is processing your answer...</p>
          </div>
        )}

        {/* Farewell State */}
        {interviewState === "farewell" && (
          <div className="farewell-state">
            <h2>🎉 Interview Complete!</h2>
            <p>Generating your feedback report...</p>
            <div className="loading-spinner"></div>
          </div>
        )}

        {/* End Interview Button */}
        {interviewState === "listening" && (
          <button className="end-interview-btn" onClick={handleEndInterview}>
            End Interview Early
          </button>
        )}
      </div>
    </div>
  );
};

export default InterviewPage;
