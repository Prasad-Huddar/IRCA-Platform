# Twilio Messaging vs Verify API Guide

## What You Shared (Verify API)
```javascript
const accountSid = 'ACXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX';
const authToken = 'your_auth_token_here';
const client = require('twilio')(accountSid, authToken);

client.verify.v2.services("VAd59c470a9fc3c5d04b586fcc0539e2bd")
      .verificationChecks
      .create({to: '+919731250288', code: '[Code]'})
      .then(verification_check => console.log(verification_check.status));
```

## Difference Between APIs

### Twilio Verify API (What you showed)
- **Purpose**: Phone number verification / OTP systems
- **Use Case**: Send verification codes to verify phone numbers
- **Cost**: ~₹0.60 per verification
- **Flow**: Send OTP → User enters OTP → Verify the code

### Twilio Messaging API (What we need)
- **Purpose**: Send custom SMS messages
- **Use Case**: Send relapse trigger notifications to admin
- **Cost**: ~₹0.60 per SMS
- **Flow**: Send custom message directly

## Our Requirement: Messaging API
For the relapse tracker, we need to send custom messages like:
```
User has reported the following relapse triggers: Feeling bored, Loneliness
```

This requires the **Messaging API**, not the Verify API.

## Correct Implementation for Our Use Case

### Option 1: Direct API Call (Current Implementation)
```javascript
const accountSid = 'ACXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX';
const authToken = 'your_auth_token_here';
const client = require('twilio')(accountSid, authToken);

// Send SMS message
client.messages.create({
  body: 'User has reported the following relapse triggers: Feeling bored, Loneliness',
  from: '+1234567890',  // Your Twilio phone number
  to: '+919731250288'  // Admin phone number
});
```

### Option 2: Using Node.js SDK (Recommended for Backend)
```javascript
const twilio = require('twilio');
const client = twilio(accountSid, authToken);

client.messages.create({
  body: 'User has reported the following relapse triggers: Feeling bored, Loneliness',
  from: 'YOUR_TWILIO_PHONE_NUMBER',
  to: '+919731250288'
});
```

## Setup Steps for Messaging API

### Step 1: Purchase Twilio Phone Number
1. Go to https://www.twilio.com/console
2. Navigate to Phone Numbers
3. Buy a phone number (any country)
4. Note the number (e.g., +1234567890)

### Step 2: Configure Environment
```env
VITE_TWILIO_ACCOUNT_SID=ACXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
VITE_TWILIO_AUTH_TOKEN=your_auth_token_here
VITE_TWILIO_PHONE_NUMBER=+1234567890
```

### Step 3: Update Code
The current implementation in `TrackerPage.tsx` is already correct for Messaging API.

## Why Verify API Won't Work for Our Use Case
1. **Fixed Message Format**: Verify API sends predefined OTP messages only
2. **No Custom Messages**: Cannot send custom text like "User has reported triggers"
3. **Different Flow**: Requires user to enter code, which is not needed for admin notifications
4. **OTP System**: Designed for user verification, not admin notifications

## Current Status
✅ **Messaging API**: Implemented and ready
✅ **Twilio Credentials**: Configured
⚠️ **Phone Number**: Still need to purchase
🔄 **Next Step**: Buy Twilio phone number for sending SMS

## Summary
- **Verify API**: For OTP/phone verification (not what we need)
- **Messaging API**: For custom SMS messages (what we need)
- **Current Setup**: Already using Messaging API correctly
- **Missing**: Just need to purchase and configure Twilio phone number