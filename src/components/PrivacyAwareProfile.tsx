"use client";

import React from 'react';
import { usePrivacy } from '@/contexts/PrivacyContext';
import {
  getDisplayName,
  getDisplayBio,
  getDisplayLocation,
  getDisplayWorkplace,
  getDisplayWebsite,
  getOnlineStatus,
  shouldShowOnlineStatus,
  canViewFriends,
  canViewActivities,
  calculatePrivacyLevel,
  getPrivacyLevelText
} from '@/utils/privacyUtils';
import { MapPin, Globe, Calendar, Users, Eye, Shield, GraduationCap, Briefcase, Heart, School, Building, Link } from 'lucide-react';

interface PrivacyAwareProfileProps {
  viewerType: 'public' | 'friend' | 'following' | 'self';
  user: {
    id: string;
    name: string;
    username: string;
    avatar: string;
    email: string;
    followers: string[];
    following: string[];
    bio?: string;
    location?: string;
    website?: string;
    workplace?: string;
    address?: string;
    country?: string;
    isOnline?: boolean;
    joinedDate?: string;
  };
}

const PrivacyAwareProfile: React.FC<PrivacyAwareProfileProps> = ({ viewerType, user }) => {
  const { privacySettings, profileSettings } = usePrivacy();

  if (!privacySettings || !profileSettings) {
    // Fallback to basic display if settings are not loaded
    return (
      <div className="space-y-4">
        <div className="text-center">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-1 break-words">
            {user.name}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base mb-2">
            @{user.username}
          </p>
        </div>
        
        {user.bio && (
          <p className="text-gray-700 dark:text-gray-300 mb-3 text-sm sm:text-base max-w-full mx-auto px-2">
            {user.bio}
          </p>
        )}

        <div className="flex flex-wrap gap-1 text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-3 justify-center px-2">
          {user.location && (
            <div className="flex items-center gap-1">
              <MapPin className="w-3 h-3 flex-shrink-0" />
              <span className="truncate">{user.location}</span>
            </div>
          )}
          {user.website && (
            <div className="flex items-center gap-1">
              <Globe className="w-3 h-3 flex-shrink-0" />
              <a href={user.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline truncate">
                {user.website}
              </a>
            </div>
          )}
          {user.joinedDate && (
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3 flex-shrink-0" />
              <span>Joined {new Date(user.joinedDate).toLocaleDateString()}</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Get privacy-aware display values
  const displayName = getDisplayName(profileSettings);
  const displayBio = getDisplayBio(profileSettings, privacySettings, viewerType);
  const displayLocation = getDisplayLocation(profileSettings, privacySettings, viewerType);
  const displayWorkplace = getDisplayWorkplace(profileSettings, privacySettings, viewerType);
  const displayWebsite = getDisplayWebsite(profileSettings, privacySettings, viewerType);
  const onlineStatus = getOnlineStatus(privacySettings, user.isOnline || false);
  const showOnlineStatus = shouldShowOnlineStatus(privacySettings, viewerType);
  const canViewFriendsList = canViewFriends(privacySettings, viewerType);
  const canViewActivitiesList = canViewActivities(privacySettings, viewerType);
  const privacyLevel = calculatePrivacyLevel(privacySettings);

  // Helper function to check if we should show education/work info
  const shouldShowEducationWork = () => {
    if (viewerType === 'self') return true;
    return canViewActivitiesList;
  };

  return (
    <div className="space-y-4">
      {/* User Info */}
      <div className="text-center">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-1 break-words">
          {displayName}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base mb-2">
          @{user.username}
        </p>
        
        {/* Online Status */}
        {showOnlineStatus && (
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className={`w-2 h-2 rounded-full ${
              onlineStatus === 'Online' ? 'bg-green-500' :
              onlineStatus === 'Away' ? 'bg-yellow-500' :
              onlineStatus === 'Busy' ? 'bg-red-500' : 'bg-gray-500'
            }`}></div>
            <span className="text-xs text-gray-600 dark:text-gray-400">
              {onlineStatus}
            </span>
          </div>
        )}
      </div>

      {/* Bio */}
      {displayBio && (
        <p className="text-gray-700 dark:text-gray-300 mb-3 text-sm sm:text-base max-w-full mx-auto px-2">
          {displayBio}
        </p>
      )}

      {/* Privacy Level Indicator (only for self) */}
      {viewerType === 'self' && (
        <div className="mx-auto max-w-xs p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
              Privacy Level: {getPrivacyLevelText(privacyLevel)}
            </span>
          </div>
          <div className="w-full bg-blue-200 dark:bg-blue-800 rounded-full h-1.5 mb-1">
            <div 
              className="bg-blue-600 dark:bg-blue-400 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${privacyLevel}%` }}
            ></div>
          </div>
          <p className="text-xs text-blue-700 dark:text-blue-300">
            {privacyLevel}% - Your profile is {getPrivacyLevelText(privacyLevel).toLowerCase()}
          </p>
        </div>
      )}

      {/* Basic User Details */}
      <div className="flex flex-wrap gap-1 text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-3 justify-center px-2">
        {displayLocation && (
          <div className="flex items-center gap-1">
            <MapPin className="w-3 h-3 flex-shrink-0" />
            <span className="truncate">{displayLocation}</span>
          </div>
        )}
        {displayWebsite && (
          <div className="flex items-center gap-1">
            <Globe className="w-3 h-3 flex-shrink-0" />
            <a href={displayWebsite} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline truncate">
              {displayWebsite}
            </a>
          </div>
        )}
        {user.joinedDate && (
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3 flex-shrink-0" />
            <span>Joined {new Date(user.joinedDate).toLocaleDateString()}</span>
          </div>
        )}
      </div>

      {/* Education & Work Information */}
      {shouldShowEducationWork() && (
        <div className="space-y-3">
          {/* Education Section */}
          {(profileSettings.school || profileSettings.schoolCompleted !== undefined) && (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center gap-2 mb-3">
                <GraduationCap className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Education</h3>
              </div>
              <div className="space-y-2">
                {profileSettings.school && (
                  <div className="flex items-center gap-2">
                    <School className="w-3 h-3 text-gray-500 dark:text-gray-400" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {profileSettings.school}
                      {profileSettings.schoolCompleted !== undefined && (
                        <span className="text-gray-500 dark:text-gray-400 ml-1">
                          {profileSettings.schoolCompleted ? ' (Completed)' : ' (In Progress)'}
                        </span>
                      )}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Work Section */}
          {(profileSettings.workingAt || profileSettings.companyWebsite) && (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center gap-2 mb-3">
                <Briefcase className="w-4 h-4 text-green-600 dark:text-green-400" />
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Work</h3>
              </div>
              <div className="space-y-2">
                {profileSettings.workingAt && (
                  <div className="flex items-center gap-2">
                    <Building className="w-3 h-3 text-gray-500 dark:text-gray-400" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {profileSettings.workingAt}
                    </span>
                  </div>
                )}
                {profileSettings.companyWebsite && (
                  <div className="flex items-center gap-2">
                    <Link className="w-3 h-3 text-gray-500 dark:text-gray-400" />
                    <a 
                      href={profileSettings.companyWebsite} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-sm text-blue-600 dark:text-blue-400 hover:underline truncate"
                    >
                      {profileSettings.companyWebsite}
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Relationship Status */}
          {profileSettings.relationship && profileSettings.relationship !== 'None' && (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center gap-2 mb-3">
                <Heart className="w-4 h-4 text-pink-600 dark:text-pink-400" />
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Relationship</h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {profileSettings.relationship}
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 text-center">
        <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="text-lg font-bold text-gray-900 dark:text-white">
            {canViewFriendsList ? user.following?.length || 0 : '—'}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">Following</div>
        </div>
        <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="text-lg font-bold text-gray-900 dark:text-white">
            {canViewFriendsList ? user.followers?.length || 0 : '—'}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">Followers</div>
        </div>
      </div>

      {/* Privacy Notice */}
      {viewerType !== 'self' && !canViewActivitiesList && (
        <div className="mx-auto max-w-xs p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-gray-500" />
            <span className="text-xs text-gray-600 dark:text-gray-400">
              This user has limited their profile visibility
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default PrivacyAwareProfile;
