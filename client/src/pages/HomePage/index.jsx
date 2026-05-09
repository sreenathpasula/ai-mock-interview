import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import API from "../../api/axios.js";
import Navbar from "../../components/Navbar/index.jsx";
import "./HomePage.css";

const HomePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    averageScore: 0,
  });

  const [recentInterviews, setRecentInterviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const response = await API.get("/history?page=1&limit=100");
        const entries = response.data.data.entries;

        const completed = entries.filter((e) => e.status === "completed");

        const avgScore =
          completed.length > 0
            ? Math.round(
                completed.reduce((sum, e) => sum + (e.overallScore || 0), 0) /
                  completed.length
              )
            : 0;

        setStats({
          total: entries.length,
          completed: completed.length,
          averageScore: avgScore,
        });

        // show only 3 most recent
        setRecentInterviews(entries.slice(0, 3));
      } catch (error) {
        console.error("Failed to load history:", error.message);
      } finally {
        setLoading(false);
      }
    };

    loadHistory();
  }, []);

  return (
    <div className="home-container">
      <Navbar />

      <div className="home-content">
        <div className="home-welcome">
          <h1>Welcome back, {user?.name}! </h1>
          <p>
            Practice makes perfect. Start an AI-powered mock interview and
            improve your skills today.
          </p>
          <button className="home-start-btn" onClick={() => navigate("/setup")}>
            🎤 Start New Interview
          </button>
        </div>

        <div className="home-stats">
          <div className="stat-card">
            <span className="stat-number">{stats.total}</span>
            <span className="stat-label">Total Interviews</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">{stats.completed}</span>
            <span className="stat-label">Completed</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">
              {stats.averageScore > 0 ? `${stats.averageScore}%` : "N/A"}
            </span>
            <span className="stat-label">Average Score</span>
          </div>
        </div>

        <div className="home-recent">
          <div className="recent-header">
            <h2>Recent Interviews</h2>
            <button
              onClick={() => navigate("/history")}
              className="view-all-btn"
            >
              View All
            </button>
          </div>

          {loading ? (
            <p className="loading-text">Loading...</p>
          ) : recentInterviews.length === 0 ? (
            <div className="no-interviews">
              <p>No interviews yet!</p>
              <p>Start your first interview to see it here.</p>
            </div>
          ) : (
            <div className="interview-list">
              {recentInterviews.map((interview) => (
                <div
                  key={interview._id}
                  className="interview-card"
                  onClick={() =>
                    interview.status === "completed"
                      ? navigate(`/feedback/${interview._id}`)
                      : navigate(`/interview/${interview._id}`)
                  }
                >
                  \{" "}
                  <div className="interview-card-left">
                    <span className="interview-role">{interview.role}</span>
                    <span className="interview-date">
                      {new Date(interview.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="interview-card-right">
                    {interview.overallScore !== null && (
                      <span className="interview-score">
                        {interview.overallScore}%
                      </span>
                    )}
                    <span
                      className={`interview-status ${
                        interview.status === "completed"
                          ? "status-completed"
                          : "status-progress"
                      }`}
                    >
                      {interview.status === "completed"
                        ? " Completed"
                        : " In Progress"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
