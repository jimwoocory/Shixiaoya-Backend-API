import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 生成询价单号
function generateInquiryNumber(index: number): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `INQ-${year}${month}${day}-${String(index).padStart(3, '0')}`;
}

async function seedInquiries() {
  console.log('开始创建询价数据...');

  const inquiries = [
    {
      inquiryNumber: generateInquiryNumber(1),
      customerName: '张先生',
      customerPhone: '13800138001',
      customerEmail: 'zhang@example.com',
      company: '广西装饰工程有限公司',
      productName: '施小雅-SU7系列 圣玛丽胡桃',
      quantity: 500,
      requirements: '需要18mm厚度，E0级环保标准，用于高端住宅项目',
      urgency: 'URGENT',
      status: 'PROCESSING',
      quotedPrice: '¥134,000',
      notes: '客户要求加急处理，已联系生产部门'
    },
    {
      inquiryNumber: generateInquiryNumber(2),
      customerName: '李女士',
      customerPhone: '13900139002',
      customerEmail: 'li@example.com',
      company: '柳州家具制造厂',
      productName: 'SU7-经典橡木',
      quantity: 300,
      requirements: '用于办公家具生产，需要提供样品',
      urgency: 'NORMAL',
      status: 'QUOTED',
      quotedPrice: '¥74,400',
      notes: '已发送报价单和样品'
    },
    {
      inquiryNumber: generateInquiryNumber(3),
      customerName: '王总',
      customerPhone: '13700137003',
      customerEmail: 'wang@example.com',
      company: '南宁建材贸易公司',
      productName: 'E0级生态板',
      quantity: 1000,
      requirements: '批量采购，希望获得优惠价格',
      urgency: 'FLEXIBLE',
      status: 'PENDING'
    },
    {
      inquiryNumber: generateInquiryNumber(4),
      customerName: '陈经理',
      customerPhone: '13600136004',
      customerEmail: 'chen@example.com',
      company: '桂林酒店装修公司',
      productName: '防火装饰板',
      quantity: 200,
      requirements: '酒店装修项目，需要A级防火等级',
      urgency: 'URGENT',
      status: 'COMPLETED',
      quotedPrice: '¥33,600',
      notes: '订单已完成，客户满意'
    },
    {
      inquiryNumber: generateInquiryNumber(5),
      customerName: '刘总监',
      customerPhone: '13500135005',
      customerEmail: 'liu@example.com',
      company: '北海建筑装饰公司',
      productName: '多层实木板',
      quantity: 800,
      requirements: '用于别墅装修，要求环保等级高，纹理自然',
      urgency: 'NORMAL',
      status: 'PROCESSING',
      quotedPrice: '¥156,800',
      notes: '正在准备详细报价方案'
    },
    {
      inquiryNumber: generateInquiryNumber(6),
      customerName: '周女士',
      customerPhone: '13400134006',
      customerEmail: 'zhou@example.com',
      company: '玉林家居定制',
      productName: '颗粒板',
      quantity: 150,
      requirements: '定制衣柜使用，需要防潮性能好',
      urgency: 'FLEXIBLE',
      status: 'QUOTED',
      quotedPrice: '¥18,750',
      notes: '客户考虑中，等待回复'
    },
    {
      inquiryNumber: generateInquiryNumber(7),
      customerName: '马经理',
      customerPhone: '13300133007',
      customerEmail: 'ma@example.com',
      company: '梧州办公家具厂',
      productName: '免漆生态板',
      quantity: 600,
      requirements: '办公桌椅生产，需要多种颜色选择',
      urgency: 'NORMAL',
      status: 'PENDING'
    },
    {
      inquiryNumber: generateInquiryNumber(8),
      customerName: '赵先生',
      customerPhone: '13200132008',
      customerEmail: 'zhao@example.com',
      company: '贵港装修公司',
      productName: '阻燃板材',
      quantity: 400,
      requirements: '商业空间装修，需要符合消防要求',
      urgency: 'URGENT',
      status: 'PROCESSING',
      notes: '已安排技术人员对接'
    }
  ];

  for (const inquiryData of inquiries) {
    await prisma.inquiry.create({
      data: inquiryData
    });
  }

  console.log(`成功创建 ${inquiries.length} 条询价记录`);
}

async function main() {
  try {
    await seedInquiries();
    console.log('询价数据种子创建完成');
  } catch (error) {
    console.error('创建询价数据失败:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}

export { seedInquiries };