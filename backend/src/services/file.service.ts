import { Request } from 'express';
import multer from 'multer';
import path from 'path';
import { Errors } from '../utils/errors';
import { env } from '../config/env';
import logger from '../config/logger';
import fs from 'fs/promises';

/**
 * 文件上傳配置
 */
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    try {
      // 確保上傳目錄存在
      await fs.mkdir(env.UPLOAD_DIR, { recursive: true });
      cb(null, env.UPLOAD_DIR);
    } catch (error) {
      cb(error as Error, env.UPLOAD_DIR);
    }
  },
  filename: (req, file, cb) => {
    // 生成唯一文件名，防止路徑遍歷
    const ext = path.extname(file.originalname);
    const allowedExts = ['.jpg', '.jpeg', '.png', '.gif', '.mp4'];
    
    if (!allowedExts.includes(ext.toLowerCase())) {
      return cb(new Error('不支持的文件類型'), '');
    }

    // 清理文件名，移除危險字符
    const safeName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${ext}`;
    cb(null, uniqueName);
  },
});

const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4'];
  
  // 驗證MIME類型
  if (!allowedTypes.includes(file.mimetype)) {
    return cb(new Error('不支持的文件類型'));
  }
  
  // 驗證文件擴展名（防止MIME類型偽造）
  const ext = path.extname(file.originalname).toLowerCase();
  const allowedExts = ['.jpg', '.jpeg', '.png', '.gif', '.mp4'];
  if (!allowedExts.includes(ext)) {
    return cb(new Error('不支持的文件擴展名'));
  }
  
  cb(null, true);
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: env.MAX_FILE_SIZE, // 5MB
    files: 3, // 最多3個文件
  },
});

/**
 * 文件服務類
 */
export class FileService {
  /**
   * 驗證文件
   */
  validateFile(file: Express.Multer.File): void {
    // 驗證文件大小
    if (file.size > env.MAX_FILE_SIZE) {
      throw Errors.FILE_TOO_LARGE(`文件大小不能超過${env.MAX_FILE_SIZE / 1024 / 1024}MB`);
    }

    // 驗證文件類型
    const ext = path.extname(file.originalname).toLowerCase();
    const allowedExts = ['.jpg', '.jpeg', '.png', '.gif', '.mp4'];
    if (!allowedExts.includes(ext)) {
      throw Errors.INVALID_FILE_TYPE('只支持JPG、PNG、GIF、MP4格式');
    }
  }

  /**
   * 獲取文件URL（生產環境應使用CDN）
   */
  getFileUrl(filename: string): string {
    // 開發環境：返回本地路徑
    // 生產環境：應返回CDN URL
    if (env.NODE_ENV === 'production') {
      // TODO: 集成CDN服務（如Cloudinary）
      // 當前使用相對路徑，生產環境應配置CDN
      const cdnUrl = process.env.CDN_URL;
      if (cdnUrl) {
        return `${cdnUrl}/${filename}`;
      }
    }
    return `${env.FRONTEND_URL}/uploads/${filename}`;
  }

  /**
   * 驗證並處理圖片（壓縮等，預留接口）
   */
  async processImage(file: Express.Multer.File): Promise<string> {
    // TODO: 使用sharp等庫壓縮圖片
    // 當前直接返回文件名
    return file.filename;
  }

  /**
   * 驗證並處理視頻（轉碼等，預留接口）
   */
  async processVideo(file: Express.Multer.File): Promise<string> {
    // TODO: 使用ffmpeg等工具處理視頻
    // 當前直接返回文件名
    return file.filename;
  }

  /**
   * 刪除文件
   */
  async deleteFile(filename: string): Promise<void> {
    try {
      const filePath = path.join(env.UPLOAD_DIR, filename);
      await fs.unlink(filePath);
    } catch (error) {
      logger.error('Failed to delete file', { filename, error });
      // 不拋出錯誤，因為文件可能已經不存在
    }
  }
}

export const fileService = new FileService();

