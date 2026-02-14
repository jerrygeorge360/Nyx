import { Octokit } from "@octokit/rest";
import type { Repository } from "@prisma/client";
import { prisma } from "../../lib/prisma.js";
import { HttpError } from "../utils/httpError.js";

const octokit = new Octokit({
	auth: process.env.GITHUB_TOKEN || undefined,
	userAgent: "nyx-backend",
});

export interface GitHubRepo {
	id: number;
	name: string;
	full_name: string;
	html_url: string;
	description: string | null;
	language: string | null;
	stargazers_count: number;
	forks_count: number;
	updated_at: string;
	default_branch: string;
	visibility?: string | null;
}

export const fetchUserRepos = async (user: string): Promise<GitHubRepo[]> => {
	try {
		const response = await octokit.repos.listForUser({
			username: user,
			per_page: 100,
			sort: "updated",
		});

		return response.data.map((repo) => ({
			id: repo.id,
			name: repo.name,
			full_name: repo.full_name,
			html_url: repo.html_url,
			description: repo.description ?? null,
			language: repo.language ?? null,
			stargazers_count: repo.stargazers_count ?? 0,
			forks_count: repo.forks_count ?? 0,
			updated_at: repo.updated_at ?? new Date().toISOString(),
			default_branch: repo.default_branch ?? "main",
			visibility: repo.visibility ?? null,
		}));
	} catch (error: unknown) {
		const status = (error as { status?: number }).status ?? 500;
		const message = status === 404
			? "GitHub user not found"
			: "GitHub API error";
		throw new HttpError(status, message);
	}
};

export const fetchAndStoreUserRepos = async (
	user: string
): Promise<Repository[]> => {
	const repos = await fetchUserRepos(user);

	const existingUser = await prisma.user.findUnique({ where: { username: user } });
	if (existingUser?.memoryRevokedAt) {
		throw new HttpError(403, "User has revoked memory storage");
	}

	const owner = existingUser
		?? (await prisma.user.create({
			data: { username: user },
		}));

	const stored = await prisma.$transaction(
		repos.map((repo) =>
			prisma.repository.upsert({
				where: { githubId: repo.id },
				update: {
					name: repo.name,
					fullName: repo.full_name,
					url: repo.html_url,
					ownerId: owner.id,
				},
				create: {
					githubId: repo.id,
					name: repo.name,
					fullName: repo.full_name,
					url: repo.html_url,
					ownerId: owner.id,
				},
			})
		)
	);

	return stored;
};
