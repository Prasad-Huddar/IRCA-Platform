/**
 * ============================================================================
 * SMS Service - IRCA Platform
 * ============================================================================
 * Twilio integration for sending SMS notifications
 * ============================================================================
 */

interface SMSConfig {
  accountSid: string;
  authToken: string;
  phoneNumber: string;
  adminNumber: string;
}

interface SMSMessage {
  to: string;
  body: string;
}

class SMSService {
  private config: SMSConfig;

  constructor() {
    // Initialize with your configured Twilio credentials
    this.config = {
      accountSid: import.meta.env.VITE_TWILIO_ACCOUNT_SID || 'ACXXXXXXXXXXXXXXXXXXXXXXXX',
      authToken: import.meta.env.VITE_TWILIO_AUTH_TOKEN || 'your_auth_token_here',
      phoneNumber: import.meta.env.VITE_TWILIO_PHONE_NUMBER || '',
      adminNumber: import.meta.env.VITE_ADMIN_PHONE_NUMBER || '+919731250288'
    };
  }

  /**
   * Send SMS via Twilio API
   */
  async sendSMS(message: SMSMessage): Promise<{ success: boolean; error?: string }> {
    // Check if service is configured
    if (!this.isConfigured()) {
      console.warn('SMS Service not properly configured. Message would be:', {
        to: message.to,
        body: message.body,
        from: this.config.phoneNumber,
        timestamp: new Date().toISOString()
      });
      return { success: false, error: 'SMS service not configured' };
    }

    // Log message for debugging
    console.log('SMS Service - Sending:', {
      to: message.to,
      body: message.body,
      from: this.config.phoneNumber,
      timestamp: new Date().toISOString()
    });

    try {
      // Make actual API call to Twilio
      const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${this.config.accountSid}/Messages.json`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${btoa(`${this.config.accountSid}:${this.config.authToken}`)}`
        },
        body: new URLSearchParams({
          To: message.to,
          From: this.config.phoneNumber,
          Body: message.body
        })
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Twilio API error:', errorData);
        return { 
          success: false, 
          error: `Twilio API error: ${response.status} ${errorData}` 
        };
      }

      const data = await response.json();
      console.log('SMS sent successfully:', data.sid);
      return { success: true };
    } catch (error) {
      console.error('SMS sending failed:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Send relapse alert SMS
   */
  async sendRelapseAlert(
    userName: string,
    addictionType: string,
    triggers: string[],
    notes?: string
  ): Promise<{ success: boolean; error?: string }> {
    const message = `🚨 RELAPSE ALERT\n\nUser: ${userName}\nAddiction: ${addictionType}\nTriggers: ${triggers.join(', ')}\n${notes ? `Notes: ${notes}` : ''}\n\nTime: ${new Date().toLocaleString()}`;

    return this.sendSMS({
      to: this.config.adminNumber,
      body: message
    });
  }

  /**
   * Send milestone achievement SMS
   */
  async sendMilestoneAlert(
    userName: string,
    milestoneType: string,
    daysAchieved: number,
    savings: number
  ): Promise<{ success: boolean; error?: string }> {
    const message = `🎉 MILESTONE ACHIEVED!\n\nUser: ${userName}\nAchievement: ${milestoneType}\nDays: ${daysAchieved}\nSavings: ₹${savings.toLocaleString('en-IN')}\n\nTime: ${new Date().toLocaleString()}`;

    return this.sendSMS({
      to: this.config.adminNumber,
      body: message
    });
  }

  /**
   * Send daily check-in reminder
   */
  async sendDailyCheckIn(userName: string): Promise<{ success: boolean; error?: string }> {
    const message = `📅 Daily Check-in Reminder\n\nHi ${userName},\nDon't forget to log your daily sobriety status!\nStay strong, you're doing great! 💪\n\nIRCA Platform`;

    return this.sendSMS({
      to: this.config.adminNumber,
      body: message
    });
  }

  /**
   * Check if SMS service is properly configured
   */
  isConfigured(): boolean {
    return !!(this.config.accountSid && this.config.authToken && this.config.phoneNumber);
  }

  /**
   * Get configuration status
   */
  getConfigStatus(): { configured: boolean; missing: string[] } {
    const missing: string[] = [];
    
    if (!this.config.accountSid) missing.push('Account SID');
    if (!this.config.authToken) missing.push('Auth Token');
    if (!this.config.phoneNumber) missing.push('Twilio Phone Number');
    
    return {
      configured: missing.length === 0,
      missing
    };
  }
}

// Export singleton instance
export const smsService = new SMSService();
export default smsService;
