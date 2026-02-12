import type { Request, Response } from "express";
import type { Repository } from "@prisma/client";
import { fetchAndStoreUserRepos } from "../services/repoService.js";
import { HttpError } from "../utils/httpError.js";

interface GetReposParams {
	user: string;
}

interface GetReposResponse {
	user: string;
	repos: Repository[];
}

export const getUserRepos = async (
	req: Request<GetReposParams, GetReposResponse>,
	res: Response<GetReposResponse>
) => {
	const { user } = req.params;

	if (!user) {
		throw new HttpError(400, "user is required");
	}

	const repos = await fetchAndStoreUserRepos(user);

	res.status(200).json({ user, repos });
};
