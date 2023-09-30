import * as AWS from "aws-sdk";

export class TodoStorage {
  constructor(
    private readonly s3Client: AWS.S3,
    private readonly s3BucketName: string,
    private readonly urlExpiration: Number
  ) {}

  async getAttachmentUrl(attachmentId: string): Promise<string> {
    const attachmentUrl = `https://${this.s3BucketName}.s3.amazonaws.com/${attachmentId}`;
    return attachmentUrl;
  }

  async getUploadUrl(attachmentId): Promise<string> {
    const uploadUrl = this.s3Client.getSignedUrl("putObject", {
      Bucket: this.s3BucketName,
      Key: attachmentId,
      Expires: this.urlExpiration,
    });
    return uploadUrl;
  }
}
