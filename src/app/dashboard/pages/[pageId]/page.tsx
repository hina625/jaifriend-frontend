"use client";
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://jaifriend-backend.hgdjlive.com';
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Camera, Edit, Search, Video, Image, Hash, AtSign, Link, Plus, Heart, MessageCircle, Share2, MoreHorizontal, Users, FileText, Diamond, X, Upload, Smile, MapPin, Globe } from 'lucide-react';
import FeedPost from '@/components/FeedPost';

interface Page {
  _id: string;
  name: string;
  url: string;
  description: string;
  category: string;
  createdBy: string;
  creatorName: string;
  creatorAvatar: string;
  profileImage?: string;
  coverImage?: string;
  likes: string[];
  followers: string[];
  posts: string[];
  isVerified: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Post {
  _id: string;
  content: string;
  media?: any[];
  createdAt: string;
  user: string;
  likes?: string[];
  comments?: any[];
  shares?: string[];
}

interface Job {
  _id: string;
  title: string;
  location: string;
  description: string;
  salaryRange: {
    minimum: number;
    maximum: number;
    currency: string;
    type: string;
  };
  jobType: string;
  category: string;
  questions: Array<{ question: string }>;
  image?: string;
  pageId: string;
  createdBy: string;
  creatorName: string;
  creatorAvatar: string;
  interestedCandidates: Array<{
    userId: string;
    appliedAt: string;
    status: string;
  }>;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const PageView: React.FC = () => {
  const { pageId } = useParams();
  const router = useRouter();
  const [page, setPage] = useState<Page | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Home');
  const [newPostContent, setNewPostContent] = useState('');
  const [showPostForm, setShowPostForm] = useState(false);
  const [showPostModal, setShowPostModal] = useState(false);
  const [postTitle, setPostTitle] = useState('');
  const [postContent, setPostContent] = useState('');
  const [postPrivacy, setPostPrivacy] = useState('public');
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [posting, setPosting] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState('');
  const [showTagInput, setShowTagInput] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [jobs, setJobs] = useState<Job[]>([]);
  const [showJobModal, setShowJobModal] = useState(false);
  const [jobFormData, setJobFormData] = useState({
    title: '',
    location: '',
    description: '',
    salaryRange: {
      minimum: 0,
      maximum: 0,
      currency: 'USD',
      type: 'Per Hour'
    },
    jobType: 'Full time',
    category: 'Other',
    questions: [] as string[]
  });
  const [jobImage, setJobImage] = useState<File | null>(null);
  const [creatingJob, setCreatingJob] = useState(false);
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [offerFormData, setOfferFormData] = useState({
    offerType: 'Discount Percent',
    discountPercent: 1,
    discountedItems: '',
    currency: 'USD',
    description: '',
    endDate: '',
    endTime: ''
  });
  const [offerThumbnail, setOfferThumbnail] = useState<File | null>(null);
  const [creatingOffer, setCreatingOffer] = useState(false);
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [uploadingProfile, setUploadingProfile] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);

  const tabs = [
    { id: 'Home', label: 'Home' },
    { id: 'Jobs', label: 'Jobs' },
    { id: 'Offers', label: 'Offers' },
    { id: 'Reviews', label: 'Reviews' },
    { id: 'Invite', label: 'Invite' }
  ];

  const postFilters = [
    { id: 'all', label: 'All' },
    { id: 'text', label: 'Text' },
    { id: 'photos', label: 'Photos' },
    { id: 'videos', label: 'Videos' },
    { id: 'sounds', label: 'Sounds' }
  ];

  useEffect(() => {
    if (pageId) {
      fetchPage();
      fetchPagePosts();
      fetchJobs();
    }
  }, [pageId]);

  const fetchPage = async () => {
    try {
      const token = localStorage.getItem('token');
  const response = await fetch(`${API_URL}/api/pages/${pageId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setPage(data);
      } else {
        console.error('Failed to fetch page');
      }
    } catch (error) {
      console.error('Error fetching page:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPagePosts = async () => {
    try {
      const token = localStorage.getItem('token');
  const response = await fetch(`${API_URL}/api/pages/${pageId}/posts`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setPosts(data);
      }
    } catch (error) {
      console.error('Error fetching page posts:', error);
    }
  };

  const handleCreatePost = async () => {
    if (!newPostContent.trim()) return;

    try {
      const token = localStorage.getItem('token');
  const response = await fetch(`${API_URL}/api/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          content: newPostContent,
          pageId: pageId
        })
      });

