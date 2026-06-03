// DailyUsage Archival Job (S2.3)
// Nightly: Archive rows > 90 days to S3, then delete locally

const { PrismaClient } = require('@prisma/client');
const { archiveToS3, deleteArchived } = require('../lib/s3-archiver');

const prisma = new PrismaClient();

async function archiveDailyUsage() {
  console.log('[archive-daily-usage] Starting archival job...');

  try {
    // 1. Find rows older than 90 days
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    const oldRows = await prisma.dailyUsage.findMany({
      where: {
        createdAt: {
          lt: ninetyDaysAgo,
        },
      },
    });

    if (oldRows.length === 0) {
      console.log('[archive-daily-usage] No rows to archive.');
      return { archived: 0, deleted: 0 };
    }

    console.log(`[archive-daily-usage] Found ${oldRows.length} rows to archive.`);

    // 2. Archive to S3
    const s3Path = await archiveToS3(oldRows);
    console.log(`[archive-daily-usage] Archived to S3: ${s3Path}`);

    // 3. Verify archival
    const archived = await deleteArchived(oldRows.map(r => r.id));
    console.log(`[archive-daily-usage] Deleted ${archived} rows from local DB.`);

    return { archived: oldRows.length, deleted: archived, s3Path };
  } catch (error) {
    console.error('[archive-daily-usage] Error:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Export for scheduling (e.g., node-cron, AWS Lambda, etc.)
module.exports = { archiveDailyUsage };

// CLI execution
if (require.main === module) {
  archiveDailyUsage()
    .then(result => {
      console.log('[archive-daily-usage] Job completed:', result);
      process.exit(0);
    })
    .catch(err => {
      console.error('[archive-daily-usage] Job failed:', err);
      process.exit(1);
    });
}
