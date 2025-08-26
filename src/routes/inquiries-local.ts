import express, { Request, Response } from 'express';
import { body, query, param, validationResult } from 'express-validator';
import { auth } from '../middleware/auth';
import fs from 'fs';
import path from 'path';

const router = express.Router();

// 本地存储路径
const DATA_DIR = path.join(__dirname, '../../data');
const INQUIRIES_FILE = path.join(DATA_DIR, 'inquiries.json');

// 确保数据目录存在
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// 如果文件不存在，创建空的询价数据文件
if (!fs.existsSync(INQUIRIES_FILE)) {
  fs.writeFileSync(INQUIRIES_FILE, JSON.stringify({ inquiries: [] }), 'utf8');
}

// 定义询价和询价产品的接口
interface InquiryProduct {
  id: string;
  inquiryId: string;
  name: string;
  quantity: number;
  specifications?: string;
  requirements?: string;
}

interface Inquiry {
  id: string;
  inquiryNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  company?: string;
  productName: string;
  quantity: number;
  requirements: string;
  urgency: 'URGENT' | 'NORMAL' | 'FLEXIBLE';
  status: 'PENDING' | 'PROCESSING' | 'QUOTED' | 'COMPLETED' | 'CANCELLED';
  quotedPrice?: string;
  notes?: string;
  adminReply?: string;
  repliedAt?: string;
  createdAt: string;
  updatedAt: string;
  [key: string]: any; // 索引签名，允许动态访问属性
}

// 读取询价数据
function readInquiries(): Inquiry[] {
  try {
    const data = fs.readFileSync(INQUIRIES_FILE, 'utf8');
    return JSON.parse(data).inquiries || [];
  } catch (error) {
    console.error('读取询价数据失败:', error);
    return [];
  }
}

// 写入询价数据
function writeInquiries(inquiries: Inquiry[]) {
  try {
    fs.writeFileSync(INQUIRIES_FILE, JSON.stringify({ inquiries }, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('写入询价数据失败:', error);
    return false;
  }
}

// 生成询价单号
function generateInquiryNumber(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const timestamp = now.getTime().toString().slice(-6);
  return `INQ-${year}${month}${day}-${timestamp}`;
}

// 生成唯一ID
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

// 获取询价列表 (管理员)
router.get('/', 
  auth,
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('status').optional().isIn(['PENDING', 'PROCESSING', 'QUOTED', 'COMPLETED', 'CANCELLED']),
    query('urgency').optional().isIn(['URGENT', 'NORMAL', 'FLEXIBLE']),
    query('search').optional().isString().trim(),
    query('sortBy').optional().isIn(['createdAt', 'updatedAt', 'customerName', 'status']),
    query('sortOrder').optional().isIn(['asc', 'desc'])
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          success: false, 
          message: '参数验证失败', 
          errors: errors.array() 
        });
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const status = req.query.status as string;
      const urgency = req.query.urgency as string;
      const search = req.query.search as string;
      const sortBy = (req.query.sortBy as string) || 'createdAt';
      const sortOrder = (req.query.sortOrder as string) || 'desc';

      let inquiries = readInquiries();
      
      // 过滤
      if (status) {
        inquiries = inquiries.filter((i: Inquiry) => i.status === status);
      }
      
      if (urgency) {
        inquiries = inquiries.filter((i: Inquiry) => i.urgency === urgency);
      }
      
      if (search) {
        const searchLower = search.toLowerCase();
        inquiries = inquiries.filter((i: Inquiry) => 
          i.customerName?.toLowerCase().includes(searchLower) ||
          i.company?.toLowerCase().includes(searchLower) ||
          i.productName?.toLowerCase().includes(searchLower) ||
          i.inquiryNumber?.toLowerCase().includes(searchLower) ||
          i.customerPhone?.includes(search) ||
          i.customerEmail?.toLowerCase().includes(searchLower)
        );
      }
      
      // 排序
      inquiries.sort((a: Inquiry, b: Inquiry) => {
        if (sortOrder === 'asc') {
          return a[sortBy] > b[sortBy] ? 1 : -1;
        } else {
          return a[sortBy] < b[sortBy] ? 1 : -1;
        }
      });
      
      // 分页
      const total = inquiries.length;
      const skip = (page - 1) * limit;
      inquiries = inquiries.slice(skip, skip + limit);

      // 统计数据
      const allInquiries = readInquiries();
      const statusStats = {
        total: allInquiries.length,
        pending: allInquiries.filter((i: Inquiry) => i.status === 'PENDING').length,
        processing: allInquiries.filter((i: Inquiry) => i.status === 'PROCESSING').length,
        quoted: allInquiries.filter((i: Inquiry) => i.status === 'QUOTED').length,
        completed: allInquiries.filter((i: Inquiry) => i.status === 'COMPLETED').length,
        cancelled: allInquiries.filter((i: Inquiry) => i.status === 'CANCELLED').length
      };

      res.json({
        success: true,
        data: {
          inquiries,
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
          },
          stats: statusStats
        }
      });
    } catch (error: any) {
      console.error('获取询价列表失败:', error);
      res.status(500).json({ 
        success: false, 
        message: '获取询价列表失败' 
      });
    }
  }
);

