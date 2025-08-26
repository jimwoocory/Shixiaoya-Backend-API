import express from 'express'
import { Request, Response } from 'express'
import { body, query, param } from 'express-validator'
import { PrismaClient } from '@prisma/client'
import { validateRequest } from '../middleware/validateRequest'
import { adminAuth } from '../middleware/auth'
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
  cacheMiddleware(300),
  async (req: Request, res: Response) => {
    try {
      const page = parseInt(req.query.page as string) || 1
      const limit = parseInt(req.query.limit as string) || 12
      const category = req.query.category as string
      const search = req.query.search as string
      const sort = req.query.sort as string || 'created_desc'
      
      const skip = (page - 1) * limit
      
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

export default router