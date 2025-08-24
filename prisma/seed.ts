import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('开始初始化数据库数据...')

  // 创建管理员用户
  const hashedPassword = await bcrypt.hash('admin123456', 12)
  
  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      email: 'admin@shixiaoya.com',
      password: hashedPassword,
      name: '系统管理员',
      role: 'ADMIN'
    }
  })
  
  console.log('✅ 管理员用户创建成功:', admin.username)

  // 创建产品分类
  const categories = [
    {
      name: 'SU7系列',
      slug: 'su7-series',
      description: '施小雅最新SU7系列环保板材，采用先进工艺制造',
      sort: 1
    },
    {
      name: '生态板',
      slug: 'eco-board',
      description: '环保生态板材，E0级标准，适用于各种装修场景',
      sort: 2
    },
    {
      name: '多层板',
      slug: 'plywood',
      description: '优质多层板材，结构稳定，防潮性能优异',
      sort: 3
    },
    {
      name: '颗粒板',
      slug: 'particle-board',
      description: '环保颗粒板材，性价比高，广泛应用于家具制造',
      sort: 4
    }
  ]

  for (const categoryData of categories) {
    const category = await prisma.category.upsert({
      where: { slug: categoryData.slug },
      update: {},
      create: categoryData
    })
    console.log('✅ 分类创建成功:', category.name)
  }

  // 获取SU7系列分类ID
  const su7Category = await prisma.category.findUnique({
    where: { slug: 'su7-series' }
  })

  // 创建SU7系列产品
  const su7Products = [
    {
      name: '圣玛丽胡桃',
      slug: 'su7-shengmali-hutao',
      description: '施小雅SU7系列圣玛丽胡桃，纹理清晰自然，色泽温润典雅，是高端装修的首选材料。',
      price: 268,
      originalPrice: 298,
      categoryId: su7Category!.id,
      images: ['/placeholder.svg?height=400&width=600'],
      specifications: {
        '规格': '1220×2440mm',
        '厚度': '18mm',
        '环保等级': 'E0级',
        '表面工艺': '三聚氰胺贴面',
        '芯材': '马六甲芯'
      },
      features: ['E0级环保标准', '防潮防霉', '握钉力强', '表面耐磨'],
      isHot: true,
      isNew: true,
      stock: 500,
      sort: 1
    },
    {
      name: 'SU7-经典橡木',
      slug: 'su7-jingdian-xiangmu',
      description: '施小雅SU7系列经典橡木，经典橡木纹理，适合现代简约风格装修。',
      price: 248,
      originalPrice: 278,
      categoryId: su7Category!.id,
      images: ['/placeholder.svg?height=400&width=600'],
      specifications: {
        '规格': '1220×2440mm',
        '厚度': '18mm',
        '环保等级': 'E0级',
        '表面工艺': '三聚氰胺贴面',
        '芯材': '马六甲芯'
      },
      features: ['E0级环保标准', '防潮防霉', '握钉力强', '表面耐磨'],
      isHot: true,
      stock: 300,
      sort: 2
    },
    {
      name: 'SU7-北欧白橡',
      slug: 'su7-beiou-baixiang',
      description: '施小雅SU7系列北欧白橡，清新淡雅的白橡纹理，营造北欧风情。',
      price: 238,
      originalPrice: 268,
      categoryId: su7Category!.id,
      images: ['/placeholder.svg?height=400&width=600'],
      specifications: {
        '规格': '1220×2440mm',
        '厚度': '18mm',
        '环保等级': 'E0级',
        '表面工艺': '三聚氰胺贴面',
        '芯材': '马六甲芯'
      },
      features: ['E0级环保标准', '防潮防霉', '握钉力强', '表面耐磨'],
      stock: 200,
      sort: 3
    },
    {
      name: 'SU7-深色胡桃',
      slug: 'su7-shense-hutao',
      description: '施小雅SU7系列深色胡桃，深邃的胡桃木纹理，彰显奢华品质。',
      price: 278,
      originalPrice: 308,
      categoryId: su7Category!.id,
      images: ['/placeholder.svg?height=400&width=600'],
      specifications: {
        '规格': '1220×2440mm',
        '厚度': '18mm',
        '环保等级': 'E0级',
        '表面工艺': '三聚氰胺贴面',
        '芯材': '马六甲芯'
      },
      features: ['E0级环保标准', '防潮防霉', '握钉力强', '表面耐磨'],
      isNew: true,
      stock: 150,
      sort: 4
    }
  ]

  for (const productData of su7Products) {
    const product = await prisma.product.upsert({
      where: { slug: productData.slug },
      update: {},
      create: productData
    })
    console.log('✅ 产品创建成功:', product.name)
  }

  // 创建客户案例
  const cases = [
    {
      title: '现代简约住宅装修案例',
      slug: 'xiandai-jianyue-zhuzhai',
      description: '采用施小雅SU7系列板材，打造现代简约风格的温馨家居空间。整体设计简洁大方，色彩搭配和谐统一。',
      location: '柳州市城中区',
      area: '120㎡',
      projectType: '住宅装修',
      images: ['/placeholder.svg?height=400&width=600', '/placeholder.svg?height=400&width=600'],
      materials: {
        '主材': 'SU7-经典橡木',
        '辅材': '生态板',
        '用量': '50张'
      },
      clientName: '张先生',
      completedAt: new Date('2024-06-15'),
      sort: 1
    },
    {
      title: '高端别墅全屋定制',
      slug: 'gaoduan-bieshu-quanwu',
      description: '豪华别墅全屋定制项目，使用施小雅顶级板材，展现奢华品质和精湛工艺。',
      location: '柳州市柳北区',
      area: '350㎡',
      projectType: '别墅装修',
      images: ['/placeholder.svg?height=400&width=600', '/placeholder.svg?height=400&width=600'],
      materials: {
        '主材': 'SU7-深色胡桃',
        '辅材': '多层板',
        '用量': '120张'
      },
      clientName: '李女士',
      completedAt: new Date('2024-07-20'),
      sort: 2
    },
    {
      title: '办公空间现代化改造',
      slug: 'bangong-kongjian-xiandaihua',
      description: '企业办公空间改造项目，采用环保板材，创造健康舒适的办公环境。',
      location: '柳州市鱼峰区',
      area: '800㎡',
      projectType: '办公装修',
      images: ['/placeholder.svg?height=400&width=600', '/placeholder.svg?height=400&width=600'],
      materials: {
        '主材': 'SU7-北欧白橡',
        '辅材': '颗粒板',
        '用量': '200张'
      },
      clientName: '某科技公司',
      completedAt: new Date('2024-08-10'),
      sort: 3
    }
  ]

  for (const caseData of cases) {
    const caseItem = await prisma.case.upsert({
      where: { slug: caseData.slug },
      update: {},
      create: caseData
    })
    console.log('✅ 案例创建成功:', caseItem.title)
  }

  // 创建系统配置
  const settings = [
    {
      key: 'site_title',
      value: '施小雅板材',
      type: 'string',
      group: 'basic',
      description: '网站标题'
    },
    {
      key: 'site_description',
      value: '专业环保板材供应商，位于广西柳州，提供优质板材产品和服务',
      type: 'string',
      group: 'basic',
      description: '网站描述'
    },
    {
      key: 'company_phone',
      value: '400-XXX-XXXX',
      type: 'string',
      group: 'contact',
      description: '公司电话'
    },
    {
      key: 'company_email',
      value: 'info@shixiaoya.com',
      type: 'string',
      group: 'contact',
      description: '公司邮箱'
    },
    {
      key: 'company_address',
      value: '广西柳州市鹿寨县鹿寨镇建中东路116号办公楼',
      type: 'string',
      group: 'contact',
      description: '公司地址'
    }
  ]

  for (const settingData of settings) {
    const setting = await prisma.setting.upsert({
      where: { key: settingData.key },
      update: {},
      create: settingData
    })
    console.log('✅ 配置创建成功:', setting.key)
  }

  console.log('🎉 数据库初始化完成！')
  console.log('📋 管理员账号信息:')
  console.log('   用户名: admin')
  console.log('   密码: admin123456')
  console.log('   邮箱: admin@shixiaoya.com')
}

main()
  .catch((e) => {
    console.error('数据库初始化失败:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })