import mongoose from "mongoose";

const interviewSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    role: {
      type: String,
      required: true,
    },
    questions: {
      type: Array,
      default: [],
    },
    messages: {
      type: Array,
      default: [],
    },
    currentQuestion: {
      type: Number,
      default: 1,
    },
    totalQuestions: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["in-progress", "completed"],
      default: "in-progress",
    },
    feedback: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    overallScore: {
      type: Number,
      default: null,
    },
    codeSubmissions: {
      type: Array,
      default: [],
    },
  },
  { timestamps: true }
);

export default mongoose.model("Interview", interviewSchema);
