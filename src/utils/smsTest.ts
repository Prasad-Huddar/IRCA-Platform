/**
 * ============================================================================
 * SMS Test Utility - IRCA Platform
 * ============================================================================
 * Test SMS service configuration and functionality
 * ============================================================================
 */

import { smsService } from '../services/smsService';

/**
 * Test SMS configuration and sending
 */
export async function testSMSConfiguration() {
  console.log('=== SMS Configuration Test ===');
  
  // Check configuration status
  const configStatus = smsService.getConfigStatus();
  console.log('Configuration Status:', configStatus);
  
  if (!configStatus.configured) {
    console.error('SMS service is not properly configured!');
    console.error('Missing:', configStatus.missing.join(', '));
    return false;
  }
  
  console.log('✅ SMS service is properly configured');
  
  // Test sending a test message
  try {
    console.log('Sending test SMS...');
    const result = await smsService.sendSMS({
      to: import.meta.env.VITE_ADMIN_PHONE_NUMBER || '+919731250288',
      body: '🧪 TEST MESSAGE\n\nThis is a test from IRCA Platform\nTime: ' + new Date().toLocaleString()
    });
    
    if (result.success) {
      console.log('✅ Test SMS sent successfully');
      return true;
    } else {
      console.error('❌ Test SMS failed:', result.error);
      return false;
    }
  } catch (error) {
    console.error('❌ Test SMS error:', error);
    return false;
  }
}

/**
 * Test relapse alert SMS
 */
export async function testRelapseAlert() {
  console.log('=== Testing Relapse Alert SMS ===');
  
  try {
    const result = await smsService.sendRelapseAlert(
      'Test User',
      'alcohol',
      ['Feeling bored', 'Loneliness', 'Stress'],
      'This is a test relapse alert for debugging purposes'
    );
    
    if (result.success) {
      console.log('✅ Relapse alert SMS sent successfully');
      return true;
    } else {
      console.error('❌ Relapse alert SMS failed:', result.error);
      return false;
    }
  } catch (error) {
    console.error('❌ Relapse alert SMS error:', error);
    return false;
  }
}

// Export test functions for console debugging
if (typeof window !== 'undefined') {
  (window as any).testSMS = testSMSConfiguration;
  (window as any).testRelapseAlert = testRelapseAlert;
  
  console.log('SMS Test functions available:');
  console.log('- testSMS() - Test SMS configuration and send test message');
  console.log('- testRelapseAlert() - Test relapse alert SMS');
}
