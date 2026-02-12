import { Router } from "express";
import { createReview, listReviews } from "../controllers/reviewController.js";
import { inspectReviews, removeReview } from "../controllers/userDataController.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.post("/", asyncHandler(createReview));
router.get("/", asyncHandler(inspectReviews));
router.get("/:repoId", asyncHandler(listReviews));
router.delete("/:reviewId", asyncHandler(removeReview));

export default router;
