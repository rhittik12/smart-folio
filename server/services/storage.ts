import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { PrismaClient } from '@prisma/client'

export interface StorageServiceConfig {
  region: string
  accessKeyId: string
  secretAccessKey: string
  bucket: string
}

export interface UploadOptions {
  key: string
  body: Buffer | Uint8Array | Blob | string
  contentType: string
  metadata?: Record<string, string>
}

export class StorageService {
  private s3: S3Client
  private config: StorageServiceConfig
  private prisma: PrismaClient

  constructor(config: StorageServiceConfig, prisma: PrismaClient) {
    this.config = config
    this.prisma = prisma
    this.s3 = new S3Client({
      region: config.region,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
    })
  }

  async uploadFile(options: UploadOptions): Promise<string> {
    try {
      const command = new PutObjectCommand({
        Bucket: this.config.bucket,
        Key: options.key,
        Body: options.body,
        ContentType: options.contentType,
        Metadata: options.metadata,
      })

      await this.s3.send(command)

      // Return the public URL
      return `https://${this.config.bucket}.s3.${this.config.region}.amazonaws.com/${options.key}`
    } catch (error) {
      console.error('S3 upload error:', error)
      throw new Error('Failed to upload file')
    }
  }

  async deleteFile(key: string): Promise<void> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.config.bucket,
        Key: key,
      })

      await this.s3.send(command)
    } catch (error) {
      console.error('S3 delete error:', error)
      throw new Error('Failed to delete file')
    }
  }

  async getSignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.config.bucket,
        Key: key,
      })

      return await getSignedUrl(this.s3, command, { expiresIn })
    } catch (error) {
      console.error('S3 signed URL error:', error)
      throw new Error('Failed to generate signed URL')
    }
  }

  async uploadPortfolioImage(
    userId: string,
    portfolioId: string,
    file: Buffer,
    contentType: string,
    filename: string
  ): Promise<string> {
    // Generate a unique key
    const key = `portfolios/${userId}/${portfolioId}/${Date.now()}-${filename}`

    // Upload to S3
    const url = await this.uploadFile({
      key,
      body: file,
      contentType,
      metadata: {
        userId,
        portfolioId,
        type: 'portfolio-image',
      },
    })

    return url
  }

  async uploadUserAvatar(userId: string, file: Buffer, contentType: string): Promise<string> {
    // Generate a unique key for avatar
    const key = `avatars/${userId}/${Date.now()}-avatar`

    // Upload to S3
    const url = await this.uploadFile({
      key,
      body: file,
      contentType,
      metadata: {
        userId,
        type: 'user-avatar',
      },
    })

    // Update user's avatar URL in database
    await this.prisma.user.update({
      where: { id: userId },
      data: { image: url },
    })

    return url
  }

  async deletePortfolioImage(portfolioId: string, imageUrl: string): Promise<void> {
    try {
      // Extract key from URL
      const url = new URL(imageUrl)
      const key = url.pathname.substring(1) // Remove leading '/'

      await this.deleteFile(key)
    } catch (error) {
      console.error('Failed to delete portfolio image:', error)
      throw new Error('Failed to delete portfolio image')
    }
  }

  generateImageKey(userId: string, portfolioId: string, filename: string): string {
    const timestamp = Date.now()
    const cleanFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_')
    return `portfolios/${userId}/${portfolioId}/${timestamp}-${cleanFilename}`
  }

  generateAvatarKey(userId: string): string {
    return `avatars/${userId}/${Date.now()}-avatar`
  }

  isValidImageType(contentType: string): boolean {
    const validTypes = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/gif',
    ]
    return validTypes.includes(contentType)
  }

  isValidImageSize(sizeBytes: number, maxSizeMB: number = 5): boolean {
    const maxSizeBytes = maxSizeMB * 1024 * 1024
    return sizeBytes <= maxSizeBytes
  }
}