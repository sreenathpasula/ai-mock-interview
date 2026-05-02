import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";
import Resume from "../models/Resume.model.js";

export const parseResumePDF = async (pdfBuffer) => {
  try {
    const uint8Array = new Uint8Array(
      pdfBuffer.buffer,
      pdfBuffer.byteOffset,
      pdfBuffer.byteLength
    );

    const pdf = await pdfjsLib.getDocument({ data: uint8Array }).promise;

    let fullText = "";

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map((item) => item.str).join(" ");
      fullText += pageText + "\n";
    }

    return fullText.trim();
  } catch (error) {
    throw new Error(`Failed to parse PDF: ${error.message}`);
  }
};

export const saveResume = async (userId, fileName, extractedText) => {
  try {
    const resume = await Resume.findOneAndUpdate(
      { userId },
      { userId, fileName, extractedText },
      { upsert: true, new: true }
    );
    return resume;
  } catch (error) {
    throw new Error(`Failed to save resume: ${error.message}`);
  }
};

export const getResumeByUserId = async (userId) => {
  try {
    const resume = await Resume.findOne({ userId });
    return resume;
  } catch (error) {
    throw new Error(`Failed to get resume: ${error.message}`);
  }
};
