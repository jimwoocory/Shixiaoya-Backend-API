import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

interface AuthRequest extends Request {
  user?: any
}

// JWT认证中间件
export const auth = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '')
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: '访问令牌缺失'
      })
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId, isActive: true },
      select: { id: true, username: true, email: true, name: true, role: true }
    })
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: '用户不存在或已被禁用'
      })
    }
    
    req.user = user
    next()
  } catch (error) {
    res.status(401).json({
      success: false,
      message: '访问令牌无效'
    })
  }
}

// 管理员权限中间件
export const adminAuth = async (req: AuthRequest, res: Response, next: NextFunction) => {
  await auth(req, res, () => {
    if (req.user && req.user.role === 'ADMIN') {
      next()
    } else {
      res.status(403).json({
        success: false,
        message: '权限不足'
      })
    }
  })
}