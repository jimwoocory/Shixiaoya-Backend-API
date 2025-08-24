import express from 'express'
import multer from 'multer'
import path from 'path'
import sharp from 'sharp'
import fs from 'fs/promises'
import { adminAuth } from '../middleware/auth'

const router = express.Router()

// 确保上传目录存在
const ensureUploadDir = async (dir: string) => {
  try {
    await fs.access(dir)
  } catch {
    await fs.mkdir(dir, { recursive: true })
  }
}

// 配置multer存储
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'uploads', 'temp')
    await ensureUploadDir(uploadDir)
    cb(null, uploadDir)
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname))
  }
})

// 文件过滤器
const fileFilter = (req: any, file: any, cb: any) => {
  // 检查文件类型
  if (file.mimetype.startsWith('image/')) {
    cb(null, true)
  } else {
    cb(new Error('只允许上传图片文件'), false)
  }
}

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760') // 默认10MB
  }
})

// 图片上传接口
router.post('/image',
  adminAuth,
  upload.single('image'),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: '请选择要上传的图片'
        })
      }
      
      const { width, height, quality = 80 } = req.query
      const tempPath = req.file.path
      const filename = `${Date.now()}-${Math.round(Math.random() * 1E9)}.webp`
      
      // 确保最终存储目录存在
      const finalDir = path.join(process.cwd(), 'uploads', 'images')
      await ensureUploadDir(finalDir)
      
      const finalPath = path.join(finalDir, filename)
      
      // 使用sharp处理图片
      let sharpInstance = sharp(tempPath)
      
      // 调整尺寸
      if (width || height) {
        sharpInstance = sharpInstance.resize(
          width ? parseInt(width as string) : undefined,
          height ? parseInt(height as string) : undefined,
          { fit: 'inside', withoutEnlargement: true }
        )
      }
      
      // 转换为WebP格式并压缩
      await sharpInstance
        .webp({ quality: parseInt(quality as string) })
        .toFile(finalPath)
      
      // 删除临时文件
      await fs.unlink(tempPath)
      
      const imageUrl = `/uploads/images/${filename}`
      
      res.json({
        success: true,
        data: {
          url: imageUrl,
          filename,
          originalName: req.file.originalname,
          size: (await fs.stat(finalPath)).size
        },
        message: '图片上传成功'
      })
    } catch (error) {
      console.error('图片上传失败:', error)
      
      // 清理临时文件
      if (req.file?.path) {
        try {
          await fs.unlink(req.file.path)
        } catch {}
      }
      
      res.status(500).json({
        success: false,
        message: '图片上传失败'
      })
    }
  }
)

// 批量图片上传接口
router.post('/images',
  adminAuth,
  upload.array('images', 10), // 最多10张图片
  async (req, res) => {
    try {
      const files = req.files as Express.Multer.File[]
      
      if (!files || files.length === 0) {
        return res.status(400).json({
          success: false,
          message: '请选择要上传的图片'
        })
      }
      
      const { quality = 80 } = req.query
      const uploadedImages = []
      
      // 确保最终存储目录存在
      const finalDir = path.join(process.cwd(), 'uploads', 'images')
      await ensureUploadDir(finalDir)
      
      for (const file of files) {
        try {
          const filename = `${Date.now()}-${Math.round(Math.random() * 1E9)}.webp`
          const finalPath = path.join(finalDir, filename)
          
          // 处理图片
          await sharp(file.path)
            .webp({ quality: parseInt(quality as string) })
            .toFile(finalPath)
          
          // 删除临时文件
          await fs.unlink(file.path)
          
          uploadedImages.push({
            url: `/uploads/images/${filename}`,
            filename,
            originalName: file.originalname,
            size: (await fs.stat(finalPath)).size
          })
        } catch (error) {
          console.error(`处理图片 ${file.originalname} 失败:`, error)
          // 清理临时文件
          try {
            await fs.unlink(file.path)
          } catch {}
        }
      }
      
      res.json({
        success: true,
        data: uploadedImages,
        message: `成功上传 ${uploadedImages.length} 张图片`
      })
    } catch (error) {
      console.error('批量图片上传失败:', error)
      
      // 清理所有临时文件
      const files = req.files as Express.Multer.File[]
      if (files) {
        for (const file of files) {
          try {
            await fs.unlink(file.path)
          } catch {}
        }
      }
      
      res.status(500).json({
        success: false,
        message: '批量图片上传失败'
      })
    }
  }
)

export default router