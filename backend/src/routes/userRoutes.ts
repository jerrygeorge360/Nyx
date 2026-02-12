import { Router } from "express";
import { removeUser } from "../controllers/userDataController.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.delete("/:userId", asyncHandler(removeUser));

export default router;
