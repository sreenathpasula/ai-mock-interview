import { Router } from "express";
import {
  startInterview,
  submitAnswer,
  submitVoiceAnswer,
  transcribeOnly,
  endInterview,
  getInterview,
} from "../controllers/interview.controller.js";

import authentication from "../middleware/auth.middleware.js";
import { uploadAudio } from "../middleware/upload.middleware.js";
const router = Router();

router.use(authentication);

router.post("/start", startInterview);

router.post("/transcribe", uploadAudio, transcribeOnly);

router.post("/:id/voice", uploadAudio, submitVoiceAnswer);

router.post("/:id/answer", submitAnswer);
router.post("/:id/end", endInterview);
router.get("/:id", getInterview);

export default router;
