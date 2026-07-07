import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Play, Music, Video, FileAudio } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';

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

const AudioMotivation = () => {
  const [activeTab, setActiveTab] = useState('bhajans');
  const [mediaData, setMediaData] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const tabs = [
    { id: 'bhajans', label: '🎵 Bhajans' },
    { id: 'atmavalokana', label: '🧘 Atmavalokana' },
    { id: 'motivational', label: '💪 Motivational' },
    { id: 'prayer', label: '🙏 Prayer' }
  ];

  useEffect(() => {
    const loadMediaData = async () => {
      setLoading(true);
      setError(null);

      try {
        console.log(`Loading media for category: ${activeTab}`);

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
  }, [activeTab]);

  const formatPublishedDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const handleMediaError = (id: string) => {
    console.warn(`Media failed to load for ID: ${id}. Hiding from view.`);
    setMediaData(prev => prev.filter(item => item.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {tabs.map((tab) => (
          <Button
            key={tab.id}
            variant={activeTab === tab.id ? 'default' : 'outline'}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-full font-medium transition-all ${activeTab === tab.id
              ? 'bg-primary text-white shadow-md'
              : 'hover:bg-primary/10'
              }`}
          >
            {tab.label}
          </Button>
        ))}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          <span className="ml-3 text-lg text-primary">Loading audio content...</span>
        </div>
      )}

      {/* Error State */}
      {error && (
        <Card className="border border-warning/30 bg-warning/5">
          <CardContent className="p-6 text-center">
            <p className="text-warning font-medium">{error}</p>
            <Button
              variant="outline"
              className="mt-4 border-warning text-warning hover:bg-warning/10"
              onClick={() => window.location.reload()}
            >
              Reload
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Media Content Grid */}
      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mediaData.length > 0 ? (
            mediaData.map((item) => (
              <Card
                key={item.id}
                className="overflow-hidden border-2 border-border hover:border-primary/30 transition-all duration-300 hover:shadow-lg flex flex-col"
              >
                <div className="relative bg-black/5 aspect-video flex items-center justify-center">
                  {item.type === 'video' ? (
                    <video
                      controls
                      className="w-full h-full object-cover"
                      src={item.file_url}
                      onError={() => handleMediaError(item.id)}
                    >
                      Your browser does not support the video tag.
                    </video>
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-secondary/20 p-6">
                      <FileAudio className="h-16 w-16 text-primary mb-2 opacity-80" />
                      <audio
                        controls
                        className="w-full mt-4"
                        src={item.file_url}
                        onError={() => handleMediaError(item.id)}
                      >
                        Your browser does not support the audio element.
                      </audio>
                    </div>
                  )}
                  {item.type === 'video' && (
                    <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded flex items-center">
                      <Video className="w-3 h-3 mr-1" /> Video
                    </div>
                  )}
                  {item.type === 'audio' && (
                    <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded flex items-center">
                      <Music className="w-3 h-3 mr-1" /> Audio
                    </div>
                  )}
                </div>

                <CardHeader className="pb-2">
                  <CardTitle className="text-lg line-clamp-2" title={item.title}>{item.title}</CardTitle>
                </CardHeader>

                <CardContent className="mt-auto">
                  <div className="flex justify-between items-center text-xs text-muted-foreground">
                    <span className="capitalize">{item.category}</span>
                    <span>{formatPublishedDate(item.created_at)}</span>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="col-span-full border border-border">
              <CardContent className="p-12 text-center">
                <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <Play className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">No Content Available</h3>
                <p className="text-muted-foreground mb-4">
                  No media content found for the '{activeTab}' category.
                </p>
                <Button
                  variant="outline"
                  onClick={() => window.location.reload()}
                >
                  Refresh
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default AudioMotivation;