import Interview from "../models/Interview.model.js";
import { askGemini } from "./gemini.service.js";
import { parseGeminiJSON } from "../utils/prompts.utils.js";
import {
  GENERATE_QUESTIONS_PROMPT,
  INTERVIEW_GREETING_PROMPT,
  FOLLOW_UP_PROMPT,
  FEEDBACK_PROMPT,
  buildConversationHistory,
} from "../constants/prompts.js";

export const startInterview = async (
  userId,
  role,
  resumeText,
  totalQuestions
) => {
  try {
    const questionsPrompt = GENERATE_QUESTIONS_PROMPT(
      role,
      resumeText,
      totalQuestions
    );
    const questionsResponse = await askGemini(questionsPrompt);
    const questions = parseGeminiJSON(questionsResponse);

    const greetingPrompt = INTERVIEW_GREETING_PROMPT(role);
    const greeting = await askGemini(greetingPrompt);

    const firstQuestion = "Tell me about yourself.";

    const interview = await Interview.create({
      userId,
      role,
      questions,
      totalQuestions,
      messages: [
        { role: "interviewer", content: greeting },
        { role: "interviewer", content: firstQuestion },
      ],
      currentQuestion: 1,
      status: "in-progress",
    });

    return {
      interviewId: interview._id,
      role: interview.role,
      greeting,
      firstQuestion,
      totalQuestions: interview.totalQuestions,
      currentQuestion: interview.currentQuestion,
      questions: interview.questions,
    };
  } catch (error) {
    throw new Error(`Failed to start interview: ${error.message}`);
  }
};

export const submitAnswer = async (interviewId, userId, answer) => {
  try {
    const interview = await Interview.findOne({ _id: interviewId, userId });

    if (!interview) {
      const error = new Error("Interview not found");
      error.statusCode = 404;
      throw error;
    }

    interview.messages.push({ role: "candidate", content: answer });

    const isLastQuestion =
      interview.currentQuestion >= interview.totalQuestions;

    if (isLastQuestion) {
      interview.status = "completed";
      await interview.save();
      return {
        isComplete: true,
        message: "Interview completed! Generating your feedback...",
      };
    }

    interview.currentQuestion += 1;
    const nextQuestion = interview.questions[interview.currentQuestion - 1];
    const conversationHistory = buildConversationHistory(interview.messages);

    const followUpPrompt = FOLLOW_UP_PROMPT(
      interview.role,
      conversationHistory,
      nextQuestion.question
    );

    const followUpResponse = await askGemini(followUpPrompt);

    interview.messages.push({ role: "interviewer", content: followUpResponse });
    await interview.save();

    return {
      isComplete: false,
      followUp: followUpResponse,
      currentQuestion: interview.currentQuestion,
      totalQuestions: interview.totalQuestions,
      nextQuestion: nextQuestion.question,
      questionType: nextQuestion.type,
    };
  } catch (error) {
    throw new Error(`Failed to submit answer: ${error.message}`);
  }
};

export const endInterview = async (interviewId, userId) => {
  try {
    const interview = await Interview.findOne({ _id: interviewId, userId });

    if (!interview) {
      const error = new Error("Interview not found");
      error.statusCode = 404;
      throw error;
    }

    if (interview.status === "completed" && interview.feedback) {
      return {
        interviewId: interview._id,
        feedback: interview.feedback,
        overallScore: interview.overallScore,
      };
    }

    const conversationHistory = buildConversationHistory(interview.messages);

    const codeSubmissions =
      interview.codeSubmissions.length > 0
        ? interview.codeSubmissions
            .map((sub) => `Question: ${sub.question}\nCode: ${sub.code}`)
            .join("\n\n")
        : "No code submissions";

    const feedbackPrompt = FEEDBACK_PROMPT(
      interview.role,
      conversationHistory,
      codeSubmissions
    );

    const feedbackResponse = await askGemini(feedbackPrompt);
    const feedback = parseGeminiJSON(feedbackResponse);

    interview.feedback = feedback;
    interview.overallScore = feedback.overallScore;
    interview.status = "completed";
    await interview.save();

    return {
      interviewId: interview._id,
      feedback,
      overallScore: feedback.overallScore,
    };
  } catch (error) {
    throw new Error(`Failed to generate feedback: ${error.message}`);
  }
};

export const getInterviewById = async (interviewId, userId) => {
  try {
    const interview = await Interview.findOne({ _id: interviewId, userId });

    if (!interview) {
      const error = new Error("Interview not found");
      error.statusCode = 404;
      throw error;
    }

    return interview;
  } catch (error) {
    throw new Error(`Failed to get interview: ${error.message}`);
  }
};
