import { Router } from "express";
import { inspectIssues, removeIssue } from "../controllers/userDataController.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.get("/", asyncHandler(inspectIssues));
router.delete("/:issueId", asyncHandler(removeIssue));

export default router;
