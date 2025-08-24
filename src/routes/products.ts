import express from 'express'
import { body, query, param } from 'express-validator'
import { PrismaClient } from '@prisma/client'
import { validateRequest } from '../middleware/validateRequest'
import { auth, adminAuth } from '../middleware/auth'
import { cacheMiddleware } from '../middleware/cache'

const router = express.Router()
const prisma = new PrismaClient()

// 获取产品列表 (公开接口)
router.get('/', 
  [
    query('page').optional().isInt({ min: 1 }).withMessage('页码必须是正整数'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('每页数量必须在1-100之间'),
    query('category').optional().isString().withMessage('分类参数格式错误'),
    query('search').optional().isString().withMessage('搜索关键词格式错误'),
    query('sort').optional().isIn(['price_asc', 'price_desc', 'created_desc', 'hot']).withMessage('排序参数错误')
  ],
  validateRequest,
  cacheMiddleware(300), // 缓存5分钟
  async (req, res) => {
    try {
      const page = parseInt(req.query.page as string) || 1
      const limit = parseInt(req.query.limit as string) || 12
      const category = req.query.category as string
      const search = req.query.search as string
      const sort = req.query.sort as string || 'created_desc'
      
      const skip = (page - 1) * limit
      
      // 构建查询条件
      const where: any = {
        isActive: true
      }
      
      if (category) {
        where.category = {
          slug: category
        }
      }
      
      if (search) {
        where.OR = [
          { name: { contains: search } },
          { description: { contains: search } }
        ]
      }
      
      // 构建排序条件
      let orderBy: any = { createdAt: 'desc' }
      switch (sort) {
        case 'price_asc':
          orderBy = { price: 'asc' }
          break
        case 'price_desc':
          orderBy = { price: 'desc' }
          break
        case 'hot':
          orderBy = { isHot: 'desc' }
          break
      }
      
      const [products, total] = await Promise.all([
        prisma.product.findMany({
          where,
          include: {
            category: {
              select: { id: true, name: true, slug: true }
            }
          },
          orderBy,
          skip,
          take: limit
        }),
        prisma.product.count({ where })
      ])
      
      res.json({
        success: true,
        data: {
          products,
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
          }
        }
      })
    } catch (error) {
      console.error('获取产品列表失败:', error)
      res.status(500).json({
        success: false,
        message: '获取产品列表失败'
      })
    }
  }
)

// 获取产品详情 (公开接口)
router.get('/:slug',
  [
    param('slug').isString().notEmpty().withMessage('产品标识不能为空')
  ],
  validateRequest,
  cacheMiddleware(600), // 缓存10分钟
  async (req, res) => {
    try {
      const { slug } = req.params
      
      const product = await prisma.product.findUnique({
        where: { slug, isActive: true },
        include: {
          category: {
            select: { id: true, name: true, slug: true }
          }
        }
      })
      
      if (!product) {
        return res.status(404).json({
          success: false,
          message: '产品不存在'
        })
      }
      
      res.json({
        success: true,
        data: product
      })
    } catch (error) {
      console.error('获取产品详情失败:', error)
      res.status(500).json({
        success: false,
        message: '获取产品详情失败'
      })
    }
  }
)

// 创建产品 (管理员接口)
router.post('/',
  adminAuth,
  [
    body('name').isString().isLength({ min: 1, max: 200 }).withMessage('产品名称长度必须在1-200字符之间'),
    body('slug').isString().isLength({ min: 1, max: 200 }).withMessage('产品标识长度必须在1-200字符之间'),
    body('description').optional().isString().withMessage('产品描述必须是字符串'),
    body('price').isDecimal().withMessage('价格必须是有效数字'),
    body('categoryId').isInt().withMessage('分类ID必须是整数'),
    body('images').isArray().withMessage('图片必须是数组'),
    body('specifications').optional().isObject().withMessage('规格参数必须是对象'),
    body('features').optional().isArray().withMessage('产品特性必须是数组')
  ],
  validateRequest,
  async (req, res) => {
    try {
      const productData = req.body
      
      // 检查slug是否已存在
      const existingProduct = await prisma.product.findUnique({
        where: { slug: productData.slug }
      })
      
      if (existingProduct) {
        return res.status(400).json({
          success: false,
          message: '产品标识已存在'
        })
      }
      
      const product = await prisma.product.create({
        data: productData,
        include: {
          category: {
            select: { id: true, name: true, slug: true }
          }
        }
      })
      
      res.status(201).json({
        success: true,
        data: product,
        message: '产品创建成功'
      })
    } catch (error) {
      console.error('创建产品失败:', error)
      res.status(500).json({
        success: false,
        message: '创建产品失败'
      })
    }
  }
)

export default router