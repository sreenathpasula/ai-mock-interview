export const GENERATE_QUESTIONS_PROMPT = (role, resumeText, totalQuestions) => `
You are an expert technical interviewer. 
Analyze this resume and generate ${totalQuestions} interview questions for a ${role} position.

RESUME:
${resumeText}

Generate a mix of:
- Behavioral questions (30%)
- Technical questions (50%)
- Coding challenges (20%)

Return ONLY a JSON array like this, no extra text:
[
  {
    "id": 1,
    "type": "behavioral",
    "question": "Tell me about yourself",
    "expectedTopics": ["background", "experience", "skills"]
  },
  {
    "id": 2,
    "type": "technical",
    "question": "Explain how React hooks work",
    "expectedTopics": ["useState", "useEffect", "custom hooks"]
  },
  {
    "id": 3,
    "type": "coding",
    "question": "Write a function to reverse a string",
    "expectedTopics": ["string manipulation", "time complexity"]
  }
]`;

export const INTERVIEW_GREETING_PROMPT = (name, role) => `
You are Natalie, a friendly and professional AI interviewer.
Generate a warm greeting for a ${role} interview candidate named ${name}.
Be encouraging and briefly explain the interview format.
Keep it under 3 sentences.
Return ONLY the greeting text, no JSON, no markdown.`;

export const FOLLOW_UP_PROMPT = (role, conversationHistory, nextQuestion) => `
You are Natalie, a friendly interviewer conducting a ${role} interview.

CONVERSATION SO FAR:
${conversationHistory}

NEXT QUESTION TO ASK: "${nextQuestion}"

Acknowledge the candidate's previous answer in 1 sentence.
Then naturally transition to the next question.
Be warm and professional.
Return ONLY the response text, no JSON, no markdown.`;

export const FEEDBACK_PROMPT = (role, conversationHistory, codeSubmissions) => `
You are an expert technical interviewer. 
Evaluate this ${role} interview and provide detailed feedback.

INTERVIEW TRANSCRIPT:
${conversationHistory}

CODE SUBMISSIONS:
${codeSubmissions}

Return ONLY a JSON object like this:
{
  "overallScore": 78,
  "categories": {
    "technicalKnowledge": { "score": 80, "feedback": "Good understanding of core concepts" },
    "communication": { "score": 75, "feedback": "Clear explanations but could be more concise" },
    "problemSolving": { "score": 70, "feedback": "Good approach but missed edge cases" },
    "codeQuality": { "score": 85, "feedback": "Clean code with good variable names" },
    "culturalFit": { "score": 80, "feedback": "Showed enthusiasm and team mindset" }
  },
  "strengths": ["Strong React knowledge", "Good communication"],
  "improvements": ["Practice system design", "Work on time complexity"],
  "finalAssessment": "Strong candidate with good fundamentals"
}`;

export const EVALUATE_CODE_PROMPT = (question, code, language) => `
Evaluate this code submission:

QUESTION: ${question}
LANGUAGE: ${language}
CODE: 
${code}

Return ONLY a JSON object like this:
{
  "isCorrect": true,
  "score": 85,
  "feedback": "Good solution with correct logic",
  "timeComplexity": "O(n)",
  "spaceComplexity": "O(1)",
  "improvements": ["Could handle edge cases better"]
}`;

export const buildConversationHistory = (messages) => {
  return messages
    .slice(-20)
    .map((msg) => `${msg.role.toUpperCase()}: ${msg.content}`)
    .join("\n");
};
