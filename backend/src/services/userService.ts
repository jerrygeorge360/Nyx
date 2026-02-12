import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function getUserById(userId: string) {
	return prisma.user.findUnique({
		where: { id: userId },
	});
}

export async function createUser(data: { username: string; email?: string }) {
	return prisma.user.create({
		data,
	});
}

export async function updateUserPreferences(userId: string, preferences: any) {
	return prisma.user.update({
		where: { id: userId },
		data: { preferences },
	});
}
