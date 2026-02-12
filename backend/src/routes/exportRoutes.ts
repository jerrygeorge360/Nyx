import { Router } from "express";
import { exportIssues, exportPreferences, exportRepos, exportReviews } from "../controllers/userDataController.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.get("/repos", asyncHandler(exportRepos));
router.get("/reviews", asyncHandler(exportReviews));
router.get("/issues", asyncHandler(exportIssues));
router.get("/preferences", asyncHandler(exportPreferences));

export default router;