// 获取单个询价详情
router.get('/:id',
  auth,
  [
    param('id').isString().notEmpty()
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          success: false, 
          message: '参数验证失败', 
          errors: errors.array() 
        });
      }

      const inquiries = readInquiries();
      const inquiry = inquiries.find((i: Inquiry) => i.id === req.params.id);

      if (!inquiry) {
        return res.status(404).json({
          success: false,
          message: '询价记录不存在'
        });
      }

      res.json({
        success: true,
        data: inquiry
      });
    } catch (error: any) {
      console.error('获取询价详情失败:', error);
      res.status(500).json({ 
        success: false, 
        message: '获取询价详情失败' 
      });
    }
  }
);

// 创建询价 (公开接口)
router.post('/',
  [
    body('customerName').notEmpty().withMessage('客户姓名不能为空').isLength({ max: 100 }),
    body('customerPhone').notEmpty().withMessage('联系电话不能为空'),
    body('customerEmail').optional().isEmail().withMessage('邮箱格式不正确'),
    body('company').optional().isLength({ max: 200 }),
    body('productName').notEmpty().withMessage('产品名称不能为空').isLength({ max: 200 }),
    body('quantity').isInt({ min: 1 }).withMessage('数量必须大于0'),
    body('requirements').notEmpty().withMessage('需求描述不能为空'),
    body('urgency').optional().isIn(['URGENT', 'NORMAL', 'FLEXIBLE'])
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          success: false, 
          message: '参数验证失败', 
          errors: errors.array() 
        });
      }

      const {
        customerName,
        customerPhone,
        customerEmail,
        company,
        productName,
        quantity,
        requirements,
        urgency = 'NORMAL'
      } = req.body;

      // 生成询价单号
      const inquiryNumber = generateInquiryNumber();
      const now = new Date();

      const inquiry: Inquiry = {
        id: generateId(),
        inquiryNumber,
        customerName,
        customerPhone,
        customerEmail,
        company,
        productName,
        quantity,
        requirements,
        urgency: urgency as 'URGENT' | 'NORMAL' | 'FLEXIBLE',
        status: 'PENDING' as 'PENDING',
        createdAt: now.toISOString(),
        updatedAt: now.toISOString()
      };

      const inquiries = readInquiries();
      inquiries.push(inquiry);
      
      if (writeInquiries(inquiries)) {
        res.status(201).json({
          success: true,
          message: '询价提交成功',
          data: inquiry
        });
      } else {
        res.status(500).json({ 
          success: false, 
          message: '询价提交失败' 
        });
      }
    } catch (error: any) {
      console.error('创建询价失败:', error);
      res.status(500).json({ 
        success: false, 
        message: '询价提交失败' 
      });
    }
  }
);

