import Interview from "../models/Interview.model.js";

export const getUserHistory = async (userId, page = 1, limit = 10) => {
  try {
    const skip = (page - 1) * limit;

    const [entries, totalEntries] = await Promise.all([
      Interview.find({ userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select("role status overallScore totalQuestions createdAt"),
      Interview.countDocuments({ userId }),
    ]);

    const totalPages = Math.ceil(totalEntries / limit);

    return {
      entries,
      totalEntries,
      totalPages,
      currentPage: page,
    };
  } catch (error) {
    throw new Error(`Failed to get history: ${error.message}`);
  }
};

export const getHistoryItem = async (interviewId, userId) => {
  try {
    const interview = await Interview.findOne({
      _id: interviewId,
      userId,
    });

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

export const deleteHistoryItem = async (interviewId, userId) => {
  try {
    const interview = await Interview.findOneAndDelete({
      _id: interviewId,
      userId,
    });

    if (!interview) {
      const error = new Error("Interview not found");
      error.statusCode = 404;
      throw error;
    }

    return { message: "Interview deleted successfully" };
  } catch (error) {
    throw new Error(`Failed to delete interview: ${error.message}`);
  }
};

export const clearHistory = async (userId) => {
  try {
    const result = await Interview.deleteMany({ userId });

    return {
      message: "History cleared successfully",
      deletedCount: result.deletedCount,
    };
  } catch (error) {
    throw new Error(`Failed to clear history: ${error.message}`);
  }
};
