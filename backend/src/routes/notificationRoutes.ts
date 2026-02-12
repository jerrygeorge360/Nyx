import { Router } from "express";
import { inspectNotifications } from "../controllers/userDataController.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.get("/", asyncHandler(inspectNotifications));

export default router;
