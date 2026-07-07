# Video Component Setup Guide

## Current Status
The video component is temporarily disabled due to `RCTVideo` configuration issues. The app currently shows video placeholders.

## To Enable Video Playback:

### Option 1: Expo Video (Recommended for Expo)
Replace the import and component:

```tsx
// Replace this:
// import Video from 'react-native-video';

// With this:
import { Video } from 'expo-av';

// And update the Video component usage:
<Video
  source={{ uri: item.file_url }}
  style={styles.videoPlayer}
  useNativeControls
  resizeMode="contain"
  shouldPlay={isPlaying}
  isLooping
  onError={(error) => {
    console.error('Video error:', error);
    handleMediaError(item.id);
  }}
  onLoad={() => console.log('Video loaded successfully')}
/>
```

### Option 2: React Native Video (For bare React Native)
If you want to use `react-native-video`, you need to:

1. **Install dependencies:**
```bash
npm install react-native-video
```

2. **For iOS:**
```bash
cd ios && pod install
```

3. **For Android:**
Add to `android/settings.gradle`:
```gradle
include ':react-native-video'
project(':react-native-video').projectDir = new File(rootProject.projectDir, '../node_modules/react-native-video/android')
```

4. **Add to MainApplication.java:**
```java
import com.brentvatne.react.ReactVideoPackage;

@Override
protected List<ReactPackage> getPackages() {
    return Arrays.<ReactPackage>asList(
        new MainReactPackage(),
        new ReactVideoPackage()
    );
}
```

## Current Implementation
- ✅ Audio/Video toggle working
- ✅ Category tabs working  
- ✅ Supabase data fetching working
- ✅ Video placeholders showing
- ⏳ Actual video playback (needs configuration)

## Next Steps
1. Choose video solution (Expo Video recommended)
2. Replace placeholder with actual video component
3. Test video playback functionality
4. Add proper loading states for videos
