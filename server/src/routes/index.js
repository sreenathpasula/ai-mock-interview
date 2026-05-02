import { Router } from "express";
import authRoutes from "./auth.routes.js";
import resumeRoutes from "./resume.routes.js";

const router = Router();

router.get("/health", (req, res) => res.json({ status: "OK" }));
router.use("/auth", authRoutes);
router.use("/resume", resumeRoutes);

export default router;