// 更新询价状态
router.patch('/:id/status',
  auth,
  [
    param('id').isString().notEmpty(),
    body('status').isIn(['PENDING', 'PROCESSING', 'QUOTED', 'COMPLETED', 'CANCELLED']),
    body('notes').optional().isString(),
    body('quotedPrice').optional().isString(),
    body('adminReply').optional().isString()
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          success: false, 
          message: '参数验证失败', 
          errors: errors.array() 
        });
      }

      const { status, notes, quotedPrice, adminReply } = req.body;
      const inquiries = readInquiries();
      const index = inquiries.findIndex((i: Inquiry) => i.id === req.params.id);

      if (index === -1) {
        return res.status(404).json({
          success: false,
          message: '询价记录不存在'
        });
      }

      const inquiry = inquiries[index];
      inquiry.status = status;
      inquiry.updatedAt = new Date().toISOString();
      
      if (notes !== undefined) inquiry.notes = notes;
      if (quotedPrice !== undefined) inquiry.quotedPrice = quotedPrice;
      if (adminReply !== undefined) {
        inquiry.adminReply = adminReply;
        inquiry.repliedAt = new Date().toISOString();
      }

      if (writeInquiries(inquiries)) {
        res.json({
          success: true,
          message: '询价状态更新成功',
          data: inquiry
        });
      } else {
        res.status(500).json({ 
          success: false, 
          message: '更新询价状态失败' 
        });
      }
    } catch (error: any) {
      console.error('更新询价状态失败:', error);
      res.status(500).json({ 
        success: false, 
        message: '更新询价状态失败' 
      });
    }
  }
);

// 更新询价信息
router.put('/:id',
  auth,
  [
    param('id').isString().notEmpty(),
    body('customerName').notEmpty().withMessage('客户姓名不能为空').isLength({ max: 100 }),
    body('customerPhone').notEmpty().withMessage('联系电话不能为空'),
    body('customerEmail').optional().isEmail().withMessage('邮箱格式不正确'),
    body('company').optional().isLength({ max: 200 }),
    body('productName').notEmpty().withMessage('产品名称不能为空').isLength({ max: 200 }),
    body('quantity').isInt({ min: 1 }).withMessage('数量必须大于0'),
    body('requirements').notEmpty().withMessage('需求描述不能为空'),
    body('urgency').optional().isIn(['URGENT', 'NORMAL', 'FLEXIBLE']),
    body('status').optional().isIn(['PENDING', 'PROCESSING', 'QUOTED', 'COMPLETED', 'CANCELLED']),
    body('quotedPrice').optional().isString(),
    body('notes').optional().isString()
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          success: false, 
          message: '参数验证失败', 
          errors: errors.array() 
        });
      }

      const {
        customerName,
        customerPhone,
        customerEmail,
        company,
        productName,
        quantity,
        requirements,
        urgency,
        status,
        quotedPrice,
        notes
      } = req.body;

      const inquiries = readInquiries();
      const index = inquiries.findIndex((i: Inquiry) => i.id === req.params.id);

      if (index === -1) {
        return res.status(404).json({
          success: false,
          message: '询价记录不存在'
        });
      }

      const inquiry = inquiries[index];
      inquiry.customerName = customerName;
      inquiry.customerPhone = customerPhone;
      inquiry.customerEmail = customerEmail;
      inquiry.company = company;
      inquiry.productName = productName;
      inquiry.quantity = quantity;
      inquiry.requirements = requirements;
      inquiry.updatedAt = new Date().toISOString();

      if (urgency !== undefined) inquiry.urgency = urgency;
      if (status !== undefined) inquiry.status = status;
      if (quotedPrice !== undefined) inquiry.quotedPrice = quotedPrice;
      if (notes !== undefined) inquiry.notes = notes;

      if (writeInquiries(inquiries)) {
        res.json({
          success: true,
          message: '询价信息更新成功',
          data: inquiry
        });
      } else {
        res.status(500).json({ 
          success: false, 
          message: '更新询价信息失败' 
        });
      }
    } catch (error: any) {
      console.error('更新询价信息失败:', error);
      res.status(500).json({ 
        success: false, 
        message: '更新询价信息失败' 
      });
    }
  }
);

// 删除询价
router.delete('/:id',
  auth,
  [
    param('id').isString().notEmpty()
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          success: false, 
          message: '参数验证失败', 
          errors: errors.array() 
        });
      }

      const inquiries = readInquiries();
      const index = inquiries.findIndex((i: Inquiry) => i.id === req.params.id);

      if (index === -1) {
        return res.status(404).json({
          success: false,
          message: '询价记录不存在'
        });
      }

      inquiries.splice(index, 1);

      if (writeInquiries(inquiries)) {
        res.json({
          success: true,
          message: '询价记录删除成功'
        });
      } else {
        res.status(500).json({ 
          success: false, 
          message: '删除询价失败' 
        });
      }
    } catch (error: any) {
      console.error('删除询价失败:', error);
      res.status(500).json({ 
        success: false, 
        message: '删除询价失败' 
      });
    }
  }
);

