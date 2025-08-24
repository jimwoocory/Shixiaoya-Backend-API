import express from 'express'
import { body, query, param } from 'express-validator'
import { PrismaClient } from '@prisma/client'
import { validateRequest } from '../middleware/validateRequest'
import { adminAuth } from '../middleware/auth'
import { sendInquiryNotification } from '../services/emailService'

const router = express.Router()
const prisma = new PrismaClient()

// 提交询价 (公开接口)
router.post('/',
  [
    body('name').isString().isLength({ min: 1, max: 100 }).withMessage('姓名长度必须在1-100字符之间'),
    body('phone').isMobilePhone('zh-CN').withMessage('请输入有效的手机号码'),
    body('email').optional().isEmail().withMessage('请输入有效的邮箱地址'),
    body('company').optional().isString().isLength({ max: 200 }).withMessage('公司名称不能超过200字符'),
    body('message').isString().isLength({ min: 1, max: 1000 }).withMessage('留言内容长度必须在1-1000字符之间'),
    body('products').optional().isArray().withMessage('产品列表必须是数组'),
    body('products.*.productId').optional().isInt().withMessage('产品ID必须是整数'),
    body('products.*.quantity').optional().isInt({ min: 1 }).withMessage('数量必须是正整数')
  ],
  validateRequest,
  async (req, res) => {
    try {
      const { name, phone, email, company, message, products = [] } = req.body
      
      // 创建询价记录
      const inquiry = await prisma.inquiry.create({
        data: {
          name,
          phone,
          email,
          company,
          message,
          products: {
            create: products.map((p: any) => ({
              productId: p.productId,
              quantity: p.quantity || 1
            }))
          }
        },
        include: {
          products: {
            include: {
              product: {
                select: { id: true, name: true, price: true }
              }
            }
          }
        }
      })
      
      // 发送邮件通知
      try {
        await sendInquiryNotification(inquiry)
      } catch (emailError) {
        console.error('发送邮件通知失败:', emailError)
        // 邮件发送失败不影响询价提交
      }
      
      res.status(201).json({
        success: true,
        data: inquiry,
        message: '询价提交成功，我们会尽快与您联系'
      })
    } catch (error) {
      console.error('提交询价失败:', error)
      res.status(500).json({
        success: false,
        message: '提交询价失败，请稍后重试'
      })
    }
  }
)

// 获取询价列表 (管理员接口)
router.get('/',
  adminAuth,
  [
    query('page').optional().isInt({ min: 1 }).withMessage('页码必须是正整数'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('每页数量必须在1-100之间'),
    query('status').optional().isIn(['PENDING', 'REPLIED', 'CLOSED']).withMessage('状态参数错误'),
    query('search').optional().isString().withMessage('搜索关键词格式错误')
  ],
  validateRequest,
  async (req, res) => {
    try {
      const page = parseInt(req.query.page as string) || 1
      const limit = parseInt(req.query.limit as string) || 20
      const status = req.query.status as string
      const search = req.query.search as string
      
      const skip = (page - 1) * limit
      
      // 构建查询条件
      const where: any = {}
      
      if (status) {
        where.status = status
      }
      
      if (search) {
        where.OR = [
          { name: { contains: search } },
          { phone: { contains: search } },
          { company: { contains: search } },
          { message: { contains: search } }
        ]
      }
      
      const [inquiries, total] = await Promise.all([
        prisma.inquiry.findMany({
          where,
          include: {
            products: {
              include: {
                product: {
                  select: { id: true, name: true, price: true }
                }
              }
            }
          },
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit
        }),
        prisma.inquiry.count({ where })
      ])
      
      res.json({
        success: true,
        data: {
          inquiries,
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
          }
        }
      })
    } catch (error) {
      console.error('获取询价列表失败:', error)
      res.status(500).json({
        success: false,
        message: '获取询价列表失败'
      })
    }
  }
)

// 回复询价 (管理员接口)
router.put('/:id/reply',
  adminAuth,
  [
    param('id').isInt().withMessage('询价ID必须是整数'),
    body('adminReply').isString().isLength({ min: 1, max: 2000 }).withMessage('回复内容长度必须在1-2000字符之间')
  ],
  validateRequest,
  async (req, res) => {
    try {
      const inquiryId = parseInt(req.params.id)
      const { adminReply } = req.body
      
      const inquiry = await prisma.inquiry.update({
        where: { id: inquiryId },
        data: {
          adminReply,
          status: 'REPLIED',
          repliedAt: new Date()
        },
        include: {
          products: {
            include: {
              product: {
                select: { id: true, name: true, price: true }
              }
            }
          }
        }
      })
      
      res.json({
        success: true,
        data: inquiry,
        message: '回复成功'
      })
    } catch (error) {
      console.error('回复询价失败:', error)
      res.status(500).json({
        success: false,
        message: '回复询价失败'
      })
    }
  }
)

export default router