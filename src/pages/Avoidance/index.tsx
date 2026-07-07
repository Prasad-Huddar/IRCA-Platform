import React, { useState } from 'react';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Card, CardContent } from '../../components/ui/card';
import { Headphones, Video, HelpCircle } from 'lucide-react';
import AudioMotivation from './AudioMotivation';
import VideoMotivation from './VideoMotivation';
import FAQResources from './FAQResources';

const Avoidance = () => {
  const [activeTab, setActiveTab] = useState('audio');

  const tabs = [
    { id: 'audio', label: '🎧 Audio Motivation', icon: Headphones },
    { id: 'video', label: '🎥 Video Motivation', icon: Video },
    { id: 'faq', label: '❓ FAQ & Resources', icon: HelpCircle }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-white">
      {/* Header */}
      <section className="relative hero-gradient text-white overflow-hidden">
        <div className="absolute inset-0 gradient-overlay"></div>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 right-10 w-72 h-72 bg-white rounded-full mix-blend-multiply filter blur-3xl animate-float"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-white rounded-full mix-blend-multiply filter blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32 relative">
          <div className="text-center animate-fade-in-up">
            <Badge className="glass text-white border border-white/40 font-semibold mb-6 px-4 py-2 text-sm">
              🛡️ Recovery Support
            </Badge>
            <h1 className="text-5xl lg:text-7xl font-heading font-bold mb-6 leading-tight">
              Avoidance & Motivation
            </h1>
            <p className="text-xl lg:text-2xl text-white/95 max-w-3xl mx-auto leading-relaxed font-light">
              Find inspiring audio and video content to support your journey towards recovery.
              Access FAQs and resources for additional guidance.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-white text-primary hover:bg-white/90 shadow-xl font-semibold px-8">
                <Headphones className="mr-2 h-5 w-5" />
                Listen Now
              </Button>
              <Button size="lg" className="glass text-white hover:bg-white/20 border border-white/40 font-semibold px-8">
                <Video className="mr-2 h-5 w-5" />
                Watch Videos
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Tab Navigation */}
          <Card className="mb-10 border-2 border-border shadow-xl">
            <CardContent className="p-2">
              <div className="flex flex-wrap gap-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <Button
                      key={tab.id}
                      variant={activeTab === tab.id ? 'default' : 'ghost'}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center space-x-2 px-6 py-4 rounded-lg font-semibold transition-all ${
                        activeTab === tab.id
                          ? 'btn-primary shadow-md'
                          : 'hover:bg-primary/10'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      <span>{tab.label}</span>
                    </Button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Tab Content */}
          <div className="mt-8">
            {activeTab === 'audio' && <AudioMotivation />}
            {activeTab === 'video' && <VideoMotivation />}
            {activeTab === 'faq' && <FAQResources />}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Avoidance;