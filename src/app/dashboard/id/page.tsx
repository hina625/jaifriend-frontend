"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { usePrivacy } from '@/contexts/PrivacyContext';
import { 
  MapPin, 
  Globe, 
  Calendar, 
  Users, 
  Eye, 
  Shield, 
  GraduationCap, 
  Briefcase, 
  Heart, 
  School, 
  Building, 
  Link, 
  Mail, 
  Phone, 
  Clock, 
  User,
  Edit,
  Save,
  X,
  CheckCircle,
  AlertCircle,
  Info
} from 'lucide-react';

const IDPage = () => {
  const router = useRouter();
  const { privacySettings, profileSettings, updateProfileSettings, loading } = usePrivacy();
  const [user, setUser] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    firstName: '',
    lastName: '',
    aboutMe: '',
    location: '',
    website: '',
    relationship: 'None',
    school: '',
    schoolCompleted: false,
    workingAt: '',
    companyWebsite: ''
  });

  useEffect(() => {
    fetchUserProfile();
  }, []);

  useEffect(() => {
    if (profileSettings) {
      setEditForm({
        firstName: profileSettings.firstName || '',
        lastName: profileSettings.lastName || '',
        aboutMe: profileSettings.aboutMe || '',
        location: profileSettings.location || '',
        website: profileSettings.website || '',
        relationship: profileSettings.relationship || 'None',
        school: profileSettings.school || '',
        schoolCompleted: profileSettings.schoolCompleted || false,
        workingAt: profileSettings.workingAt || '',
        companyWebsite: profileSettings.companyWebsite || ''
      });
    }
  }, [profileSettings]);

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/start-up');
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://jaifriend-backend-production.up.railway.app'}/api/profile/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const handleSave = async () => {
    try {
      await updateProfileSettings(editForm);
      setIsEditing(false);
      alert('Profile updated successfully!');
    } catch (error) {
      alert('Failed to update profile. Please try again.');
    }
  };

  const handleCancel = () => {
    if (profileSettings) {
      setEditForm({
        firstName: profileSettings.firstName || '',
        lastName: profileSettings.lastName || '',
        aboutMe: profileSettings.aboutMe || '',
        location: profileSettings.location || '',
        website: profileSettings.website || '',
        relationship: profileSettings.relationship || 'None',
        school: profileSettings.school || '',
        schoolCompleted: profileSettings.schoolCompleted || false,
        workingAt: profileSettings.workingAt || '',
        companyWebsite: profileSettings.companyWebsite || ''
      });
    }
    setIsEditing(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user || !privacySettings || !profileSettings) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400">Profile not found</p>
          <button 
            onClick={() => router.push('/dashboard')} 
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <div className="max-w-4xl mx-auto p-4 sm:p-6">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                <User className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">ID Information</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">Your complete profile details</p>
              </div>
            </div>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
            >
              {isEditing ? <X className="w-4 h-4" /> : <Edit className="w-4 h-4" />}
              {isEditing ? 'Cancel' : 'Edit'}
            </button>
          </div>

          {/* Profile Picture and Basic Info */}
          <div className="flex items-center gap-4 mb-6">
            <img
              src={user.avatar || '/avatars/1.png.png'}
              alt={user.name}
              className="w-20 h-20 rounded-full border-4 border-white shadow-lg object-cover"
            />
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                {user.name}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
                @{user.username}
              </p>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${
                  user.isOnline ? 'bg-green-500' : 'bg-gray-500'
                }`}></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {privacySettings.status}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Personal Information */}
          <div className="space-y-6">
            {/* Basic Information */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center gap-2 mb-4">
                <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Basic Information</h3>
              </div>
              
              {isEditing ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">First Name</label>
                      <input
                        type="text"
                        value={editForm.firstName}
                        onChange={(e) => setEditForm(prev => ({ ...prev, firstName: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Last Name</label>
                      <input
                        type="text"
                        value={editForm.lastName}
                        onChange={(e) => setEditForm(prev => ({ ...prev, lastName: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">About Me</label>
                    <textarea
                      value={editForm.aboutMe}
                      onChange={(e) => setEditForm(prev => ({ ...prev, aboutMe: e.target.value }))}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400 w-20">Name:</span>
                    <span className="text-sm text-gray-900 dark:text-white">
                      {profileSettings.firstName} {profileSettings.lastName}
                    </span>
                  </div>
                  {profileSettings.aboutMe && (
                    <div className="flex items-start gap-3">
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400 w-20">About:</span>
                      <span className="text-sm text-gray-900 dark:text-white">{profileSettings.aboutMe}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Contact Information */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Mail className="w-5 h-5 text-green-600 dark:text-green-400" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Contact Information</h3>
              </div>
              
              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Location</label>
                    <input
                      type="text"
                      value={editForm.location}
                      onChange={(e) => setEditForm(prev => ({ ...prev, location: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Website</label>
                    <input
                      type="url"
                      value={editForm.website}
                      onChange={(e) => setEditForm(prev => ({ ...prev, website: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {profileSettings.location && (
                    <div className="flex items-center gap-3">
                      <MapPin className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                      <span className="text-sm text-gray-900 dark:text-white">{profileSettings.location}</span>
                    </div>
                  )}
                  {profileSettings.website && (
                    <div className="flex items-center gap-3">
                      <Globe className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                      <a 
                        href={profileSettings.website} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        {profileSettings.website}
                      </a>
                    </div>
                  )}
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    <span className="text-sm text-gray-900 dark:text-white">{user.email}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Relationship Status */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Heart className="w-5 h-5 text-pink-600 dark:text-pink-400" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Relationship Status</h3>
              </div>
              
              {isEditing ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                  <select
                    value={editForm.relationship}
                    onChange={(e) => setEditForm(prev => ({ ...prev, relationship: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="None">None</option>
                    <option value="Single">Single</option>
                    <option value="In a relationship">In a relationship</option>
                    <option value="Engaged">Engaged</option>
                    <option value="Married">Married</option>
                    <option value="It's complicated">It's complicated</option>
                  </select>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-900 dark:text-white">
                    {profileSettings.relationship === 'None' ? 'Not specified' : profileSettings.relationship}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Education & Work */}
          <div className="space-y-6">
            {/* Education */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center gap-2 mb-4">
                <GraduationCap className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Education</h3>
              </div>
              
              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">School/University</label>
                    <input
                      type="text"
                      value={editForm.school}
                      onChange={(e) => setEditForm(prev => ({ ...prev, school: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="schoolCompleted"
                      checked={editForm.schoolCompleted}
                      onChange={(e) => setEditForm(prev => ({ ...prev, schoolCompleted: e.target.checked }))}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="schoolCompleted" className="text-sm text-gray-700 dark:text-gray-300">
                      Education completed
                    </label>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {profileSettings.school ? (
                    <div className="flex items-center gap-3">
                      <School className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                      <div>
                        <span className="text-sm text-gray-900 dark:text-white">{profileSettings.school}</span>
                        {profileSettings.schoolCompleted !== undefined && (
                          <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
                            {profileSettings.schoolCompleted ? '(Completed)' : '(In Progress)'}
                          </span>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <AlertCircle className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-500 dark:text-gray-400">No education information added</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Work Information */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Briefcase className="w-5 h-5 text-green-600 dark:text-green-400" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Work Information</h3>
              </div>
              
              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Company/Organization</label>
                    <input
                      type="text"
                      value={editForm.workingAt}
                      onChange={(e) => setEditForm(prev => ({ ...prev, workingAt: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Company Website</label>
                    <input
                      type="url"
                      value={editForm.companyWebsite}
                      onChange={(e) => setEditForm(prev => ({ ...prev, companyWebsite: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {profileSettings.workingAt ? (
                    <div className="flex items-center gap-3">
                      <Building className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                      <span className="text-sm text-gray-900 dark:text-white">{profileSettings.workingAt}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <AlertCircle className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-500 dark:text-gray-400">No work information added</span>
                    </div>
                  )}
                  {profileSettings.companyWebsite && (
                    <div className="flex items-center gap-3">
                      <Link className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                      <a 
                        href={profileSettings.companyWebsite} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        {profileSettings.companyWebsite}
                      </a>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Account Information */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Info className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Account Information</h3>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  <span className="text-sm text-gray-900 dark:text-white">
                    Joined {user.joinedDate ? new Date(user.joinedDate).toLocaleDateString() : 'Recently'}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Users className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  <span className="text-sm text-gray-900 dark:text-white">
                    {user.followers?.length || 0} followers • {user.following?.length || 0} following
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Status: {privacySettings.status}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Save Button */}
        {isEditing && (
          <div className="mt-6 flex justify-end gap-3">
            <button
              onClick={handleCancel}
              className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Save Changes
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default IDPage;