      if (response.ok) {
        setNewPostContent('');
        fetchPagePosts();
      }
    } catch (error) {
      console.error('Error creating post:', error);
    }
  };

  const handleCreatePostWithModal = async () => {
    if (!postContent.trim() && mediaFiles.length === 0) {
      alert('Please add some content or media to your post');
      return;
    }

    setPosting(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Authentication required');
        return;
      }

      const formData = new FormData();
      formData.append('content', postContent);
      
      if (postTitle.trim()) {
        formData.append('title', postTitle.trim());
      }
      
      if (pageId) {
        formData.append('pageId', pageId as string);
      }
      
      formData.append('privacy', postPrivacy);
      
      if (selectedLocation) {
        formData.append('location', selectedLocation);
      }
      
      if (selectedTags.length > 0) {
        formData.append('tags', JSON.stringify(selectedTags));
      }
      
      mediaFiles.forEach((file, index) => {
        if (file.size > 10 * 1024 * 1024) {
          throw new Error(`File "${file.name}" is too large. Maximum size is 10MB.`);
        }
        
        const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm', 'video/ogg'];
        if (!validTypes.includes(file.type)) {
          throw new Error(`File "${file.name}" has an unsupported format. Please use images (JPEG, PNG, GIF, WebP) or videos (MP4, WebM, OGG).`);
        }
        
        formData.append('media', file);
      });

  const response = await fetch(`${API_URL}/api/posts`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (response.ok) {
        const post = await response.json();
        console.log('Post created successfully:', post);
        
        // Reset form
        setPostTitle('');
        setPostContent('');
        setPostPrivacy('public');
        setMediaFiles([]);
        setSelectedLocation('');
        setSelectedTags([]);
        setShowPostModal(false);
        
        // Refresh posts
        fetchPagePosts();
        
        alert('Post created successfully!');
      } else {
        const errorData = await response.json();
        alert('Error: ' + (errorData.message || 'Failed to create post'));
      }
    } catch (error) {
      console.error('Error creating post:', error);
      if (error instanceof Error) {
        alert('Error: ' + error.message);
      } else {
        alert('An error occurred while creating the post');
      }
    } finally {
      setPosting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setMediaFiles(prev => [...prev, ...files]);
  };

  const removeFile = (index: number) => {
    setMediaFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Handle tag input
  const handleTagInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      if (!selectedTags.includes(tagInput.trim())) {
        setSelectedTags(prev => [...prev, tagInput.trim()]);
      }
      setTagInput('');
    }
  };

  // Remove tag
  const removeTag = (tagToRemove: string) => {
    setSelectedTags(prev => prev.filter(tag => tag !== tagToRemove));
  };

  const fetchJobs = async () => {
    try {
      const token = localStorage.getItem('token');
  const response = await fetch(`${API_URL}/api/jobs/page/${pageId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setJobs(data);
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
    }
  };

  const handleCreateJob = async () => {
    if (!jobFormData.title || !jobFormData.location || !jobFormData.description) {
      alert('Please fill in all required fields');
      return;
    }

    // Validate salary range
    if (jobFormData.salaryRange.minimum < 0 || jobFormData.salaryRange.maximum < 0) {
      alert('Salary values must be positive numbers');
      return;
    }

    if (jobFormData.salaryRange.minimum > jobFormData.salaryRange.maximum) {
      alert('Minimum salary cannot be greater than maximum salary');
      return;
    }

    setCreatingJob(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Authentication required');
        return;
      }

      // Prepare the job data according to the backend schema
      const jobData: any = {
        title: jobFormData.title,
        location: jobFormData.location,
        description: jobFormData.description,
        salaryRange: {
          minimum: Number(jobFormData.salaryRange.minimum),
          maximum: Number(jobFormData.salaryRange.maximum),
          currency: jobFormData.salaryRange.currency,
          type: jobFormData.salaryRange.type
        },
        jobType: jobFormData.jobType,
        category: jobFormData.category,
        questions: jobFormData.questions.filter(q => q.trim() !== '').map(q => ({ question: q })), // Convert to proper format and filter empty questions
        pageId: pageId as string
      };

      // If there's an image, upload it first
      let imageUrl = null;
      if (jobImage) {
        const imageFormData = new FormData();
        imageFormData.append('media', jobImage);

  const uploadResponse = await fetch(`${API_URL}/api/upload`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: imageFormData
        });

        if (uploadResponse.ok) {
          const uploadData = await uploadResponse.json();
          imageUrl = uploadData.media[0].url;
        } else {
          throw new Error('Failed to upload image');
        }
      }

      // Add image URL to job data if available
      if (imageUrl) {
        jobData.image = imageUrl;
      }

      // Debug: Log the data being sent
      console.log('Sending job data:', jobData);

  const response = await fetch(`${API_URL}/api/jobs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(jobData)
      });

      if (response.ok) {
        const job = await response.json();
        console.log('Job created successfully:', job);
        
        // Reset form
        setJobFormData({
          title: '',
          location: '',
          description: '',
          salaryRange: {
            minimum: 0,
            maximum: 0,
            currency: 'USD',
            type: 'Per Hour'
          },
          jobType: 'Full time',
          category: 'Other',
          questions: []
        });
        setJobImage(null);
        setShowJobModal(false);
        
        // Refresh jobs
        fetchJobs();
        
        alert('Job created successfully!');
      } else {
        const errorData = await response.json();
        console.error('Job creation failed:', errorData);
        alert('Error: ' + (errorData.message || errorData.error || 'Failed to create job'));
      }
    } catch (error) {
      console.error('Error creating job:', error);
      if (error instanceof Error) {
        alert('Error: ' + error.message);
      } else {
        alert('An error occurred while creating the job');
      }
    } finally {
      setCreatingJob(false);
    }
  };

  const handleCreateOffer = async () => {
    if (!offerFormData.discountedItems.trim() || !offerFormData.description.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    if (offerFormData.discountPercent <= 0 || offerFormData.discountPercent > 100) {
      alert('Discount percentage must be between 1 and 100');
      return;
    }

    setCreatingOffer(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Authentication required');
        return;
      }

      // Prepare the offer data
      const offerData: any = {
        offerType: offerFormData.offerType,
        discountPercent: offerFormData.discountPercent,
        discountedItems: offerFormData.discountedItems,
        currency: offerFormData.currency,
        description: offerFormData.description,
        endDate: offerFormData.endDate,
        endTime: offerFormData.endTime,
        pageId: pageId as string
      };

      // If there's a thumbnail, upload it first
      let thumbnailUrl = null;
      if (offerThumbnail) {
        const thumbnailFormData = new FormData();
        thumbnailFormData.append('media', offerThumbnail);

  const uploadResponse = await fetch(`${API_URL}/api/upload`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: thumbnailFormData
        });

        if (uploadResponse.ok) {
          const uploadData = await uploadResponse.json();
          thumbnailUrl = uploadData.media[0].url;
        } else {
          throw new Error('Failed to upload thumbnail');
        }
      }

      // Add thumbnail URL to offer data if available
      if (thumbnailUrl) {
        offerData.thumbnail = thumbnailUrl;
      }

      // Create the offer (you'll need to implement this API endpoint)
  const response = await fetch(`${API_URL}/api/offers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(offerData)
      });

      if (response.ok) {
        const offer = await response.json();
        console.log('Offer created successfully:', offer);
        
        // Reset form
        setOfferFormData({
          offerType: 'Discount Percent',
          discountPercent: 1,
          discountedItems: '',
          currency: 'USD',
          description: '',
          endDate: '',
          endTime: ''
        });
        setOfferThumbnail(null);
        setShowOfferModal(false);
        
        alert('Offer created successfully!');
      } else {
        const errorData = await response.json();
        console.error('Offer creation failed:', errorData);
        alert('Error: ' + (errorData.message || errorData.error || 'Failed to create offer'));
      }
    } catch (error) {
      console.error('Error creating offer:', error);
      if (error instanceof Error) {
        alert('Error: ' + error.message);
      } else {
        alert('An error occurred while creating the offer');
      }
    } finally {
      setCreatingOffer(false);
    }
  };

  const handleOfferThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setOfferThumbnail(file);
    }
  };

 
  const addQuestion = () => {
    setJobFormData(prev => ({
      ...prev,
      questions: [...prev.questions, '']
    }));
  };

  const updateQuestion = (index: number, value: string) => {
    setJobFormData(prev => ({
      ...prev,
      questions: prev.questions.map((q, i) => i === index ? value : q)
    }));
  };

  const removeQuestion = (index: number) => {
    setJobFormData(prev => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index)
    }));
  };

  const handleJobImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setJobImage(file);
    }
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hrs`;
    if (diffInHours < 48) return '1 day';
    return `${Math.floor(diffInHours / 24)} days`;
  };

  const handleProfileImageUpload = async () => {
    if (!profileImage) return;

    setUploadingProfile(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Authentication required');
        return;
      }

      // First upload the image to get the URL
      const formData = new FormData();
      formData.append('postMedia', profileImage);

  const uploadResponse = await fetch(`${API_URL}/api/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload image');
      }

      const uploadData = await uploadResponse.json();
      const imageUrl = uploadData.media[0].url;

     
  const updateResponse = await fetch(`${API_URL}/api/pages/${pageId}/images`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          profileImage: imageUrl
        })
      });

      if (updateResponse.ok) {
        const updatedPage = await updateResponse.json();
        setPage(updatedPage.page);
        setProfileImage(null);
        alert('Profile image updated successfully!');
      } else {
        throw new Error('Failed to update page');
      }
    } catch (error) {
      console.error('Error updating profile image:', error);
      alert('Error updating profile image: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setUploadingProfile(false);
    }
  };

  const handleCoverImageUpload = async () => {
    if (!coverImage) return;

    setUploadingCover(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Authentication required');
        return;
      }

      // First upload the image to get the URL
      const formData = new FormData();
      formData.append('postMedia', coverImage);

  const uploadResponse = await fetch(`${API_URL}/api/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload image');
      }

      const uploadData = await uploadResponse.json();
      const imageUrl = uploadData.media[0].url;

      // Now update the page with the new cover image
  const updateResponse = await fetch(`${API_URL}/api/pages/${pageId}/images`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          coverImage: imageUrl
        })
      });

      if (updateResponse.ok) {
        const updatedPage = await updateResponse.json();
        setPage(updatedPage.page);
        setCoverImage(null);
        alert('Cover image updated successfully!');
      } else {
        throw new Error('Failed to update page');
      }
    } catch (error) {
      console.error('Error updating cover image:', error);
      alert('Error updating cover image: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setUploadingCover(false);
    }
  };

  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfileImage(file);
    }
  };

  const handleCoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverImage(file);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!page) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Page Not Found</h1>
          <p className="text-gray-600 mb-4">The page you're looking for doesn't exist.</p>
          <button
            onClick={() => router.back()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Back Button */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-700 hover:text-gray-900"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </button>
      </div>

      {/* Cover Photo */}
      <div className="relative h-48 md:h-64 bg-gradient-to-br from-pink-600 via-purple-600 to-blue-600">
        {page.coverImage && (
          <img
            src={page.coverImage}
            alt="Cover"
            className="w-full h-full object-cover"
          />
        )}
        <div className="absolute bottom-4 right-4">
          <input
            type="file"
            accept="image/*"
            onChange={handleCoverImageChange}
            className="hidden"
            id="cover-image-upload"
          />
          <label
            htmlFor="cover-image-upload"
            className="bg-gray-800 text-white px-3 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-700 cursor-pointer"
          >
            <Camera className="w-4 h-4" />
            Cover
          </label>
        </div>
        {coverImage && (
          <div className="absolute top-4 right-4">
            <button
              onClick={handleCoverImageUpload}
              disabled={uploadingCover}
              className="bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {uploadingCover ? 'Uploading...' : 'Save Cover'}
            </button>
          </div>
        )}
      </div>

      {/* Page Info Section */}
      <div className="relative px-4 pb-4 -mt-20">
        <div className="flex items-start justify-between">
          {/* Profile Picture */}
          <div className="relative">
            <div className="w-32 h-32 bg-orange-100 rounded-full border-4 border-white shadow-xl flex items-center justify-center overflow-hidden">
              {page.profileImage ? (
                <img
                  src={page.profileImage}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-4xl">🚩</span>
              )}
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={handleProfileImageChange}
              className="hidden"
              id="profile-image-upload"
            />
            <label
              htmlFor="profile-image-upload"
              className="absolute bottom-2 right-2 bg-gray-600 text-white p-2 rounded-full hover:bg-gray-700 cursor-pointer"
            >
              <Camera className="w-4 h-4" />
            </label>
          </div>
          {profileImage && (
            <div className="absolute top-2 right-2">
              <button
                onClick={handleProfileImageUpload}
                disabled={uploadingProfile}
                className="bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 text-sm"
              >
                {uploadingProfile ? 'Uploading...' : 'Save Profile'}
              </button>
            </div>
          )}

          {/* Page Details */}
          <div className="flex-1 ml-4">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-1">{page.name}</h1>
                <p className="text-gray-600 text-lg">@{page.url}</p>
              </div>
              <button className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300">
                Edit
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mt-6 border-b border-gray-200">
          <div className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`pb-3 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

            {/* Main Content */}
      <div className="px-4 py-6">
        <div className="max-w-4xl mx-auto">
          {activeTab === 'Home' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Post Creation and Feed */}
              <div className="lg:col-span-2 space-y-6">
                {/* Post Creation */}
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {page.profileImage ? (
                        <img
                          src={page.profileImage}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-lg">🚩</span>
                      )}
                    </div>
                    <div className="flex-1">
                      <button
                        onClick={() => setShowPostModal(true)}
                        className="w-full text-left p-3 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors text-gray-500 hover:text-gray-700 min-h-[80px] flex items-start"
                      >
                        What's going on? #Hashtag.. @Mention.. Link..
                      </button>
                      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => setShowPostModal(true)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                            title="Add Video"
                          >
                            <Video className="w-5 h-5" />
                          </button>
                          <button 
                            onClick={() => setShowPostModal(true)}
                            className="p-2 text-green-500 hover:bg-green-50 rounded-full transition-colors"
                            title="Add Image"
                          >
                            <Image className="w-5 h-5" />
                          </button>
                          <button 
                            onClick={() => setShowPostModal(true)}
                            className="p-2 text-blue-500 hover:bg-blue-50 rounded-full transition-colors"
                            title="Add Emoji"
                          >
                            <Smile className="w-5 h-5" />
                          </button>
                          <button 
                            onClick={() => setShowPostModal(true)}
                            className="p-2 text-purple-500 hover:bg-purple-50 rounded-full transition-colors"
                            title="Add Location"
                          >
                            <MapPin className="w-5 h-5" />
                          </button>
                          <button 
                            onClick={() => setShowPostModal(true)}
                            className="p-2 text-orange-500 hover:bg-orange-50 rounded-full transition-colors"
                            title="Add Tags"
                          >
                            <Hash className="w-5 h-5" />
                          </button>
                        </div>
                        <button
                          onClick={() => setShowPostModal(true)}
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Create Post
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Post Filters */}
                <div className="flex space-x-1 bg-white rounded-lg border border-gray-200 p-1">
                  {postFilters.map((filter) => (
                    <button
                      key={filter.id}
                      className={`px-4 py-2 rounded-md text-sm font-medium ${
                        filter.id === 'all'
                          ? 'bg-blue-100 text-blue-700'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>

                {/* Posts Feed */}
                <div className="space-y-4">
                  {posts.length > 0 ? (
                    posts.map((post) => (
                      <FeedPost
                        key={post._id}
                        post={{
                          _id: post._id,
                          content: post.content,
                          media: post.media || [],
                          createdAt: post.createdAt,
                          user: {
                            _id: page.createdBy,
                            name: page.creatorName,
                            username: page.url,
                            avatar: page.creatorAvatar
                          },
                          likes: post.likes || [],
                          comments: post.comments || [],
                          shares: post.shares || []
                        }}
                        onLike={(postId) => console.log('Like post:', postId)}
                        onComment={(postId, comment) => console.log('Comment on post:', postId, comment)}
                        onShare={(postId, shareOptions) => console.log('Share post:', postId, shareOptions)}
                        onSave={(postId) => console.log('Save post:', postId)}
                        onDelete={(postId) => console.log('Delete post:', postId)}
                        onEdit={(post) => console.log('Edit post:', post)}
                        isOwnPost={false}
                      />
                    ))
                  ) : (
                    <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FileText className="w-8 h-8 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No posts yet</h3>
                      <p className="text-gray-500">Be the first to share something on this page!</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Sidebar */}
              <div className="space-y-4">
                {/* Search */}
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search for posts"
                      className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Boost Page */}
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  <h3 className="font-medium text-gray-900 mb-3">Boost Page</h3>
                  <div className="flex items-center gap-2 mb-2">
                    <Heart className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">0 people like this</span>
                  </div>
                  <div className="text-sm text-green-600 font-medium">+0 This week</div>
                </div>

                {/* Page Stats */}
                <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">{posts.length} posts</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Diamond className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">{page.category}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'Jobs' && (
            <div className="space-y-6">
              {/* Jobs Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">Jobs</h3>
                  <p className="text-gray-500 mt-1">{jobs.length} job{jobs.length !== 1 ? 's' : ''} posted</p>
                </div>
                <button
                  onClick={() => setShowJobModal(true)}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Create Job
                </button>
              </div>

              {/* Jobs List */}
              <div className="space-y-4">
                {jobs.length > 0 ? (
                  jobs.map((job) => (
                    <div key={job._id} className="bg-white rounded-lg border border-gray-200 p-6">
                      <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {page.profileImage ? (
                      <img
                        src={page.profileImage}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-xl">🚩</span>
                    )}
                  </div>
                          <div>
                            <h4 className="text-xl font-bold text-gray-900 mb-1">{job.title}</h4>
                            <div className="flex items-center gap-2 text-gray-600 mb-2">
                              <span>{page.name}</span>
                              <span>•</span>
                              <span>{getTimeAgo(job.createdAt)}</span>
                              <span>•</span>
                              <span>{job.category}</span>
                            </div>
                            <p className="text-gray-700">{job.description.substring(0, 150)}...</p>
                          </div>
                        </div>
                        <button className="bg-pink-500 text-white px-4 py-2 rounded-lg hover:bg-pink-600">
                          View Interested Candidates ({job.interestedCandidates.length})
                        </button>
                      </div>

                      {/* Salary and Job Type */}
                      <div className="grid grid-cols-3 gap-4 bg-gray-50 p-4 rounded-lg">
                        <div>
                          <div className="text-sm font-medium text-gray-600">MINIMUM</div>
                          <div className="text-lg font-bold text-gray-900">
                            {job.salaryRange.currency === 'USD' ? '$' : 
                             job.salaryRange.currency === 'EUR' ? '€' : 
                             job.salaryRange.currency === 'GBP' ? '£' : 
                             job.salaryRange.currency === 'INR' ? '₹' : 
                             job.salaryRange.currency === 'PKR' ? '₨' : ''}
                            {job.salaryRange.minimum} {job.salaryRange.type}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-600">MAXIMUM</div>
                          <div className="text-lg font-bold text-gray-900">
                            {job.salaryRange.currency === 'USD' ? '$' : 
                             job.salaryRange.currency === 'EUR' ? '€' : 
                             job.salaryRange.currency === 'GBP' ? '£' : 
                             job.salaryRange.currency === 'INR' ? '₹' : 
                             job.salaryRange.currency === 'PKR' ? '₨' : ''}
                            {job.salaryRange.maximum} {job.salaryRange.type}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-600">TYPE</div>
                          <div className="text-lg font-bold text-gray-900">{job.jobType}</div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FileText className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs posted yet</h3>
                    <p className="text-gray-500">Create your first job posting to attract candidates!</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'Offers' && (
            <div className="space-y-6">
              {/* Offers Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">Offers</h3>
                  <p className="text-gray-500 mt-1">Create and manage special offers for your customers</p>
                </div>
                <button
                  onClick={() => setShowOfferModal(true)}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Create Offer
                </button>
              </div>

              {/* Offers List - Placeholder for now */}
              <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Diamond className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No offers yet</h3>
                <p className="text-gray-500 mb-4">Create your first offer to attract customers!</p>
                <button
                  onClick={() => setShowOfferModal(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  Create Your First Offer
                </button>
              </div>
            </div>
          )}

          {activeTab === 'Reviews' && (
            <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Reviews</h3>
              <p className="text-gray-500">Reviews functionality coming soon!</p>
            </div>
          )}

          {activeTab === 'Invite' && (
            <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Invite</h3>
              <p className="text-gray-500">Invite functionality coming soon!</p>
            </div>
          )}
        </div>
      </div>



      {/* Post Creation Modal */}
      {showPostModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" style={{ paddingTop: '60px', paddingBottom: '80px' }}>
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[calc(100vh-140px)] overflow-y-auto">
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Create New Post</h2>
                <button
                  onClick={() => setShowPostModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

                              {/* Post Form */}
                <div className="space-y-4">
                  {/* Title Field */}
                  <div>
                    <input
                      type="text"
                      placeholder="Post title (optional)"
                      value={postTitle}
                      onChange={(e) => setPostTitle(e.target.value)}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  {/* Content Field */}
                  <div>
                    <textarea
                      placeholder="What's going on? #Hashtag.. @Mention.. Link.."
                      value={postContent}
                      onChange={(e) => setPostContent(e.target.value)}
                      rows={4}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    />
                  </div>

                  {/* Privacy Settings */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Privacy</label>
                    <select
                      value={postPrivacy}
                      onChange={(e) => setPostPrivacy(e.target.value)}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="public">Public</option>
                      <option value="friends">Friends</option>
                      <option value="private">Private</option>
                    </select>
                  </div>

                  {/* Selected Tags */}
                  {selectedTags.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-700">Tags:</p>
                      <div className="flex flex-wrap gap-2">
                        {selectedTags.map((tag, index) => (
                          <span
                            key={index}
                            className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                          >
                            #{tag}
                            <button
                              onClick={() => removeTag(tag)}
                              className="hover:text-blue-900"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Selected Location */}
                  {selectedLocation && (
                    <div className="flex items-center gap-2 bg-gray-50 p-3 rounded-lg">
                      <MapPin className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-700">{selectedLocation}</span>
                      <button
                        onClick={() => setSelectedLocation('')}
                        className="ml-auto text-gray-400 hover:text-gray-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                {/* Media Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Add Media</label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 mb-2">Click to upload or drag and drop</p>
                    <input
                      type="file"
                      multiple
                      accept="image/*,video/*"
                      onChange={handleFileChange}
                      className="hidden"
                      id="media-upload"
                    />
                    <label
                      htmlFor="media-upload"
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 cursor-pointer inline-block"
                    >
                      Choose Files
                    </label>
                  </div>
                  
                  {/* Selected Files */}
                  {mediaFiles.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {mediaFiles.map((file, index) => (
                        <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                          <span className="text-sm text-gray-700 truncate">{file.name}</span>
                          <button
                            onClick={() => removeFile(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="flex items-center gap-2">
                    <button className="p-2 text-red-500 hover:bg-red-50 rounded-full">
                      <Video className="w-5 h-5" />
                    </button>
                    <button className="p-2 text-green-500 hover:bg-green-50 rounded-full">
                      <Image className="w-5 h-5" />
                    </button>
                    <button className="p-2 text-blue-500 hover:bg-blue-50 rounded-full">
                      <Smile className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={() => setShowLocationPicker(!showLocationPicker)}
                      className="p-2 text-purple-500 hover:bg-purple-50 rounded-full transition-colors"
                      title="Add Location"
                    >
                      <MapPin className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={() => setShowTagInput(!showTagInput)}
                      className="p-2 text-orange-500 hover:bg-orange-50 rounded-full transition-colors"
                      title="Add Tags"
                    >
                      <Hash className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setShowPostModal(false)}
                      className="px-4 py-2 text-gray-600 hover:text-gray-800"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleCreatePostWithModal}
                      disabled={posting || (!postContent.trim() && mediaFiles.length === 0)}
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {posting ? 'Creating...' : 'Create Post'}
                    </button>
                  </div>
                </div>

                {/* Location Picker */}
                {showLocationPicker && (
                  <div className="mt-4 p-3 border border-gray-200 rounded-lg">
                    <input
                      type="text"
                      placeholder="Enter location..."
                      value={selectedLocation}
                      onChange={(e) => setSelectedLocation(e.target.value)}
                      className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                )}

                {/* Tag Input */}
                {showTagInput && (
                  <div className="mt-4 p-3 border border-gray-200 rounded-lg">
                    <input
                      type="text"
                      placeholder="Type tag and press Enter..."
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyPress={handleTagInput}
                      className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

            {/* Job Creation Modal - Like Image Design */}
      {showJobModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[85vh] overflow-y-auto">
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Create Job</h2>
                <button
                  onClick={() => setShowJobModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Job Form - Matching Image Design */}
              <div className="space-y-6">
                {/* Job Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Job Title</label>
                  <input
                    type="text"
                    placeholder="Job title"
                    value={jobFormData.title}
                    onChange={(e) => setJobFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Location */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                  <input
                    type="text"
                    placeholder="Location"
                    value={jobFormData.location}
                    onChange={(e) => setJobFormData(prev => ({ ...prev, location: e.target.value }))}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    placeholder="Description"
                    value={jobFormData.description}
                    onChange={(e) => setJobFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={4}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                  <p className="text-sm text-gray-500 mt-1">Describe the responsibilities and preferred skills for this job</p>
                </div>

                {/* Salary Range Section */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Salary Range</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Minimum</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₹</span>
                        <input
                          type="number"
                          placeholder="Minimum"
                          value={jobFormData.salaryRange.minimum || ''}
                          onChange={(e) => setJobFormData(prev => ({
                            ...prev,
                            salaryRange: { ...prev.salaryRange, minimum: Number(e.target.value) || 0 }
                          }))}
                          className="w-full pl-8 pr-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Maximum</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₹</span>
                        <input
                          type="number"
                          placeholder="Maximum"
                          value={jobFormData.salaryRange.maximum || ''}
                          onChange={(e) => setJobFormData(prev => ({
                            ...prev,
                            salaryRange: { ...prev.salaryRange, maximum: Number(e.target.value) || 0 }
                          }))}
                          className="w-full pl-8 pr-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
                      <select
                        value={jobFormData.salaryRange.currency}
                        onChange={(e) => setJobFormData(prev => ({
                          ...prev,
                          salaryRange: { ...prev.salaryRange, currency: e.target.value }
                        }))}
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="USD">USD ($)</option>
                        <option value="EUR">EUR (€)</option>
                        <option value="GBP">GBP (£)</option>
                        <option value="INR">INR (₹)</option>
                        <option value="PKR">PKR (₨)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                      <select
                        value={jobFormData.salaryRange.type}
                        onChange={(e) => setJobFormData(prev => ({
                          ...prev,
                          salaryRange: { ...prev.salaryRange, type: e.target.value }
                        }))}
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="Per Hour">Per Hour</option>
                        <option value="Per Day">Per Day</option>
                        <option value="Per Week">Per Week</option>
                        <option value="Per Month">Per Month</option>
                        <option value="Per Year">Per Year</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Job Type and Category */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Job Type</label>
                    <select
                      value={jobFormData.jobType}
                      onChange={(e) => setJobFormData(prev => ({ ...prev, jobType: e.target.value }))}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="Full time">Full time</option>
                      <option value="Part time">Part time</option>
                      <option value="Contract">Contract</option>
                      <option value="Freelance">Freelance</option>
                      <option value="Internship">Internship</option>
                      <option value="Temporary">Temporary</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                    <select
                      value={jobFormData.category}
                      onChange={(e) => setJobFormData(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="Technology">Technology</option>
                      <option value="Healthcare">Healthcare</option>
                      <option value="Education">Education</option>
                      <option value="Finance">Finance</option>
                      <option value="Marketing">Marketing</option>
                      <option value="Sales">Sales</option>
                      <option value="Design">Design</option>
                      <option value="Engineering">Engineering</option>
                      <option value="Administration">Administration</option>
                      <option value="Customer Service">Customer Service</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                {/* Questions Section */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Questions</h3>
                  <button
                    onClick={addQuestion}
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-3"
                  >
                    <Plus className="w-4 h-4" />
                    Add Question
                  </button>
                  {jobFormData.questions.map((question, index) => (
                    <div key={index} className="flex items-center gap-2 mb-2">
                      <input
                        type="text"
                        placeholder="Enter question"
                        value={question}
                        onChange={(e) => updateQuestion(index, e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <button
                        onClick={() => removeQuestion(index)}
                        className="p-2 text-red-500 hover:text-red-700"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Image Upload Section */}
                <div>
                  <p className="text-sm text-gray-600 mb-3">Add an image to help applicants see what it's like to work at this location.</p>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    {jobImage ? (
                      <div className="space-y-4">
                        <img
                          src={URL.createObjectURL(jobImage)}
                          alt="Job preview"
                          className="w-full h-32 object-cover rounded-lg mx-auto"
                        />
                        <button
                          onClick={() => setJobImage(null)}
                          className="text-red-500 hover:text-red-700"
                        >
                          Remove Image
                        </button>
                      </div>
                    ) : (
                      <>
                        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                        <p className="text-gray-600 mb-3">Click to upload or drag and drop</p>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleJobImageChange}
                          className="hidden"
                          id="job-image-upload"
                        />
                        <label
                          htmlFor="job-image-upload"
                          className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 cursor-pointer inline-block mr-2"
                        >
                          Browse To Upload
                        </label>
                        <button className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300">
                          Use Cover Photo
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                  <button
                    onClick={() => setShowJobModal(false)}
                    className="px-6 py-2 text-gray-600 hover:text-gray-800"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateJob}
                    disabled={creatingJob || !jobFormData.title || !jobFormData.location || !jobFormData.description}
                    className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {creatingJob ? 'Creating...' : 'Publish'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Offer Modal */}
      {showOfferModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[85vh] overflow-y-auto">
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Create New Offer</h2>
                <button
                  onClick={() => setShowOfferModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Offer Form */}
              <div className="space-y-6">
                {/* Offer Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Offer Type</label>
                  <input
                    type="text"
                    value={offerFormData.offerType}
                    readOnly
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                  />
                </div>

                {/* Discount Percent */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Discount Percent</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={offerFormData.discountPercent}
                    onChange={(e) => setOfferFormData(prev => ({ ...prev, discountPercent: Number(e.target.value) }))}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Discounted Items and Currency */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Discounted Items and/or Services</label>
                    <textarea
                      placeholder="Add items or services to this offer"
                      value={offerFormData.discountedItems}
                      onChange={(e) => setOfferFormData(prev => ({ ...prev, discountedItems: e.target.value }))}
                      rows={3}
                      maxLength={100}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    />
                    <p className="text-xs text-gray-500 mt-1">Max 100 characters</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
                    <input
                      type="text"
                      value={`${offerFormData.currency} (${offerFormData.currency === 'USD' ? '$' : offerFormData.currency === 'EUR' ? '€' : offerFormData.currency === 'GBP' ? '£' : offerFormData.currency === 'INR' ? '₹' : offerFormData.currency === 'PKR' ? '₨' : ''})`}
                      readOnly
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    placeholder="Describe your offer in detail"
                    value={offerFormData.description}
                    onChange={(e) => setOfferFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={4}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                </div>

                {/* End Date and Time */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">End date</label>
                    <input
                      type="date"
                      value={offerFormData.endDate}
                      onChange={(e) => setOfferFormData(prev => ({ ...prev, endDate: e.target.value }))}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">End time</label>
                    <input
                      type="time"
                      value={offerFormData.endTime}
                      onChange={(e) => setOfferFormData(prev => ({ ...prev, endTime: e.target.value }))}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Thumbnail Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Thumbnail</label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    {offerThumbnail ? (
                      <div className="space-y-4">
                        <img
                          src={URL.createObjectURL(offerThumbnail)}
                          alt="Offer thumbnail preview"
                          className="w-full h-32 object-cover rounded-lg mx-auto"
                        />
                        <button
                          onClick={() => setOfferThumbnail(null)}
                          className="text-red-500 hover:text-red-700"
                        >
                          Remove Image
                        </button>
                      </div>
                    ) : (
                      <>
                        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                        <p className="text-gray-600 mb-3">Click to upload or drag and drop</p>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleOfferThumbnailChange}
                          className="hidden"
                          id="offer-thumbnail-upload"
                        />
                        <label
                          htmlFor="offer-thumbnail-upload"
                          className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 cursor-pointer inline-block"
                        >
                          Browse To Upload
                        </label>
                      </>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                  <button
                    onClick={() => setShowOfferModal(false)}
                    className="px-6 py-2 text-gray-600 hover:text-gray-800"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateOffer}
                    disabled={creatingOffer || !offerFormData.discountedItems.trim() || !offerFormData.description.trim()}
                    className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {creatingOffer ? 'Creating...' : 'Publish'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PageView;
