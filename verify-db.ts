import { prisma } from './lib/db';

async function main() {
    try {
        const userCount = await prisma.user.count();
        console.log(`Connection successful! User count: ${userCount}`);
    } catch (error) {
        console.error('Connection failed:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main();
