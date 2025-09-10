// Email service implementation
export async function sendEmail(to: string, subject: string, html: string) {
  // Always use development mode for now since external packages are not installed
  if (process.env.NODE_ENV === 'development' || true) {
    console.warn('Email service - Development mode')
    console.warn('Would send email:', {
      to,
      subject,
      preview: html.substring(0, 100) + '...'
    })
    
    // Simulate async operation
    await new Promise(resolve => setTimeout(resolve, 100))
    
    return { 
      success: true, 
      provider: 'development',
      messageId: `dev_${Date.now()}`
    }
  }
}