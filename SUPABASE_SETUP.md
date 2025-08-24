# Supabase 数据库集成指南

## 🎯 概述

施小雅板材后端API系统已成功集成Supabase PostgreSQL数据库支持。本指南将帮助您完成Supabase项目设置和数据库迁移。

## 📋 前置准备

### 1. 创建Supabase项目
1. 访问 [Supabase](https://supabase.com)
2. 注册/登录账号
3. 点击 "New Project"
4. 填写项目信息：
   - **项目名称**: `shixiaoya-backend`
   - **数据库密码**: 设置一个强密码（请记住）
   - **地区**: 选择离您最近的地区

### 2. 获取连接信息
项目创建完成后，在项目设置中获取以下信息：

#### 📍 项目设置 → API
- **Project URL**: `https://[YOUR-PROJECT-REF].supabase.co`
- **anon public**: `eyJ...` (匿名密钥)
- **service_role**: `eyJ...` (服务角色密钥，保密)

#### 📍 项目设置 → 数据库
- **Connection string**: `postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres`

## 🔧 环境配置

### 1. 创建 .env 文件
在 `shixiaoya-backend` 目录下创建 `.env` 文件：

```env
# 数据库配置 - Supabase PostgreSQL
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"
DIRECT_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"

# Supabase 配置
SUPABASE_URL="https://[YOUR-PROJECT-REF].supabase.co"
SUPABASE_ANON_KEY="[YOUR-ANON-KEY]"
SUPABASE_SERVICE_ROLE_KEY="[YOUR-SERVICE-ROLE-KEY]"

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

### 2. 替换占位符
请将以下占位符替换为您的实际信息：
- `[YOUR-PASSWORD]`: 您的数据库密码
- `[YOUR-PROJECT-REF]`: 您的项目引用ID
- `[YOUR-ANON-KEY]`: 匿名密钥
- `[YOUR-SERVICE-ROLE-KEY]`: 服务角色密钥

## 🗄️ 数据库迁移

### 1. 运行数据库迁移
```bash
cd shixiaoya-backend

# 生成Prisma客户端
npm run db:generate

# 创建并运行迁移
npx prisma migrate dev --name init-supabase

# 初始化数据
npm run db:seed
```

### 2. 验证数据库
```bash
# 查看数据库状态
npx prisma db pull

# 打开Prisma Studio查看数据
npx prisma studio
```

## 📊 数据表结构

迁移完成后，将创建以下8个核心数据表：

### 1. **categories** - 产品分类
- 产品分类管理
- 支持层级结构
- 包含图片和描述

### 2. **products** - 产品信息
- SU7系列产品
- 价格和规格参数
- 图片和特性描述

### 3. **inquiries** - 客户询价
- 询价信息收集
- 状态管理
- 管理员回复功能

### 4. **inquiry_products** - 询价产品关联
- 询价和产品的多对多关系
- 数量记录

### 5. **cases** - 客户案例
- 项目案例展示
- 图片和材料信息
- 客户信息

### 6. **users** - 系统用户
- 管理员账号
- 角色权限管理
- 登录状态跟踪

### 7. **settings** - 系统配置
- 系统参数配置
- 公司信息设置
- 功能开关

### 8. **analytics** - 访问统计
- 页面访问记录
- 用户行为分析
- IP和来源跟踪

## 🔐 默认数据

运行 `npm run db:seed` 后将创建：

### 管理员账号
- **用户名**: `admin`
- **密码**: `admin123456`
- **邮箱**: `admin@shixiaoya.com`

### 产品分类
- SU7系列
- 生态板
- 多层板
- 颗粒板

### SU7系列产品
- 圣玛丽胡桃 (¥268/张)
- SU7-经典橡木 (¥248/张)
- SU7-北欧白橡 (¥238/张)
- SU7-深色胡桃 (¥278/张)

### 客户案例
- 现代简约住宅装修
- 欧式风格别墅定制
- 现代化办公空间改造

## 🚀 启动服务

### 1. 安装依赖（如果还未安装）
```bash
npm install
```

### 2. 启动开发服务器
```bash
npm run dev
```

### 3. 验证API
访问 `http://localhost:3001/api/products` 验证API是否正常工作。

## 🔍 Supabase 控制台

### 1. 数据库管理
- 访问 Supabase 项目控制台
- 在 "Table Editor" 中查看和管理数据
- 使用 SQL Editor 执行自定义查询

### 2. 实时功能
- Supabase 支持实时数据同步
- 可以监听数据库变化
- 支持 WebSocket 连接

### 3. 存储功能
- 可以使用 Supabase Storage 存储文件
- 支持图片上传和处理
- 提供 CDN 加速

## 🛡️ 安全配置

### 1. 行级安全 (RLS)
```sql
-- 启用行级安全
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- 创建策略
CREATE POLICY "Products are viewable by everyone" ON products
FOR SELECT USING (is_active = true);
```

### 2. API 权限
- 使用 service_role 密钥进行管理操作
- 使用 anon 密钥进行公开查询
- 配置适当的数据库策略

## 📝 注意事项

### 1. 环境变量安全
- 不要将 `.env` 文件提交到版本控制
- 生产环境使用不同的密钥
- 定期轮换密钥

### 2. 数据库连接
- Supabase 有连接数限制
- 使用连接池优化性能
- 监控数据库使用情况

### 3. 备份策略
- Supabase 提供自动备份
- 可以手动导出数据
- 建议定期备份重要数据

## 🆘 故障排除

### 1. 连接问题
```bash
# 测试数据库连接
npx prisma db pull
```

### 2. 迁移问题
```bash
# 重置数据库
npx prisma migrate reset

# 强制推送模式
npx prisma db push
```

### 3. 权限问题
- 检查 service_role 密钥是否正确
- 确认数据库密码是否正确
- 验证项目引用ID是否匹配

## 🎉 完成

恭喜！您已成功将施小雅板材后端API系统集成到Supabase。现在您可以：

- ✅ 使用 Supabase 控制台管理数据
- ✅ 享受实时数据同步功能
- ✅ 利用 Supabase 的扩展功能
- ✅ 获得企业级的数据库性能

如有任何问题，请参考 [Supabase 官方文档](https://supabase.com/docs) 或联系技术支持。