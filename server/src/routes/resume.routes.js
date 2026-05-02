import { Router } from "express";
import { uploadResume, getResume } from "../controllers/resume.controller.js";

import authentication from "../middleware/auth.middleware.js";

import { uploadResume as multerUpload } from "../middleware/upload.middleware.js";

const router = Router();
router.use(authentication);
router.post("/upload", multerUpload, uploadResume);
router.get("/", getResume);

export default router;
