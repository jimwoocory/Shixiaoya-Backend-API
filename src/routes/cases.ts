import express from 'express'
import { body, query, param } from 'express-validator'
import { PrismaClient } from '@prisma/client'
import { validateRequest } from '../middleware/validateRequest'
import { adminAuth } from '../middleware/auth'
import { cacheMiddleware } from '../middleware/cache'

const router = express.Router()
const prisma = new PrismaClient()

// 获取案例列表 (公开接口)
router.get('/', 
  [
    query('page').optional().isInt({ min: 1 }).withMessage('页码必须是正整数'),
    query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('每页数量必须在1-50之间'),
    query('type').optional().isString().withMessage('项目类型参数格式错误'),
    query('search').optional().isString().withMessage('搜索关键词格式错误')
  ],
  validateRequest,
  cacheMiddleware(600), // 缓存10分钟
  async (req, res) => {
    try {
      const page = parseInt(req.query.page as string) || 1
      const limit = parseInt(req.query.limit as string) || 12
      const projectType = req.query.type as string
      const search = req.query.search as string
      
      const skip = (page - 1) * limit
      
      // 构建查询条件
      const where: any = {
        isActive: true
      }
      
      if (projectType) {
        where.projectType = projectType
      }
      
      if (search) {
        where.OR = [
          { title: { contains: search } },
          { description: { contains: search } },
          { location: { contains: search } }
        ]
      }
      
      const [cases, total] = await Promise.all([
        prisma.case.findMany({
          where,
          orderBy: [
            { sort: 'desc' },
            { createdAt: 'desc' }
          ],
          skip,
          take: limit
        }),
        prisma.case.count({ where })
      ])
      
      res.json({
        success: true,
        data: {
          cases,
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
          }
        }
      })
    } catch (error) {
      console.error('获取案例列表失败:', error)
      res.status(500).json({
        success: false,
        message: '获取案例列表失败'
      })
    }
  }
)

// 获取案例详情 (公开接口)
router.get('/:slug',
  [
    param('slug').isString().notEmpty().withMessage('案例标识不能为空')
  ],
  validateRequest,
  cacheMiddleware(600), // 缓存10分钟
  async (req, res) => {
    try {
      const { slug } = req.params
      
      const caseDetail = await prisma.case.findUnique({
        where: { slug, isActive: true }
      })
      
      if (!caseDetail) {
        return res.status(404).json({
          success: false,
          message: '案例不存在'
        })
      }
      
      res.json({
        success: true,
        data: caseDetail
      })
    } catch (error) {
      console.error('获取案例详情失败:', error)
      res.status(500).json({
        success: false,
        message: '获取案例详情失败'
      })
    }
  }
)

// 创建案例 (管理员接口)
router.post('/',
  adminAuth,
  [
    body('title').isString().isLength({ min: 1, max: 200 }).withMessage('案例标题长度必须在1-200字符之间'),
    body('slug').isString().isLength({ min: 1, max: 200 }).withMessage('案例标识长度必须在1-200字符之间'),
    body('description').isString().notEmpty().withMessage('案例描述不能为空'),
    body('location').isString().isLength({ min: 1, max: 200 }).withMessage('项目地点长度必须在1-200字符之间'),
    body('projectType').isString().notEmpty().withMessage('项目类型不能为空'),
    body('images').isArray().withMessage('图片必须是数组'),
    body('area').optional().isString().withMessage('项目面积必须是字符串'),
    body('materials').optional().isObject().withMessage('使用材料必须是对象'),
    body('clientName').optional().isString().withMessage('客户名称必须是字符串')
  ],
  validateRequest,
  async (req, res) => {
    try {
      const caseData = req.body
      
      // 检查slug是否已存在
      const existingCase = await prisma.case.findUnique({
        where: { slug: caseData.slug }
      })
      
      if (existingCase) {
        return res.status(400).json({
          success: false,
          message: '案例标识已存在'
        })
      }
      
      const newCase = await prisma.case.create({
        data: caseData
      })
      
      res.status(201).json({
        success: true,
        data: newCase,
        message: '案例创建成功'
      })
    } catch (error) {
      console.error('创建案例失败:', error)
      res.status(500).json({
        success: false,
        message: '创建案例失败'
      })
    }
  }
)

export default router