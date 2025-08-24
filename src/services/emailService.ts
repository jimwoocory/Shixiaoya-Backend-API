import nodemailer from 'nodemailer'

// 创建邮件传输器
const createTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  })
}

// 发送询价通知邮件
export const sendInquiryNotification = async (inquiry: any) => {
  if (!process.env.SMTP_HOST || !process.env.ADMIN_EMAIL) {
    console.log('邮件配置未完成，跳过邮件发送')
    return
  }
  
  const transporter = createTransporter()
  
  const productList = inquiry.products.map((p: any) => 
    `- ${p.product.name} (数量: ${p.quantity}, 单价: ¥${p.product.price})`
  ).join('\n')
  
  const mailOptions = {
    from: process.env.SMTP_USER,
    to: process.env.ADMIN_EMAIL,
    subject: `【施小雅板材】新询价通知 - ${inquiry.name}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2D5A27;">新询价通知</h2>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>客户信息</h3>
          <p><strong>姓名:</strong> ${inquiry.name}</p>
          <p><strong>电话:</strong> ${inquiry.phone}</p>
          ${inquiry.email ? `<p><strong>邮箱:</strong> ${inquiry.email}</p>` : ''}
          ${inquiry.company ? `<p><strong>公司:</strong> ${inquiry.company}</p>` : ''}
        </div>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>询价内容</h3>
          <p>${inquiry.message}</p>
        </div>
        
        ${inquiry.products.length > 0 ? `
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>询价产品</h3>
          <pre style="white-space: pre-wrap;">${productList}</pre>
        </div>
        ` : ''}
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
          <p style="color: #666; font-size: 14px;">
            提交时间: ${new Date(inquiry.createdAt).toLocaleString('zh-CN')}
          </p>
          <p style="color: #666; font-size: 14px;">
            请及时登录管理后台处理此询价。
          </p>
        </div>
      </div>
    `
  }
  
  await transporter.sendMail(mailOptions)
}

// 发送询价回复邮件
export const sendInquiryReply = async (inquiry: any) => {
  if (!process.env.SMTP_HOST || !inquiry.email) {
    return
  }
  
  const transporter = createTransporter()
  
  const mailOptions = {
    from: process.env.SMTP_USER,
    to: inquiry.email,
    subject: `【施小雅板材】询价回复 - ${inquiry.name}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2D5A27;">询价回复</h2>
        
        <p>尊敬的 ${inquiry.name}，您好！</p>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>您的询价内容</h3>
          <p>${inquiry.message}</p>
        </div>
        
        <div style="background: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>我们的回复</h3>
          <p style="white-space: pre-wrap;">${inquiry.adminReply}</p>
        </div>
        
        <div style="margin-top: 30px;">
          <p>如有其他问题，请随时联系我们：</p>
          <p>📞 电话: ${process.env.COMPANY_PHONE || '400-XXX-XXXX'}</p>
          <p>📧 邮箱: ${process.env.COMPANY_EMAIL || 'info@shixiaoya.com'}</p>
          <p>📍 地址: ${process.env.COMPANY_ADDRESS || '广西柳州市鹿寨县鹿寨镇建中东路116号办公楼'}</p>
        </div>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
          <p style="color: #666; font-size: 14px; text-align: center;">
            施小雅板材 - 专业环保板材供应商
          </p>
        </div>
      </div>
    `
  }
  
  await transporter.sendMail(mailOptions)
}