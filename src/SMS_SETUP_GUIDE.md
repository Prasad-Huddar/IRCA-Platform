# SMS Notification Setup Guide

## Your Configuration
- **Admin Phone Number**: +919731250288 ✅
- **Twilio Account SID**: ACXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX ✅
- **Twilio Auth Token**: your_auth_token_here ✅
- **Twilio Phone Number**: ⚠️ **NEEDED** (Purchase from Twilio)

## Quick Setup Steps

### Step 1: Purchase Twilio Phone Number
1. Go to https://www.twilio.com/console
2. Click "Phone Numbers" → "Manage" → "Buy a number"
3. Choose an Indian number (starts with +91)
4. Purchase the number (cost: ~₹1-2 per month)
5. Note down the phone number (format: +91XXXXXXXXXX)

### Step 2: Configure Environment
1. Copy `.env.example` to `.env`
2. Update `.env` file:
```env
VITE_TWILIO_PHONE_NUMBER=+91XXXXXXXXXX
```

### Step 3: Test SMS
1. Start your development server
2. Go to Tracker page
3. Record a relapse with triggers
4. Check if SMS is received at +919731250288

## Current Implementation

The code is already configured with your Twilio credentials and will send SMS automatically once you purchase and configure the Twilio phone number.

### Option 2: AWS SNS
**Best for**: AWS-based applications, scalable

#### Setup Steps:
1. Set up AWS account and SNS service
2. Create an API endpoint for SMS sending
3. Configure AWS credentials
4. Update the code to call your API endpoint

### Option 3: Custom SMS Provider
**Best for**: Local/regional SMS services

#### Setup Steps:
1. Choose a local SMS provider (e.g., MSG91, TextLocal)
2. Get API credentials
3. Update the code to use their API

## Testing SMS Functionality

### For Development/Testing:
1. The current implementation logs SMS details to console
2. Check browser console for SMS details when testing
3. Replace logging with actual API calls for production

### Testing Steps:
1. Open browser developer console
2. Go to Tracker page
3. Click "Record Relapse"
4. Select some triggers
5. Submit the form
6. Check console for SMS details

## Environment Variables Setup

Create a `.env` file with your SMS service credentials:

```env
# Twilio
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=your_twilio_number

# OR AWS
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=your_region

# OR Custom SMS Provider
SMS_API_KEY=your_api_key
SMS_API_URL=your_api_endpoint
```

## Security Considerations

1. **Never expose API keys in frontend code**
2. **Use environment variables for sensitive data**
3. **Implement rate limiting to prevent spam**
4. **Validate phone numbers before sending**
5. **Log SMS activities for monitoring**

## Production Deployment Steps

1. **Choose SMS Provider**: Twilio recommended for reliability
2. **Set up credentials**: Store securely in environment variables
3. **Update code**: Replace console.log with actual API calls
4. **Test thoroughly**: Test with real phone numbers
5. **Monitor**: Set up logging and error tracking
6. **Scale**: Consider rate limits and costs

## Current Status

✅ **Completed**: SMS notification framework is ready
🔄 **Pending**: SMS service integration (choose provider)
⏳ **Next**: Deploy and test with real SMS service

## Cost Considerations

- **Twilio**: ~$0.0075 per SMS (India)
- **AWS SNS**: ~$0.0069 per SMS (India)
- **Local Providers**: Usually cheaper for India

Choose based on your budget and reliability requirements.