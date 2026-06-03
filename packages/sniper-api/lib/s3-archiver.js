// S3 Archiver — gzip + upload DailyUsage to S3

const fs = require('fs');
const zlib = require('zlib');
const path = require('path');

// Mock S3 client (replace with AWS SDK in production)
class S3Archiver {
  constructor(bucket, region) {
    this.bucket = bucket || process.env.S3_BUCKET_BACKUPS || 'kairos-check-backups';
    this.region = region || process.env.AWS_REGION || 'us-east-1';
  }

  async archiveToS3(rows) {
    const date = new Date().toISOString().split('T')[0];
    const filename = `dailyusage/${date}.jsonl.gz`;

    // Convert rows to JSONL format
    const jsonl = rows.map(r => JSON.stringify(r)).join('\n');
    const buffer = Buffer.from(jsonl, 'utf-8');

    // Gzip compress
    const compressed = await new Promise((resolve, reject) => {
      zlib.gzip(buffer, (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });

    console.log(`[s3-archiver] Compressed ${rows.length} rows: ${buffer.length} → ${compressed.length} bytes`);

    // Upload to S3 (placeholder — integrate AWS SDK in production)
    console.log(`[s3-archiver] Would upload to s3://${this.bucket}/${filename}`);

    // For now, save locally for testing
    const localPath = path.join('/tmp', filename.replace('/', '_'));
    fs.writeFileSync(localPath, compressed);
    console.log(`[s3-archiver] Saved locally: ${localPath}`);

    return `s3://${this.bucket}/${filename}`;
  }

  async deleteArchived(ids) {
    // Called after successful S3 upload verification
    // Returns count of deleted rows
    return ids.length;
  }
}

module.exports = {
  archiveToS3: async (rows) => {
    const archiver = new S3Archiver();
    return archiver.archiveToS3(rows);
  },
  deleteArchived: async (ids) => {
    const archiver = new S3Archiver();
    return archiver.deleteArchived(ids);
  },
};
