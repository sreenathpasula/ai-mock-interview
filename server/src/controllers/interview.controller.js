import * as interviewService from "../services/interview.service.js";

export const startInterview = async (req, res, next) => {
  try {
    const { role, resumeText, totalQuestions } = req.body;

    if (!role) {
      return res.status(400).json({
        success: false,
        message: "Please select a role for the interview.",
      });
    }

    if (!resumeText) {
      return res.status(400).json({
        success: false,
        message: "Please upload your resume first.",
      });
    }

    const result = await interviewService.startInterview(
      req.user._id,
      role,
      resumeText,
      totalQuestions || 5
    );

    res.status(201).json({
      success: true,
      message: "Interview started successfully.",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const submitAnswer = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { answer } = req.body;

    if (!answer) {
      return res.status(400).json({
        success: false,
        message: "Please provide an answer.",
      });
    }

    const result = await interviewService.submitAnswer(
      id,
      req.user._id,
      answer
    );

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const endInterview = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await interviewService.endInterview(id, req.user._id);

    res.json({
      success: true,
      message: "Interview completed. Feedback generated!",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getInterview = async (req, res, next) => {
  try {
    const { id } = req.params;

    const interview = await interviewService.getInterviewById(id, req.user._id);

    res.json({
      success: true,
      data: interview,
    });
  } catch (error) {
    next(error);
  }
};
