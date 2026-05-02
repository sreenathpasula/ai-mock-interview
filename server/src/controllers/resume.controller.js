import * as resumeService from "../services/resume.service.js";

export const uploadResume = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded. Please select a PDF.",
      });
    }

    const extractedText = await resumeService.parseResumePDF(req.file.buffer);

    const resume = await resumeService.saveResume(
      req.user._id,
      req.file.originalname,
      extractedText
    );

    res.status(201).json({
      success: true,
      message: "Resume uploaded successfully.",
      data: {
        fileName: resume.fileName,
        preview: extractedText.substring(0, 500),
        text: extractedText,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getResume = async (req, res, next) => {
  try {
    const resume = await resumeService.getResumeByUserId(req.user._id);

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: "No resume found. Please upload your resume.",
      });
    }

    res.json({
      success: true,
      data: {
        fileName: resume.fileName,
        text: resume.extractedText,
        preview: resume.extractedText.substring(0, 500),
        uploadedAt: resume.updatedAt,
      },
    });
  } catch (error) {
    next(error);
  }
};
