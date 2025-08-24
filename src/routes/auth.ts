import express from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { body } from 'express-validator'
import { PrismaClient } from '@prisma/client'
import { validateRequest } from '../middleware/validateRequest'
import { auth } from '../middleware/auth'

const router = express.Router()
const prisma = new PrismaClient()

// 用户登录
router.post('/login',
  [
    body('username').isString().notEmpty().withMessage('用户名不能为空'),
    body('password').isString().isLength({ min: 6 }).withMessage('密码长度至少6位')
  ],
  validateRequest,
  async (req, res) => {
    try {
      const { username, password } = req.body
      
      // 查找用户
      const user = await prisma.user.findUnique({
        where: { username, isActive: true }
      })
      
      if (!user) {
        return res.status(401).json({
          success: false,
          message: '用户名或密码错误'
        })
      }
      
      // 验证密码
      const isValidPassword = await bcrypt.compare(password, user.password)
      if (!isValidPassword) {
        return res.status(401).json({
          success: false,
          message: '用户名或密码错误'
        })
      }
      
      // 生成JWT令牌
      const token = jwt.sign(
        { userId: user.id, username: user.username },
        process.env.JWT_SECRET!,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
      )
      
      // 更新最后登录时间
      await prisma.user.update({
        where: { id: user.id },
        data: { lastLogin: new Date() }
      })
      
      res.json({
        success: true,
        data: {
          token,
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            name: user.name,
            role: user.role
          }
        },
        message: '登录成功'
      })
    } catch (error) {
      console.error('登录失败:', error)
      res.status(500).json({
        success: false,
        message: '登录失败'
      })
    }
  }
)

// 获取当前用户信息
router.get('/me', auth, async (req: any, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
        role: true,
        avatar: true,
        createdAt: true,
        lastLogin: true
      }
    })
    
    res.json({
      success: true,
      data: user
    })
  } catch (error) {
    console.error('获取用户信息失败:', error)
    res.status(500).json({
      success: false,
      message: '获取用户信息失败'
    })
  }
})

// 修改密码
router.put('/password', 
  auth,
  [
    body('currentPassword').isString().notEmpty().withMessage('当前密码不能为空'),
    body('newPassword').isString().isLength({ min: 6 }).withMessage('新密码长度至少6位')
  ],
  validateRequest,
  async (req: any, res) => {
    try {
      const { currentPassword, newPassword } = req.body
      
      const user = await prisma.user.findUnique({
        where: { id: req.user.id }
      })
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: '用户不存在'
        })
      }
      
      // 验证当前密码
      const isValidPassword = await bcrypt.compare(currentPassword, user.password)
      if (!isValidPassword) {
        return res.status(400).json({
          success: false,
          message: '当前密码错误'
        })
      }
      
      // 加密新密码
      const hashedPassword = await bcrypt.hash(newPassword, 12)
      
      await prisma.user.update({
        where: { id: req.user.id },
        data: { password: hashedPassword }
      })
      
      res.json({
        success: true,
        message: '密码修改成功'
      })
    } catch (error) {
      console.error('修改密码失败:', error)
      res.status(500).json({
        success: false,
        message: '修改密码失败'
      })
    }
  }
)

export default router