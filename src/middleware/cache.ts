import { Request, Response, NextFunction } from 'express'
import Redis from 'redis'

let redisClient: any = null

// 初始化Redis客户端
const initRedis = async () => {
  if (!redisClient && process.env.REDIS_URL) {
    try {
      redisClient = Redis.createClient({
        url: process.env.REDIS_URL
      })
      
      redisClient.on('error', (err: any) => {
        console.error('Redis连接错误:', err)
        redisClient = null
      })
      
      await redisClient.connect()
      console.log('Redis连接成功')
    } catch (error) {
      console.error('Redis初始化失败:', error)
      redisClient = null
    }
  }
}

// 缓存中间件
export const cacheMiddleware = (duration: number = 300) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // 如果Redis不可用，直接跳过缓存
    if (!redisClient) {
      await initRedis()
      if (!redisClient) {
        return next()
      }
    }
    
    const key = `cache:${req.originalUrl}`
    
    try {
      const cachedData = await redisClient.get(key)
      
      if (cachedData) {
        return res.json(JSON.parse(cachedData))
      }
      
      // 重写res.json方法以缓存响应
      const originalJson = res.json
      res.json = function(data: any) {
        // 只缓存成功的响应
        if (data.success !== false) {
          redisClient.setEx(key, duration, JSON.stringify(data)).catch((err: any) => {
            console.error('缓存设置失败:', err)
          })
        }
        return originalJson.call(this, data)
      }
      
      next()
    } catch (error) {
      console.error('缓存中间件错误:', error)
      next()
    }
  }
}

// 清除缓存
export const clearCache = async (pattern: string = '*') => {
  if (!redisClient) return
  
  try {
    const keys = await redisClient.keys(`cache:${pattern}`)
    if (keys.length > 0) {
      await redisClient.del(keys)
    }
  } catch (error) {
    console.error('清除缓存失败:', error)
  }
}