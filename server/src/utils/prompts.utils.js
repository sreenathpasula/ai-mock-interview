export const parseGeminiJSON = (text) => {
  try {
    let cleanText = text.trim();
    if (cleanText.startsWith("```")) {
      cleanText = cleanText.replace(/^```(?:json)?\s*\n?/, "");
      cleanText = cleanText.replace(/\n?```\s*$/, "");
    }
    return JSON.parse(cleanText.trim());
  } catch (error) {
    throw new Error(
      `Failed to parse Gemini response as JSON: ${error.message}`
    );
  }
};
