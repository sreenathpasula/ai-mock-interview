import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../api/axios.js";
import Navbar from "../../components/Navbar/index.jsx";
import "./HistoryPage.css";

const ITEMS_PER_PAGE = 8;

const HistoryPage = () => {
  const navigate = useNavigate();

  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalEntries, setTotalEntries] = useState(0);

  // load history
  useEffect(() => {
    loadHistory();
  }, [page]);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const response = await API.get(
        `/history?page=${page}&limit=${ITEMS_PER_PAGE}`
      );
      const data = response.data.data;
      setInterviews(data.entries);
      setTotalPages(data.totalPages);
      setTotalEntries(data.totalEntries);
    } catch (error) {
      console.error("Failed to load history:", error);
    } finally {
      setLoading(false);
    }
  };

  // delete one interview
  const handleDelete = async (interviewId, e) => {
    e.stopPropagation(); // prevent card click
    if (!window.confirm("Delete this interview?")) return;

    try {
      await API.delete(`/history/${interviewId}`);
      // remove from list immediately
      setInterviews((prev) => prev.filter((i) => i._id !== interviewId));
      setTotalEntries((prev) => prev - 1);
    } catch (error) {
      alert("Failed to delete interview.");
    }
  };

  // clear all history
  const handleClearAll = async () => {
    if (
      !window.confirm("Are you sure you want to delete ALL interview history?")
    )
      return;

    try {
      await API.delete("/history/clear");
      setInterviews([]);
      setTotalEntries(0);
    } catch (error) {
      alert("Failed to clear history.");
    }
  };

  // click on interview card
  const handleCardClick = (interview) => {
    if (interview.status === "completed") {
      navigate(`/feedback/${interview._id}`);
    } else {
      navigate(`/interview/${interview._id}`);
    }
  };

  // score color
  const getScoreColor = (score) => {
    if (!score) return "#94a3b8";
    if (score >= 80) return "#10b981";
    if (score >= 60) return "#f59e0b";
    return "#ef4444";
  };

  return (
    <div className="history-container">
      <Navbar />

      <div className="history-content">
        {/* Header */}
        <div className="history-header">
          <div>
            <h1>📋 Interview History</h1>
            <p>{totalEntries} total interviews</p>
          </div>
          {interviews.length > 0 && (
            <button className="clear-all-btn" onClick={handleClearAll}>
              🗑 Clear All
            </button>
          )}
        </div>

        {/* Loading */}
        {loading ? (
          <div className="history-loading">
            <div className="loading-spinner"></div>
            <p>Loading history...</p>
          </div>
        ) : interviews.length === 0 ? (
          /* Empty State */
          <div className="history-empty">
            <p>📭 No interviews yet!</p>
            <p>Start your first mock interview to see it here.</p>
            <button className="start-btn" onClick={() => navigate("/setup")}>
              🎤 Start Interview
            </button>
          </div>
        ) : (
          /* Interview List */
          <div className="history-list">
            {interviews.map((interview) => (
              <div
                key={interview._id}
                className="history-card"
                onClick={() => handleCardClick(interview)}
              >
                {/* Left — Role + Date */}
                <div className="history-card-left">
                  <span className="history-role">{interview.role}</span>
                  <span className="history-meta">
                    {interview.totalQuestions} questions •{" "}
                    {new Date(interview.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>

                {/* Right — Score + Status + Delete */}
                <div className="history-card-right">
                  {interview.overallScore !== null && (
                    <span
                      className="history-score"
                      style={{
                        color: getScoreColor(interview.overallScore),
                      }}
                    >
                      {interview.overallScore}%
                    </span>
                  )}

                  <span
                    className={`history-status ${
                      interview.status === "completed"
                        ? "status-completed"
                        : "status-progress"
                    }`}
                  >
                    {interview.status === "completed"
                      ? "✅ Done"
                      : "🔄 In Progress"}
                  </span>

                  <button
                    className="delete-btn"
                    onClick={(e) => handleDelete(interview._id, e)}
                  >
                    🗑
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="pagination">
            <button
              className="page-btn"
              onClick={() => setPage((p) => p - 1)}
              disabled={page === 1}
            >
              ← Previous
            </button>
            <span className="page-info">
              Page {page} of {totalPages}
            </span>
            <button
              className="page-btn"
              onClick={() => setPage((p) => p + 1)}
              disabled={page === totalPages}
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryPage;
