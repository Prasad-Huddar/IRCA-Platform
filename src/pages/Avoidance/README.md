# Avoidance Page Documentation

## Overview
The Avoidance page is a comprehensive section that includes dynamic Drug/Alcohol Avoidance Motivating Media content along with the existing FAQ and Resources sections.

## Features
1. **Audio Motivation Section** - Dynamic audio content from YouTube
2. **Video Motivation Section** - Dynamic video content from YouTube
3. **FAQ & Resources Section** - Existing FAQ and resources content

## Setup Instructions

### YouTube API Configuration
1. Obtain a YouTube Data API v3 key from the [Google Cloud Console](https://console.cloud.google.com/)
2. Enable the YouTube Data API v3 for your project
3. Create an API key with appropriate restrictions
4. Add the API key to your `.env` file:
   ```
   VITE_YOUTUBE_API_KEY=your_actual_api_key_here
   ```

### Channel Configuration
To customize the audio and video content, update the channel IDs in:
- `AudioMotivation.tsx` - for audio content
- `VideoMotivation.tsx` - for video content

Replace the placeholder channel IDs with actual YouTube channel IDs:
```typescript
const channelIds: Record<string, string[]> = {
  bhajans: [
    'ACTUAL_CHANNEL_ID_1',
    'ACTUAL_CHANNEL_ID_2'
  ],
  // ... other categories
}
```

## Component Structure
```
/src/pages/Avoidance/
├── index.tsx              # Main Avoidance page component
├── AudioMotivation.tsx    # Audio motivation section
├── VideoMotivation.tsx    # Video motivation section
├── FAQResources.tsx       # FAQ and resources section (moved from FAQPage)
├── api/
│   └── youtube.ts         # YouTube API helper functions
└── README.md              # This documentation
```

## Usage
The Avoidance page is accessible via the "Avoidance" link in the main navigation bar. It contains three tabs:
1. **🎧 Audio Motivation** - Playable audio content
2. **🎥 Video Motivation** - Embedded video content
3. **❓ FAQ & Resources** - Existing FAQ and resources content

## Development Notes
- All components follow the existing site's color scheme and styling
- Responsive design works on both desktop and mobile
- Dynamic content loads asynchronously to avoid impacting page load time
- API keys are stored securely in environment variables
- Videos automatically update when channel owners upload new content
- Each category fetches content from multiple YouTube channels
- Inline playback and "View on YouTube" buttons for all media