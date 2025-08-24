# 施小雅板材后端API系统

> 专业环保板材供应商后端服务 - 现代化RESTful API

![Node.js](https://img.shields.io/badge/Node.js-18+-green)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Express](https://img.shields.io/badge/Express-4-lightgrey)
![Prisma](https://img.shields.io/badge/Prisma-5-blue)
![MySQL](https://img.shields.io/badge/MySQL-8-orange)

## 📖 项目简介

施小雅板材后端API系统是为广西柳州施小雅板材公司开发的现代化后端服务，提供完整的产品管理、询价处理、案例展示、用户认证等功能，支持前端H5网站和未来的管理后台。

## ✨ 主要特性

- 🚀 **现代化架构** - Node.js + TypeScript + Express + Prisma
- 🔐 **安全认证** - JWT身份验证 + 权限控制
- 📊 **数据管理** - MySQL数据库 + Redis缓存
- 📧 **邮件服务** - 自动询价通知和回复
- 📁 **文件上传** - 图片上传 + 自动压缩优化
- 📈 **数据统计** - 访问统计 + 业务数据分析
- 🛡️ **安全防护** - 请求限制 + 数据验证
- ⚡ **高性能** - Redis缓存 + 数据库优化

## 🏗️ 技术栈

### 后端框架
- **Node.js 18+** - JavaScript运行时环境
- **Express 4** - Web应用框架
- **TypeScript 5** - 类型安全的JavaScript

### 数据库
- **MySQL 8** - 主数据库
- **Prisma 5** - 现代化ORM
- **Redis 6+** - 缓存和会话存储

### 安全和工具
- **JWT** - 身份认证
- **bcryptjs** - 密码加密
- **express-validator** - 数据验证
- **helmet** - 安全头设置
- **express-rate-limit** - 请求限制

### 文件处理
- **multer** - 文件上传
- **sharp** - 图片处理和压缩
- **nodemailer** - 邮件发送

## 📁 项目结构

```
shixiaoya-backend/
├── prisma/                 # 数据库相关
│   ├── schema.prisma       # 数据库模型定义
│   └── seed.ts            # 初始数据脚本
├── src/
│   ├── middleware/         # 中间件
│   │   ├── auth.ts        # 身份认证
│   │   ├── cache.ts       # 缓存处理
│   │   ├── errorHandler.ts # 错误处理
│   │   ├── notFound.ts    # 404处理
│   │   └── validateRequest.ts # 请求验证
│   ├── routes/            # 路由控制器
│   │   ├── auth.ts        # 认证相关
│   │   ├── products.ts    # 产品管理
│   │   ├── inquiries.ts   # 询价管理
│   │   ├── cases.ts       # 案例管理
│   │   ├── upload.ts      # 文件上传
│   │   └── stats.ts       # 统计数据
│   ├── services/          # 业务服务
│   │   └── emailService.ts # 邮件服务
│   └── server.ts          # 应用入口
├── uploads/               # 文件上传目录
├── .env.example          # 环境变量示例
├── package.json          # 项目依赖
├── tsconfig.json         # TypeScript配置
└── README.md            # 项目文档
```

## 🚀 快速开始

### 环境要求

- Node.js >= 18.0.0
- MySQL >= 8.0
- Redis >= 6.0 (可选，用于缓存)

### 安装步骤

1. **克隆项目**
```bash
git clone <repository-url>
cd shixiaoya-backend
```

2. **安装依赖**
```bash
npm install
```

3. **配置环境变量**
```bash
cp .env.example .env
# 编辑 .env 文件，配置数据库连接等信息
```

4. **数据库设置**
```bash
# 生成Prisma客户端
npm run db:generate

# 运行数据库迁移
npm run db:migrate

# 初始化数据
npm run db:seed
```

5. **启动开发服务器**
```bash
npm run dev
```

服务器将在 `http://localhost:3001` 启动

## 📋 API接口文档

### 认证接口
- `POST /api/auth/login` - 用户登录
- `GET /api/auth/me` - 获取当前用户信息
- `PUT /api/auth/password` - 修改密码

### 产品接口
- `GET /api/products` - 获取产品列表
- `GET /api/products/:slug` - 获取产品详情
- `POST /api/products` - 创建产品 (管理员)

### 询价接口
- `POST /api/inquiries` - 提交询价
- `GET /api/inquiries` - 获取询价列表 (管理员)
- `PUT /api/inquiries/:id/reply` - 回复询价 (管理员)

### 案例接口
- `GET /api/cases` - 获取案例列表
- `GET /api/cases/:slug` - 获取案例详情
- `POST /api/cases` - 创建案例 (管理员)

### 文件上传接口
- `POST /api/upload/image` - 单图片上传 (管理员)
- `POST /api/upload/images` - 批量图片上传 (管理员)

### 统计接口
- `GET /api/stats/dashboard` - 获取仪表盘数据 (管理员)
- `GET /api/stats/inquiry-trends` - 获取询价趋势 (管理员)
- `POST /api/stats/visit` - 记录页面访问

## 🔧 环境变量配置

```env
# 数据库配置
DATABASE_URL="mysql://username:password@localhost:3306/shixiaoya_db"

# Redis配置 (可选)
REDIS_URL="redis://localhost:6379"

# JWT配置
JWT_SECRET="your-super-secret-jwt-key-here"
JWT_EXPIRES_IN="7d"

# 服务器配置
PORT=3001
NODE_ENV=development
FRONTEND_URL="http://localhost:5173"

# 邮件配置
SMTP_HOST="smtp.qq.com"
SMTP_PORT=587
SMTP_USER="your-email@qq.com"
SMTP_PASS="your-email-password"
ADMIN_EMAIL="admin@shixiaoya.com"

# 文件上传配置
UPLOAD_DIR="uploads"
MAX_FILE_SIZE=10485760  # 10MB

# 公司信息
COMPANY_NAME="施小雅板材"
COMPANY_ADDRESS="广西柳州市鹿寨县鹿寨镇建中东路116号办公楼"
COMPANY_PHONE="400-XXX-XXXX"
COMPANY_EMAIL="info@shixiaoya.com"
```

## 📊 数据库模型

### 核心表结构
- **products** - 产品信息
- **categories** - 产品分类
- **inquiries** - 客户询价
- **cases** - 客户案例
- **users** - 系统用户
- **settings** - 系统配置
- **analytics** - 访问统计

### 默认数据
运行 `npm run db:seed` 后将创建：
- 管理员账号：`admin` / `admin123456`
- 产品分类：SU7系列、生态板、多层板、颗粒板
- SU7系列产品：圣玛丽胡桃、经典橡木、北欧白橡、深色胡桃
- 客户案例：住宅装修、别墅定制、办公改造
- 系统配置：公司信息、联系方式等

## 🛠️ 开发命令

```bash
# 开发环境启动
npm run dev

# 生产环境构建
npm run build

# 生产环境启动
npm start

# 运行测试
npm test

# 数据库操作
npm run db:generate    # 生成Prisma客户端
npm run db:migrate     # 运行数据库迁移
npm run db:seed        # 初始化数据
```

## 🔒 安全特性

- **JWT认证** - 无状态身份验证
- **密码加密** - bcrypt加密存储
- **请求限制** - 防止API滥用
- **数据验证** - 严格的输入验证
- **CORS配置** - 跨域请求控制
- **安全头** - Helmet安全中间件

## 📈 性能优化

- **Redis缓存** - 热点数据缓存
- **数据库索引** - 查询性能优化
- **图片压缩** - 自动WebP转换
- **请求压缩** - Gzip响应压缩
- **连接池** - 数据库连接优化

## 🚀 部署指南

### Docker部署 (推荐)
```bash
# 构建镜像
docker build -t shixiaoya-backend .

# 运行容器
docker run -p 3001:3001 --env-file .env shixiaoya-backend
```

### 传统部署
```bash
# 构建项目
npm run build

# 启动PM2
pm2 start dist/server.js --name shixiaoya-backend

# 设置开机自启
pm2 startup
pm2 save
```

## 📞 联系信息

**施小雅板材**
- 📍 地址: 广西柳州市鹿寨县鹿寨镇建中东路116号办公楼
- 📞 电话: 400-XXX-XXXX
- 📧 邮箱: info@shixiaoya.com

## 📝 更新日志

### v1.0.0 (2024-08-25)
- ✅ 完整的RESTful API设计
- ✅ JWT身份认证系统
- ✅ 产品管理功能
- ✅ 询价处理系统
- ✅ 客户案例管理
- ✅ 文件上传功能
- ✅ 邮件通知服务
- ✅ 数据统计分析
- ✅ Redis缓存支持
- ✅ 完整的数据验证

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 🙏 致谢

感谢以下开源项目的支持：
- [Node.js](https://nodejs.org/)
- [Express](https://expressjs.com/)
- [Prisma](https://www.prisma.io/)
- [TypeScript](https://www.typescriptlang.org/)

---

**施小雅板材后端API系统** - 专业环保板材供应商的数字化解决方案 🌿