// 批量操作询价
router.post('/batch',
  auth,
  [
    body('action').isIn(['delete', 'updateStatus']),
    body('ids').isArray().notEmpty(),
    body('ids.*').isString(),
    body('status').optional().isIn(['PENDING', 'PROCESSING', 'QUOTED', 'COMPLETED', 'CANCELLED'])
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          success: false, 
          message: '参数验证失败', 
          errors: errors.array() 
        });
      }

      const { action, ids, status } = req.body;
      const inquiries = readInquiries();

      if (action === 'delete') {
        const newInquiries = inquiries.filter((i: Inquiry) => !ids.includes(i.id));
        
        if (writeInquiries(newInquiries)) {
          res.json({
            success: true,
            message: `成功删除 ${ids.length} 条询价记录`
          });
        } else {
          res.status(500).json({ 
            success: false, 
            message: '批量删除失败' 
          });
        }
      } else if (action === 'updateStatus' && status) {
        const now = new Date().toISOString();
        
        inquiries.forEach((i: Inquiry) => {
          if (ids.includes(i.id)) {
            i.status = status;
            i.updatedAt = now;
          }
        });
        
        if (writeInquiries(inquiries)) {
          res.json({
            success: true,
            message: `成功更新 ${ids.length} 条询价记录状态`
          });
        } else {
          res.status(500).json({ 
            success: false, 
            message: '批量更新状态失败' 
          });
        }
      } else {
        res.status(400).json({
          success: false,
          message: '无效的批量操作'
        });
      }
    } catch (error: any) {
      console.error('批量操作失败:', error);
      res.status(500).json({ 
        success: false, 
        message: '批量操作失败' 
      });
    }
  }
);

// 导出询价数据
router.get('/export/csv',
  auth,
  [
    query('status').optional().isIn(['PENDING', 'PROCESSING', 'QUOTED', 'COMPLETED', 'CANCELLED']),
    query('startDate').optional().isISO8601(),
    query('endDate').optional().isISO8601()
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          success: false, 
          message: '参数验证失败', 
          errors: errors.array() 
        });
      }

      const { status, startDate, endDate } = req.query;
      let inquiries = readInquiries();
      
      if (status) {
        inquiries = inquiries.filter((i: Inquiry) => i.status === status);
      }
      
      if (startDate || endDate) {
        inquiries = inquiries.filter((i: Inquiry) => {
          const createdAt = new Date(i.createdAt);
          if (startDate && createdAt < new Date(startDate as string)) return false;
          if (endDate && createdAt > new Date(endDate as string)) return false;
          return true;
        });
      }

      // 生成CSV内容
      const csvHeader = '询价单号,客户姓名,联系电话,邮箱,公司,产品名称,数量,需求描述,紧急程度,状态,报价金额,创建时间,更新时间\n';
      const csvRows = inquiries.map((inquiry: Inquiry) => {
        return [
          inquiry.inquiryNumber,
          inquiry.customerName,
          inquiry.customerPhone,
          inquiry.customerEmail || '',
          inquiry.company || '',
          inquiry.productName,
          inquiry.quantity,
          `"${inquiry.requirements.replace(/"/g, '""')}"`,
          inquiry.urgency,
          inquiry.status,
          inquiry.quotedPrice || '',
          inquiry.createdAt,
          inquiry.updatedAt
        ].join(',');
      }).join('\n');

      const csvContent = csvHeader + csvRows;

      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="inquiries_${new Date().toISOString().split('T')[0]}.csv"`);
      res.send('\uFEFF' + csvContent); // 添加BOM以支持中文
    } catch (error: any) {
      console.error('导出询价数据失败:', error);
      res.status(500).json({ 
        success: false, 
        message: '导出询价数据失败' 
      });
    }
  }
);

export default router;