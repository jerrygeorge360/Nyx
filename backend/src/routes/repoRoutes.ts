import { Router } from "express";
import { getUserRepos } from "../controllers/githubControllers.js";
import { inspectRepos, removeRepo } from "../controllers/userDataController.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.get("/", asyncHandler(inspectRepos));
router.get("/:user", asyncHandler(getUserRepos));
router.delete("/:repoId", asyncHandler(removeRepo));

export default router;
