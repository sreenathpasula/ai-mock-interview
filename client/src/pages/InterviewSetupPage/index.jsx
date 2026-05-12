import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../api/axios.js";
import Navbar from "../../components/Navbar/index.jsx";
import "./InterviewSetupPage.css";

const ROLES = [
  "Full Stack Developer",
  "Frontend Developer",
  "Backend Developer",
  "React Developer",
  "Node.js Developer",
  "Data Analyst",
  "DevOps Engineer",
  "Python Developer",
];

const QUESTION_OPTIONS = [
  { label: "5 Questions", value: 5, time: "~10 mins" },
  { label: "10 Questions", value: 10, time: "~20 mins" },
  { label: "15 Questions", value: 15, time: "~30 mins" },
];

const InterviewSetupPage = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);

  const [selectedRole, setSelectedRole] = useState("");
  const [totalQuestions, setTotalQuestions] = useState(5);

  const [resumeText, setResumeText] = useState("");
  const [resumeFileName, setResumeFileName] = useState("");
  const [uploading, setUploading] = useState(false);

  const [starting, setStarting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadResume = async () => {
      try {
        const response = await API.get("/resume");
        if (response.data.data) {
          setResumeText(response.data.data.text);
          setResumeFileName(response.data.data.fileName);
        }
      } catch (error) {}
    };
    loadResume();
  }, []);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      setError("Please upload a PDF file only.");
      return;
    }

    setUploading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("resume", file);

      const response = await API.post("/resume/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setResumeText(response.data.data.text);
      setResumeFileName(response.data.data.fileName);
    } catch (error) {
      setError("Failed to upload resume. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleStartInterview = async () => {
    if (!resumeText) {
      setError("Please upload your resume first.");
      return;
    }

    setStarting(true);
    setError("");

    try {
      const response = await API.post("/interview/start", {
        role: selectedRole,
        resumeText,
        totalQuestions,
      });

      const { interviewId } = response.data.data;

      navigate(`/interview/${interviewId}`);
    } catch (error) {
      setError("Failed to start interview. Please try again.");
    } finally {
      setStarting(false);
    }
  };

  return (
    <div className="setup-container">
      <Navbar />

      <div className="setup-content">
        <div className="setup-card">
          <div className="setup-header">
            <h1>Setup Your Interview</h1>
            <p>Configure your mock interview in 3 simple steps</p>
          </div>

          <div className="setup-progress">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`progress-step ${step >= s ? "active" : ""}`}
              >
                <div className="step-circle">{s}</div>
                <span className="step-label">
                  {s === 1 ? "Role" : s === 2 ? "Questions" : "Resume"}
                </span>
              </div>
            ))}
          </div>

          {error && <div className="setup-error">{error}</div>}

          {step === 1 && (
            <div className="step-content">
              <h2>Select Job Role</h2>
              <p>Choose the role you want to practice for</p>
              <div className="role-grid">
                {ROLES.map((role) => (
                  <button
                    key={role}
                    className={`role-btn ${
                      selectedRole === role ? "selected" : ""
                    }`}
                    onClick={() => setSelectedRole(role)}
                  >
                    {role}
                  </button>
                ))}
              </div>
              <button
                className="next-btn"
                onClick={() => setStep(2)}
                disabled={!selectedRole}
              >
                Next →
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="step-content">
              <h2>Number of Questions</h2>
              <p>How many questions do you want to practice?</p>
              <div className="questions-grid">
                {QUESTION_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    className={`question-btn ${
                      totalQuestions === option.value ? "selected" : ""
                    }`}
                    onClick={() => setTotalQuestions(option.value)}
                  >
                    <span className="question-count">{option.label}</span>
                    <span className="question-time">{option.time}</span>
                  </button>
                ))}
              </div>
              <div className="step-buttons">
                <button className="back-btn" onClick={() => setStep(1)}>
                  ← Back
                </button>
                <button className="next-btn" onClick={() => setStep(3)}>
                  Next →
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="step-content">
              <h2>Your Resume</h2>
              <p>Upload your resume for personalized questions</p>

              {resumeFileName ? (
                <div className="resume-saved">
                  <span>📄 {resumeFileName}</span>
                  <span className="resume-saved-label">Resume Ready</span>
                </div>
              ) : (
                <div className="resume-empty">No resume uploaded yet</div>
              )}

              <label className="upload-label">
                {uploading ? "Uploading..." : " Upload PDF Resume"}
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileUpload}
                  disabled={uploading}
                  style={{ display: "none" }}
                />
              </label>

              <div className="setup-summary">
                <h3>Interview Summary</h3>
                <div className="summary-item">
                  <span>Role:</span>
                  <span>{selectedRole}</span>
                </div>
                <div className="summary-item">
                  <span>Questions:</span>
                  <span>{totalQuestions}</span>
                </div>
                <div className="summary-item">
                  <span>Resume:</span>
                  <span>{resumeFileName || "Not uploaded"}</span>
                </div>
              </div>

              <div className="step-buttons">
                <button className="back-btn" onClick={() => setStep(2)}>
                  ← Back
                </button>
                <button
                  className="start-btn"
                  onClick={handleStartInterview}
                  disabled={starting || !resumeText}
                >
                  {starting ? " Generating Questions..." : " Start Interview"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InterviewSetupPage;
