import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../../api/axios.js";
import Navbar from "../../components/Navbar/index.jsx";
import "./FeedbackPage.css";

const FeedbackPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadFeedback = async () => {
      try {
        const response = await API.get(`/interview/${id}`);
        const data = response.data.data;

        if (!data.feedback) {
          // feedback not ready yet → generate it
          const feedbackRes = await API.post(`/interview/${id}/end`);
          setFeedback(feedbackRes.data.data.feedback);
        } else {
          setFeedback(data.feedback);
        }
      } catch (error) {
        setError("Failed to load feedback.");
      } finally {
        setLoading(false);
      }
    };

    loadFeedback();
  }, [id]);

  // get color based on score
  const getScoreColor = (score) => {
    if (score >= 80) return "#10b981"; // green
    if (score >= 60) return "#f59e0b"; // yellow
    return "#ef4444"; // red
  };

  if (loading) {
    return (
      <div className="feedback-loading">
        <Navbar />
        <div className="loading-content">
          <div className="loading-spinner"></div>
          <p>Generating your feedback...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="feedback-loading">
        <Navbar />
        <div className="loading-content">
          <p style={{ color: "#ef4444" }}>{error}</p>
          <button onClick={() => navigate("/")} className="back-home-btn">
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="feedback-container">
      <Navbar />

      <div className="feedback-content">
        {/* Header */}
        <div className="feedback-header">
          <h1>📊 Interview Feedback</h1>
          <p>Here's how you performed in your mock interview</p>
        </div>

        {/* Overall Score */}
        <div className="overall-score-card">
          <div
            className="score-circle"
            style={{ borderColor: getScoreColor(feedback?.overallScore) }}
          >
            <span
              className="score-number"
              style={{ color: getScoreColor(feedback?.overallScore) }}
            >
              {feedback?.overallScore}
            </span>
            <span className="score-label">/ 100</span>
          </div>
          <div className="score-info">
            <h2>Overall Score</h2>
            <p>
              {feedback?.overallScore >= 80
                ? "🌟 Excellent performance!"
                : feedback?.overallScore >= 60
                ? "👍 Good effort, keep practicing!"
                : "💪 Keep practicing, you'll improve!"}
            </p>
          </div>
        </div>

        {/* Category Scores */}
        <div className="categories-section">
          <h2>Detailed Scores</h2>
          <div className="categories-grid">
            {feedback?.categories &&
              Object.entries(feedback.categories).map(([key, value]) => (
                <div key={key} className="category-card">
                  <div className="category-header">
                    <span className="category-name">
                      {key === "technicalKnowledge" && "💻 Technical Knowledge"}
                      {key === "communication" && "🗣️ Communication"}
                      {key === "problemSolving" && "🧩 Problem Solving"}
                      {key === "codeQuality" && "⌨️ Code Quality"}
                      {key === "culturalFit" && "🤝 Cultural Fit"}
                    </span>
                    <span
                      className="category-score"
                      style={{ color: getScoreColor(value.score) }}
                    >
                      {value.score}%
                    </span>
                  </div>

                  {/* Score Bar */}
                  <div className="score-bar">
                    <div
                      className="score-bar-fill"
                      style={{
                        width: `${value.score}%`,
                        background: getScoreColor(value.score),
                      }}
                    />
                  </div>

                  <p className="category-feedback">{value.feedback}</p>
                </div>
              ))}
          </div>
        </div>

        {/* Strengths */}
        <div className="feedback-section">
          <h2>✅ Strengths</h2>
          <ul className="feedback-list">
            {feedback?.strengths?.map((s, i) => (
              <li key={i} className="strength-item">
                {s}
              </li>
            ))}
          </ul>
        </div>

        {/* Improvements */}
        <div className="feedback-section">
          <h2>📈 Areas to Improve</h2>
          <ul className="feedback-list">
            {feedback?.improvements?.map((item, i) => (
              <li key={i} className="improvement-item">
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Final Assessment */}
        <div className="final-assessment">
          <h2>📝 Final Assessment</h2>
          <p>{feedback?.finalAssessment}</p>
        </div>

        {/* Action Buttons */}
        <div className="feedback-actions">
          <button className="try-again-btn" onClick={() => navigate("/setup")}>
            🎤 Try Again
          </button>
          <button className="history-btn" onClick={() => navigate("/history")}>
            📋 View History
          </button>
          <button className="home-btn" onClick={() => navigate("/")}>
            🏠 Go Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default FeedbackPage;
