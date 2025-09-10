// SMS service implementation
export async function sendSMS(to: string, message: string) {
  // Always use development mode for now since external packages are not installed
  if (process.env.NODE_ENV === 'development' || true) {
    console.warn('SMS service - Development mode')
    console.warn('Would send SMS:', {
      to,
      message: message.substring(0, 50) + '...'
    })
    
    // Simulate async operation
    await new Promise(resolve => setTimeout(resolve, 100))
    
    return { 
      success: true, 
      provider: 'development',
      messageId: `sms_dev_${Date.now()}`
    }
  }
}