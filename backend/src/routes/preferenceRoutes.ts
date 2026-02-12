import { Router } from "express";
import { inspectPreferences, removePreference } from "../controllers/userDataController.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.get("/", asyncHandler(inspectPreferences));
router.delete("/:repoId", asyncHandler(removePreference));

export default router;
