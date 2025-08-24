import { Request, Response, NextFunction } from 'express'

export const errorHandler = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('服务器错误:', error)
  
  // Prisma错误处理
  if (error.code === 'P2002') {
    return res.status(400).json({
      success: false,
      message: '数据已存在，请检查唯一性约束'
    })
  }
  
  if (error.code === 'P2025') {
    return res.status(404).json({
      success: false,
      message: '记录不存在'
    })
  }
  
  // JWT错误处理
  if (error.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: '访问令牌无效'
    })
  }
  
  if (error.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: '访问令牌已过期'
    })
  }
  
  // 默认错误响应
  res.status(error.status || 500).json({
    success: false,
    message: error.message || '服务器内部错误',
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  })
}

export const notFound = (req: Request, res: Response, next: NextFunction) => {
  res.status(404).json({
    success: false,
    message: `路由 ${req.originalUrl} 不存在`
  })
}