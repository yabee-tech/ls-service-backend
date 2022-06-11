const AWS = require('aws-sdk');
const fs = require('fs');

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_KEY_ID_DEV,
  secretAccessKey: process.env.AWS_SECRET_DEV,
});

const fileNames = ['/tmp/new_bookings.tmp', '/tmp/repair-done.tmp', '/tmp/booking-confirmed.tmp'];
fileNames.forEach((fileName) => {
  fs.stat(fileName, (err) => {
    if (err) {
      console.log('backup file not found ', fileName);
      return;
    }
    const fileContent = fs.readFileSync(fileName);

    const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: `${fileName}`,
      Body: fileContent,
    };

    s3.upload(params, (uploadErr, data) => {
      if (uploadErr) {
        console.error('❌ Backup failure');
        console.error(uploadErr);
        return;
      }
      console.log(`✅ Backup ${fileName} success, location at ${data.Location}`);
    });
  });
});
