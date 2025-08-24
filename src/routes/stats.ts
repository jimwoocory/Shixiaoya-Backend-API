import express from 'express'
import { PrismaClient } from '@prisma/client'
import { adminAuth } from '../middleware/auth'

const router = express.Router()
const prisma = new PrismaClient()

// 获取统计数据 (管理员接口)
router.get('/dashboard', adminAuth, async (req, res) => {
  try {
    const [
      totalProducts,
      totalInquiries,
      totalCases,
      pendingInquiries,
      recentInquiries,
      popularProducts
    ] = await Promise.all([
      // 产品总数
      prisma.product.count({ where: { isActive: true } }),
      
      // 询价总数
      prisma.inquiry.count(),
      
      // 案例总数
      prisma.case.count({ where: { isActive: true } }),
      
      // 待处理询价数
      prisma.inquiry.count({ where: { status: 'PENDING' } }),
      
      // 最近7天询价
      prisma.inquiry.findMany({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: {
          id: true,
          name: true,
          phone: true,
          message: true,
          status: true,
          createdAt: true
        }
      }),
      
      // 热门产品 (基于询价次数)
      prisma.product.findMany({
        where: { isActive: true },
        include: {
          _count: {
            select: { inquiries: true }
          }
        },
        orderBy: {
          inquiries: {
            _count: 'desc'
          }
        },
        take: 5
      })
    ])
    
    res.json({
      success: true,
      data: {
        overview: {
          totalProducts,
          totalInquiries,
          totalCases,
          pendingInquiries
        },
        recentInquiries,
        popularProducts: popularProducts.map(product => ({
          id: product.id,
          name: product.name,
          price: product.price,
          inquiryCount: product._count.inquiries
        }))
      }
    })
  } catch (error) {
    console.error('获取统计数据失败:', error)
    res.status(500).json({
      success: false,
      message: '获取统计数据失败'
    })
  }
})

// 获取询价趋势 (管理员接口)
router.get('/inquiry-trends', adminAuth, async (req, res) => {
  try {
    const days = parseInt(req.query.days as string) || 30
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
    
    const inquiries = await prisma.inquiry.findMany({
      where: {
        createdAt: { gte: startDate }
      },
      select: {
        createdAt: true,
        status: true
      }
    })
    
    // 按日期分组统计
    const trends: { [key: string]: { total: number; pending: number; replied: number } } = {}
    
    inquiries.forEach(inquiry => {
      const date = inquiry.createdAt.toISOString().split('T')[0]
      if (!trends[date]) {
        trends[date] = { total: 0, pending: 0, replied: 0 }
      }
      trends[date].total++
      if (inquiry.status === 'PENDING') trends[date].pending++
      if (inquiry.status === 'REPLIED') trends[date].replied++
    })
    
    const trendData = Object.entries(trends).map(([date, data]) => ({
      date,
      ...data
    })).sort((a, b) => a.date.localeCompare(b.date))
    
    res.json({
      success: true,
      data: trendData
    })
  } catch (error) {
    console.error('获取询价趋势失败:', error)
    res.status(500).json({
      success: false,
      message: '获取询价趋势失败'
    })
  }
})

// 记录页面访问 (公开接口)
router.post('/visit', async (req, res) => {
  try {
    const { path, userAgent, referer } = req.body
    const ip = req.ip || req.connection.remoteAddress || 'unknown'
    
    await prisma.analytics.create({
      data: {
        path: path || req.path,
        userAgent,
        ip,
        referer
      }
    })
    
    res.json({
      success: true,
      message: '访问记录成功'
    })
  } catch (error) {
    console.error('记录访问失败:', error)
    res.status(500).json({
      success: false,
      message: '记录访问失败'
    })
  }
})

export default router