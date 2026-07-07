import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
  Dimensions,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { supabase } from '../lib/supabaseClient';
import { Audio, Video, ResizeMode } from 'expo-av';
import { VideoView, useVideoPlayer } from 'expo-video';

interface MediaItem {
  id: string;
  created_at: string;
  title: string;
  category: string;
  type: 'audio' | 'video';
  file_url: string;
  file_path: string;
  uploaded_by?: string;
}

const { width, height } = Dimensions.get('window');

export default function AvoidanceScreen() {
  const [activeType, setActiveType] = useState<'audio' | 'video'>('audio');
  const [activeTab, setActiveTab] = useState('bhajans');
  const [mediaData, setMediaData] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const [showAudioModal, setShowAudioModal] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [audioSound, setAudioSound] = useState<Audio.Sound | null>(null);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [audioPosition, setAudioPosition] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  
  // Video player setup
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const videoPlayer = useVideoPlayer(videoUrl ? { uri: videoUrl } : null);

  const audioTabs = [
    { id: 'bhajans', label: '🎵 Bhajans' },
    { id: 'atmavalokana', label: '🧘 Atmavalokana' },
    { id: 'motivational', label: '💪 Motivational' },
    { id: 'prayer', label: '🙏 Prayer' }
  ];

  const videoTabs = [
    { id: 'bhajans-video', label: '🎵 Bhajans', icon: '🎵' },
    { id: 'atmavalokana-video', label: '🧘 Atmavalokana Talks', icon: '🧘' },
    { id: 'prayer-video', label: '🙏 Prayer Talks', icon: '🙏' },
    { id: 'other', label: '🌿 Other Related Videos', icon: '🌿' }
  ];

  const currentTabs = activeType === 'audio' ? audioTabs : videoTabs;

  useEffect(() => {
    const loadMediaData = async () => {
      setLoading(true);
      setError(null);

      try {
        console.log(`Loading ${activeType} media for category: ${activeTab}`);

        const { data, error: supabaseError } = await supabase
          .from('media_library')
          .select('*')
          .eq('category', activeTab)
          .order('created_at', { ascending: false });

        if (supabaseError) {
          throw supabaseError;
        }

        console.log(`Total media fetched for ${activeTab}: ${data?.length || 0}`);

        setMediaData(data as MediaItem[] || []);

      } catch (err: any) {
        console.error('Error loading media data:', err);
        setError(err.message || 'Failed to load media content. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    loadMediaData();
  }, [activeTab, activeType]);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (audioSound) {
        audioSound.unloadAsync();
      }
    };
  }, [audioSound]);

  // Listen to video player status
  useEffect(() => {
    if (videoPlayer) {
      const subscription = videoPlayer.addListener('playingChange', (event) => {
        setIsVideoPlaying(event.isPlaying);
      });
      return () => subscription?.remove();
    }
  }, [videoPlayer]);

  const formatPublishedDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const handleMediaError = (id: string) => {
    console.warn(`Media failed to load for ID: ${id}. Hiding from view.`);
    setMediaData(prev => prev.filter(item => item.id !== id));
  };

  const playAudio = async (item: MediaItem) => {
    try {
      setSelectedMedia(item);
      setShowAudioModal(true);
      
      // Unload previous sound if any
      if (audioSound) {
        await audioSound.unloadAsync();
      }

      // Load and play new sound
      const { sound } = await Audio.Sound.createAsync(
        { uri: item.file_url },
        { shouldPlay: true }
      );
      
      setAudioSound(sound);
      setIsAudioPlaying(true);
      
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded) {
          if (status.didJustFinish) {
            setIsAudioPlaying(false);
          }
          if (status.positionMillis && status.durationMillis) {
            setAudioPosition(status.positionMillis);
            setAudioDuration(status.durationMillis);
          }
        }
      });
    } catch (error) {
      console.error('Error playing audio:', error);
      Alert.alert('Error', 'Failed to play audio. Please try again.');
    }
  };

  const pauseAudio = async () => {
    if (audioSound) {
      await audioSound.pauseAsync();
      setIsAudioPlaying(false);
    }
  };

  const resumeAudio = async () => {
    if (audioSound) {
      await audioSound.playAsync();
      setIsAudioPlaying(true);
    }
  };

  const closeAudioModal = async () => {
    if (audioSound) {
      await audioSound.unloadAsync();
      setAudioSound(null);
    }
    setShowAudioModal(false);
    setIsAudioPlaying(false);
    setAudioPosition(0);
    setAudioDuration(0);
  };

  const playVideo = (item: MediaItem) => {
    setSelectedMedia(item);
    setVideoUrl(item.file_url);
    setShowVideoModal(true);
    setIsVideoPlaying(false);
  };

  const closeVideoModal = () => {
    setShowVideoModal(false);
    setSelectedMedia(null);
    setVideoUrl(null);
    setIsVideoPlaying(false);
  };

  const toggleVideoPlayback = () => {
    if (videoPlayer) {
      if (isVideoPlaying) {
        videoPlayer.pause();
      } else {
        videoPlayer.play();
      }
    }
  };

  const formatTime = (milliseconds: number) => {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const renderMediaItem = (item: MediaItem) => {
    const isVideo = item.type === 'video';

    return (
      <Card key={item.id} style={styles.mediaCard}>
        <View style={styles.mediaContainer}>
          {isVideo ? (
            <View style={styles.videoContainer}>
              {/* Video thumbnail with play button */}
              <TouchableOpacity 
                style={styles.videoThumbnail}
                onPress={() => playVideo(item)}
              >
                <Video
                  style={styles.videoThumbnailImage}
                  source={{ uri: item.file_url }}
                  resizeMode={ResizeMode.COVER}
                  shouldPlay={false}
                  isMuted={true}
                  useNativeControls={false}
                />
              </TouchableOpacity>
              <View style={styles.mediaTypeBadge}>
                <Ionicons name="videocam" size={12} color="white" />
                <Text style={styles.mediaTypeText}>Video</Text>
              </View>
            </View>
          ) : (
            <View style={styles.audioContainer}>
              <View style={styles.audioIconContainer}>
                <Ionicons name="musical-notes" size={48} color="#6366f1" />
              </View>
              <View style={styles.audioTypeBadge}>
                <Ionicons name="musical-note" size={12} color="white" />
                <Text style={styles.mediaTypeText}>Audio</Text>
              </View>
              <TouchableOpacity 
                style={styles.audioPlayButton}
                onPress={() => playAudio(item)}
              >
                <Ionicons name="play" size={24} color="white" />
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={styles.mediaContent}>
          <Text style={styles.mediaTitle} numberOfLines={2}>{item.title}</Text>
          <View style={styles.mediaMeta}>
            <Text style={styles.categoryText}>{item.category}</Text>
            <Text style={styles.dateText}>{formatPublishedDate(item.created_at)}</Text>
          </View>
        </View>
      </Card>
    );
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>Motivation & Avoidance</Text>
      
      {/* Media Type Toggle */}
      <View style={styles.typeToggle}>
        <TouchableOpacity
          style={[styles.typeButton, activeType === 'audio' && styles.activeTypeButton]}
          onPress={() => {
            setActiveType('audio');
            setActiveTab('bhajans');
          }}
        >
          <Ionicons 
            name="musical-notes" 
            size={20} 
            color={activeType === 'audio' ? 'white' : '#6366f1'} 
          />
          <Text style={[styles.typeButtonText, activeType === 'audio' && styles.activeTypeButtonText]}>
            Audio
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.typeButton, activeType === 'video' && styles.activeTypeButton]}
          onPress={() => {
            setActiveType('video');
            setActiveTab('bhajans-video');
          }}
        >
          <Ionicons 
            name="videocam" 
            size={20} 
            color={activeType === 'video' ? 'white' : '#6366f1'} 
          />
          <Text style={[styles.typeButtonText, activeType === 'video' && styles.activeTypeButtonText]}>
            Video
          </Text>
        </TouchableOpacity>
      </View>

      {/* Category Tabs */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.tabsContainer}
        contentContainerStyle={styles.tabsContent}
      >
        {currentTabs.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={[
              styles.tabButton,
              activeTab === tab.id && styles.activeTabButton
            ]}
            onPress={() => setActiveTab(tab.id)}
          >
            <Text style={[
              styles.tabButtonText,
              activeTab === tab.id && styles.activeTabButtonText
            ]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Loading State */}
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6366f1" />
          <Text style={styles.loadingText}>Loading {activeType} content...</Text>
        </View>
      )}

      {/* Error State */}
      {error && (
        <Card style={styles.errorCard}>
          <View style={styles.errorContent}>
            <Ionicons name="warning" size={24} color="#f59e0b" />
            <Text style={styles.errorText}>{error}</Text>
            <Button
              variant="outline"
              onPress={() => setError(null)}
              style={styles.reloadButton}
            >
              Reload
            </Button>
          </View>
        </Card>
      )}

      {/* Media Content Grid */}
      {!loading && !error && (
        <View style={styles.mediaGrid}>
          {mediaData.length > 0 ? (
            mediaData.map(renderMediaItem)
          ) : (
            <Card style={styles.emptyCard}>
              <View style={styles.emptyContent}>
                <Ionicons name="play-circle" size={64} color="#6366f1" />
                <Text style={styles.emptyTitle}>No Content Available</Text>
                <Text style={styles.emptyText}>
                  No {activeType} content found for the '{activeTab}' category.
                </Text>
                <Button
                  variant="outline"
                  onPress={() => {}}
                  style={styles.refreshButton}
                >
                  Refresh
                </Button>
              </View>
            </Card>
          )}
        </View>
      )}

      {/* Audio Player Modal */}
      <Modal
        visible={showAudioModal}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={closeAudioModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={closeAudioModal} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#6366f1" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Audio Player</Text>
            <View style={styles.placeholder} />
          </View>
          
          <View style={styles.audioPlayerContent}>
            <View style={styles.audioPlayerArtwork}>
              <Ionicons name="musical-notes" size={80} color="#6366f1" />
            </View>
            <Text style={styles.audioPlayerTitle}>{selectedMedia?.title}</Text>
            <Text style={styles.audioPlayerCategory}>{selectedMedia?.category}</Text>
            
            <View style={styles.audioControls}>
              <TouchableOpacity 
                style={styles.audioControlButton}
                onPress={isAudioPlaying ? pauseAudio : resumeAudio}
              >
                <Ionicons 
                  name={isAudioPlaying ? "pause" : "play"} 
                  size={32} 
                  color="white" 
                />
              </TouchableOpacity>
            </View>
            
            <View style={styles.audioProgress}>
              <Text style={styles.timeText}>{formatTime(audioPosition)}</Text>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill, 
                    { width: `${audioDuration > 0 ? (audioPosition / audioDuration) * 100 : 0}%` }
                  ]} 
                />
              </View>
              <Text style={styles.timeText}>{formatTime(audioDuration)}</Text>
            </View>
          </View>
        </View>
      </Modal>

      {/* Video Player Modal */}
      <Modal
        visible={showVideoModal}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={closeVideoModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={closeVideoModal} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#6366f1" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Video Player</Text>
            <View style={styles.placeholder} />
          </View>
          
          <View style={styles.videoPlayerContent}>
            <View style={styles.videoContainer}>
              {videoPlayer && videoUrl && (
                <VideoView
                  style={styles.videoPlayer}
                  player={videoPlayer}
                  contentFit="contain"
                  allowsFullscreen={true}
                  allowsPictureInPicture={true}
                  nativeControls={true}
                />
              )}
            </View>
            
            <View style={styles.videoInfo}>
              <Text style={styles.videoPlayerTitle}>{selectedMedia?.title}</Text>
              <Text style={styles.videoPlayerCategory}>{selectedMedia?.category}</Text>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1e293b',
    marginTop: 16,
    marginBottom: 20,
  },
  typeToggle: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
  },
  typeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  activeTypeButton: {
    backgroundColor: '#6366f1',
  },
  typeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6366f1',
  },
  activeTypeButtonText: {
    color: 'white',
  },
  tabsContainer: {
    marginBottom: 20,
  },
  tabsContent: {
    paddingRight: 16,
  },
  tabButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginRight: 8,
  },
  activeTabButton: {
    backgroundColor: '#6366f1',
    borderColor: '#6366f1',
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748b',
  },
  activeTabButtonText: {
    color: 'white',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    fontSize: 16,
    color: '#6366f1',
    marginTop: 12,
    fontWeight: '500',
  },
  errorCard: {
    backgroundColor: '#fef3c7',
    borderColor: '#f59e0b',
    borderWidth: 1,
    marginBottom: 20,
  },
  errorContent: {
    padding: 20,
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#d97706',
    textAlign: 'center',
    marginTop: 8,
    fontWeight: '500',
  },
  reloadButton: {
    marginTop: 12,
  },
  mediaGrid: {
    paddingBottom: 20,
  },
  mediaCard: {
    marginBottom: 16,
    overflow: 'hidden',
  },
  mediaContainer: {
    position: 'relative',
    backgroundColor: '#f8fafc',
    height: 200,
  },
  videoContainer: {
    flex: 1,
    position: 'relative',
    backgroundColor: '#000',
  },
  videoThumbnail: {
    flex: 1,
    position: 'relative',
    backgroundColor: '#1a1a1a',
    overflow: 'hidden',
  },
  videoThumbnailImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#1a1a1a',
  },
  videoPlayButton: {
    position: 'absolute',
    backgroundColor: 'rgba(99, 102, 241, 0.9)',
    borderRadius: 50,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 10,
  },
  audioContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
  },
  audioIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  audioPlayButton: {
    position: 'absolute',
    backgroundColor: '#6366f1',
    borderRadius: 50,
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  mediaTypeBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  audioTypeBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  mediaTypeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '500',
  },
  mediaContent: {
    padding: 16,
  },
  mediaTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 8,
    lineHeight: 22,
  },
  mediaMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryText: {
    fontSize: 12,
    color: '#64748b',
    textTransform: 'capitalize',
  },
  dateText: {
    fontSize: 12,
    color: '#94a3b8',
  },
  emptyCard: {
    backgroundColor: 'white',
    borderColor: '#e2e8f0',
    borderWidth: 1,
  },
  emptyContent: {
    padding: 40,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1e293b',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  refreshButton: {
    paddingHorizontal: 24,
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  closeButton: {
    padding: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
  },
  placeholder: {
    width: 40,
  },
  // Audio Player styles
  audioPlayerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  audioPlayerArtwork: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  audioPlayerTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1e293b',
    textAlign: 'center',
    marginBottom: 8,
  },
  audioPlayerCategory: {
    fontSize: 16,
    color: '#64748b',
    textTransform: 'capitalize',
    marginBottom: 40,
  },
  audioControls: {
    marginBottom: 40,
  },
  audioControlButton: {
    backgroundColor: '#6366f1',
    borderRadius: 50,
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  audioProgress: {
    width: '100%',
    alignItems: 'center',
  },
  timeText: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 8,
  },
  progressBar: {
    width: '100%',
    height: 4,
    backgroundColor: '#e2e8f0',
    borderRadius: 2,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#6366f1',
    borderRadius: 2,
  },
  // Video Player styles
  videoPlayerContent: {
    flex: 1,
    backgroundColor: '#000',
  },
  videoPlayer: {
    width: '100%',
    height: '100%',
    backgroundColor: '#000',
  },
  videoInfo: {
    padding: 20,
    backgroundColor: '#f8fafc',
  },
  videoPlayerTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1e293b',
    textAlign: 'center',
    marginBottom: 8,
  },
  videoPlayerCategory: {
    fontSize: 16,
    color: '#64748b',
    textTransform: 'capitalize',
  },
});
