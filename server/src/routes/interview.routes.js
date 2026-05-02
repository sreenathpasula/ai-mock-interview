import { Router } from "express";
import {
  startInterview,
  submitAnswer,
  endInterview,
  getInterview,
} from "../controllers/interview.controller.js";

import authentication from "../middleware/auth.middleware.js";

const router = Router();

router.use(authentication);

router.post("/start", startInterview);
router.post("/:id/answer", submitAnswer);
router.post("/:id/end", endInterview);
router.get("/:id", getInterview);

export default router;
