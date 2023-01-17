import { prisma } from '@Shared/services/prisma.service';

/**
 * Clear tables in database
 */
export async function clearDatabase() {
  await prisma.authSession.deleteMany();
  await prisma.user.deleteMany();
}
