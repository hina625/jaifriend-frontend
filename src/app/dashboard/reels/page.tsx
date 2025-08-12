"use client";
import React, { useState, useEffect } from 'react';
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal, Play, Pause } from 'lucide-react';

const ReelsDemo = () => {
  const [currentReel, setCurrentReel] = useState(0);
  const [likes, setLikes] = useState({});
  const [isPlaying, setIsPlaying] = useState({});

  // Sample reels data with demo videos
  const reels = [
    {
      id: 1,
      username: "travel_vibes",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
      video: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
      poster: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=700&fit=crop",
      caption: "Beautiful sunset at the mountains! 🏔️✨ #travel #nature",
      likes: 1247,
      comments: 89,
      shares: 23,
      music: "Original Audio - travel_vibes"
    },
    {
      id: 2,
      username: "food_lover",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
      video: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
      poster: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=700&fit=crop",
      caption: "Homemade pizza night! 🍕 Recipe in bio",
      likes: 892,
      comments: 45,
      shares: 12,
      music: "Cooking Vibes - ChefBeats"
    },
    {
      id: 3,
      username: "fitness_guru",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
      video: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
      poster: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=700&fit=crop",
      caption: "Morning workout routine! 💪 Stay consistent!",
      likes: 2156,
      comments: 234,
      shares: 67,
      music: "Workout Motivation - FitBeats"
    },
    {
      id: 4,
      username: "art_studio",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
      video: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
      poster: "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400&h=700&fit=crop",
      caption: "Creating magic with colors! 🎨 #art #painting",
      likes: 743,
      comments: 56,
      shares: 28,
      music: "Creative Flow - ArtistVibes"
    },
    {
      id: 5,
      username: "tech_reviews",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
      video: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
      poster: "https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=400&h=700&fit=crop",
      caption: "Latest tech gadgets review! 📱💻 Link in bio",
      likes: 1834,
      comments: 178,
      shares: 89,
      music: "Tech Beats - DigitalSounds"
    }
  ];

  const handleLike = (reelId) => {
    setLikes(prev => ({
      ...prev,
      [reelId]: !prev[reelId]
    }));
  };

  const togglePlay = (reelId) => {
    const video = document.getElementById(`video-${reelId}`);
    if (video) {
      if (video.paused) {
        video.play();
        setIsPlaying(prev => ({ ...prev, [reelId]: true }));
      } else {
        video.pause();
        setIsPlaying(prev => ({ ...prev, [reelId]: false }));
      }
    }
  };

  const handleScroll = (e) => {
    const container = e.target;
    const reelHeight = container.clientHeight;
    const scrollTop = container.scrollTop;
    const newCurrentReel = Math.round(scrollTop / reelHeight);
    setCurrentReel(newCurrentReel);
  };

  useEffect(() => {
    // Auto-play current reel and pause others
    reels.forEach((reel, index) => {
      const video = document.getElementById(`video-${reel.id}`);
      if (video) {
        if (index === currentReel) {
          video.play().catch(() => {
            // Auto-play might be blocked, user needs to interact first
          });
          setIsPlaying(prev => ({ ...prev, [reel.id]: true }));
        } else {
          video.pause();
          setIsPlaying(prev => ({ ...prev, [reel.id]: false }));
        }
      }
    });
  }, [currentReel]);

  return (
    <div className="bg-black min-h-screen overflow-hidden">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-b from-black/80 to-transparent p-4">
        <div className="flex justify-between items-center text-white">
          <h1 className="text-xl font-bold">Reels</h1>
          <div className="flex gap-4">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
              <span className="text-sm">📷</span>
            </div>
          </div>
        </div>
      </div>

      {/* Reels Container */}
      <div 
        className="h-screen overflow-y-scroll snap-y snap-mandatory scrollbar-hide"
        onScroll={handleScroll}
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {reels.map((reel, index) => (
          <div 
            key={reel.id} 
            className="relative h-screen w-full snap-start snap-always flex-shrink-0"
          >
            {/* Background Video */}
            <video
              id={`video-${reel.id}`}
              className="absolute inset-0 w-full h-full object-cover"
              poster={reel.poster}
              loop
              muted
              playsInline
              preload="metadata"
              onLoadedData={() => {
                // Video is ready to play
                if (index === currentReel) {
                  const video = document.getElementById(`video-${reel.id}`);
                  if (video) {
                    video.play().catch(() => {
                      // Auto-play blocked
                    });
                  }
                }
              }}
            >
              <source src={reel.video} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
            <div className="absolute inset-0 bg-black/10"></div>

            {/* Play/Pause Overlay */}
            <div 
              className="absolute inset-0 flex items-center justify-center cursor-pointer"
              onClick={() => togglePlay(reel.id)}
            >
              {!isPlaying[reel.id] && (
                <div className="bg-black/50 rounded-full p-4">
                  <Play className="w-12 h-12 text-white fill-white" />
                </div>
              )}
            </div>

            {/* Content Overlay */}
            <div className="absolute inset-0 flex">
              {/* Left side - User info and caption */}
              <div className="flex-1 flex flex-col justify-end p-4 pb-20">
                <div className="text-white space-y-3">
                  {/* User info */}
                  <div className="flex items-center gap-3">
                    <img 
                      src={reel.avatar} 
                      alt={reel.username}
                      className="w-10 h-10 rounded-full border-2 border-white"
                    />
                    <span className="font-semibold text-sm">{reel.username}</span>
                    <button className="border border-white px-3 py-1 rounded text-xs font-semibold">
                      Follow
                    </button>
                  </div>

                  {/* Caption */}
                  <p className="text-sm leading-relaxed">
                    {reel.caption}
                  </p>

                  {/* Music info */}
                  <div className="flex items-center gap-2 text-xs">
                    <span>🎵</span>
                    <span className="truncate">{reel.music}</span>
                  </div>
                </div>
              </div>

              {/* Right side - Action buttons */}
              <div className="flex flex-col justify-end items-center p-4 pb-20 space-y-6">
                {/* Like button */}
                <div className="flex flex-col items-center">
                  <button 
                    onClick={() => handleLike(reel.id)}
                    className="transition-transform active:scale-125"
                  >
                    <Heart 
                      className={`w-7 h-7 ${
                        likes[reel.id] 
                          ? 'text-red-500 fill-red-500' 
                          : 'text-white'
                      }`} 
                    />
                  </button>
                  <span className="text-white text-xs mt-1">
                    {likes[reel.id] ? reel.likes + 1 : reel.likes}
                  </span>
                </div>

                {/* Comment button */}
                <div className="flex flex-col items-center">
                  <button className="transition-transform active:scale-125">
                    <MessageCircle className="w-7 h-7 text-white" />
                  </button>
                  <span className="text-white text-xs mt-1">{reel.comments}</span>
                </div>

                {/* Share button */}
                <div className="flex flex-col items-center">
                  <button className="transition-transform active:scale-125">
                    <Send className="w-7 h-7 text-white" />
                  </button>
                  <span className="text-white text-xs mt-1">{reel.shares}</span>
                </div>

                {/* Bookmark button */}
                <div className="flex flex-col items-center">
                  <button className="transition-transform active:scale-125">
                    <Bookmark className="w-7 h-7 text-white" />
                  </button>
                </div>

                {/* More options */}
                <div className="flex flex-col items-center">
                  <button className="transition-transform active:scale-125">
                    <MoreHorizontal className="w-7 h-7 text-white" />
                  </button>
                </div>

                {/* Profile picture (small) */}
                <div className="w-8 h-8 rounded-full border-2 border-white overflow-hidden">
                  <img 
                    src={reel.avatar} 
                    alt={reel.username}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>

            {/* Progress indicator */}
            <div className="absolute top-20 right-4">
              <div className="flex flex-col gap-1">
                {reels.map((_, i) => (
                  <div 
                    key={i}
                    className={`w-1 h-6 rounded-full transition-all duration-300 ${
                      i === index ? 'bg-white' : 'bg-white/30'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-black/90 backdrop-blur-sm border-t border-gray-800">
        <div className="flex justify-around items-center py-2">
          <div className="flex flex-col items-center p-2">
            <div className="w-6 h-6 bg-white rounded-sm mb-1"></div>
            <span className="text-white text-xs">Home</span>
          </div>
          <div className="flex flex-col items-center p-2">
            <div className="w-6 h-6 border-2 border-white rounded-sm mb-1"></div>
            <span className="text-gray-400 text-xs">Search</span>
          </div>
          <div className="flex flex-col items-center p-2">
            <div className="w-6 h-6 border-2 border-white rounded-sm mb-1 bg-white"></div>
            <span className="text-white text-xs font-semibold">Reels</span>
          </div>
          <div className="flex flex-col items-center p-2">
            <div className="w-6 h-6 border-2 border-white rounded-sm mb-1"></div>
            <span className="text-gray-400 text-xs">Shop</span>
          </div>
          <div className="flex flex-col items-center p-2">
            <div className="w-6 h-6 bg-white rounded-full mb-1"></div>
            <span className="text-gray-400 text-xs">Profile</span>
          </div>
        </div>
      </div>

      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};

export default ReelsDemo;
