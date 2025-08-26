import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import compression from 'compression'
import rateLimit from 'express-rate-limit'
import dotenv from 'dotenv'

// 导入路由
// import productRoutes from './routes/products'
import inquiryRoutes from './routes/inquiries-local'
// import caseRoutes from './routes/cases'
// import authRoutes from './routes/auth'
// import uploadRoutes from './routes/upload'
// import statsRoutes from './routes/stats'

// 导入中间件
import { errorHandler } from './middleware/errorHandler'
import { notFound } from './middleware/notFound'

// 加载环境变量
dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

// 安全中间件
app.use(helmet())
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}))

// 请求限制
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 100, // 限制每个IP 15分钟内最多100个请求
  message: '请求过于频繁，请稍后再试'
})
app.use('/api/', limiter)

// 基础中间件
app.use(compression())
app.use(morgan('combined'))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// 静态文件服务
app.use('/uploads', express.static('uploads'))

// 健康检查
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: '施小雅板材后端API',
    version: '1.0.0'
  })
})

// API路由
// app.use('/api/products', productRoutes)
app.use('/api/inquiries', inquiryRoutes)
// app.use('/api/cases', caseRoutes)
// app.use('/api/auth', authRoutes)
// app.use('/api/upload', uploadRoutes)
// app.use('/api/stats', statsRoutes)

// 错误处理中间件
app.use(notFound)
app.use(errorHandler)

// 启动服务器
app.listen(PORT, () => {
  console.log(`🚀 施小雅板材后端服务启动成功`)
  console.log(`📡 服务地址: http://localhost:${PORT}`)
  console.log(`🏥 健康检查: http://localhost:${PORT}/health`)
  console.log(`📚 API文档: http://localhost:${PORT}/api/docs`)
})

export default app