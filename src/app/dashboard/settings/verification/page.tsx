"use client";
import React, { useState, useRef } from 'react';

interface VerificationData {
  username: string;
  message: string;
  passportDocument: File | null;
  personalPicture: File | null;
}

const ProfileVerificationPage = () => {
  const [loading, setLoading] = useState(false);
  const [verificationData, setVerificationData] = useState<VerificationData>({
    username: '',
    message: '',
    passportDocument: null,
    personalPicture: null
  });

  const passportInputRef = useRef<HTMLInputElement>(null);
  const pictureInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (field: 'username' | 'message', value: string) => {
    setVerificationData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePassportUpload = () => {
    passportInputRef.current?.click();
  };

  const handlePictureUpload = () => {
    pictureInputRef.current?.click();
  };

  const handlePassportChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        alert('Document file must be less than 10MB');
        return;
      }
      setVerificationData(prev => ({
        ...prev,
        passportDocument: file
      }));
    }
  };

  const handlePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        alert('Picture file must be less than 5MB');
        return;
      }
      setVerificationData(prev => ({
        ...prev,
        personalPicture: file
      }));
    }
  };

  const handleSend = async () => {
    // Basic validation
    if (!verificationData.username.trim()) {
      alert('Please enter your username');
      return;
    }

    if (!verificationData.passportDocument) {
      alert('Please upload a copy of your passport or ID card');
      return;
    }

    if (!verificationData.personalPicture) {
      alert('Please upload your personal picture');
      return;
    }

    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log('Verification request sent:', {
        username: verificationData.username,
        message: verificationData.message,
        hasPassport: !!verificationData.passportDocument,
        hasPicture: !!verificationData.personalPicture
      });
      
      alert('Verification request sent successfully! We will review your submission and get back to you within 2-3 business days.');
      
      // Reset form
      setVerificationData({
        username: '',
        message: '',
        passportDocument: null,
        personalPicture: null
      });
    } catch (error) {
      console.error('Error sending verification request:', error);
      alert('Failed to send verification request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <h1 className="text-2xl font-semibold text-gray-900 mb-8">Verification of the profile!</h1>
        
        <div className="space-y-6">
          {/* Username */}
          <div>
            <input
              type="text"
              value={verificationData.username}
              onChange={(e) => handleInputChange('username', e.target.value)}
              placeholder="Username"
              className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500"
            />
          </div>

          {/* Message */}
          <div>
            <textarea
              value={verificationData.message}
              onChange={(e) => handleInputChange('message', e.target.value)}
              placeholder="Message"
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500 resize-vertical"
            />
          </div>

          {/* Upload Documents Section */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Upload documents</h3>
            <p className="text-blue-600 text-sm mb-4">
              Please upload a photo with your passport / ID & your distinct photo
            </p>

            <div className="space-y-4">
              {/* Passport/ID Upload */}
              <div
                onClick={handlePassportUpload}
                className="flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
              >
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-gray-900 font-medium">
                    {verificationData.passportDocument 
                      ? verificationData.passportDocument.name 
                      : 'Copy of your passport or ID card'
                    }
                  </p>
                  {verificationData.passportDocument && (
                    <p className="text-sm text-gray-500">
                      {(verificationData.passportDocument.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  )}
                </div>
                {verificationData.passportDocument && (
                  <div className="text-green-500">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </div>

              {/* Personal Picture Upload */}
              <div
                onClick={handlePictureUpload}
                className="flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
              >
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-gray-900 font-medium">
                    {verificationData.personalPicture 
                      ? verificationData.personalPicture.name 
                      : 'Your personal picture'
                    }
                  </p>
                  {verificationData.personalPicture && (
                    <p className="text-sm text-gray-500">
                      {(verificationData.personalPicture.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  )}
                </div>
                {verificationData.personalPicture && (
                  <div className="text-green-500">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Hidden File Inputs */}
          <input
            ref={passportInputRef}
            type="file"
            accept="image/*,.pdf"
            onChange={handlePassportChange}
            className="hidden"
          />
          <input
            ref={pictureInputRef}
            type="file"
            accept="image/*"
            onChange={handlePictureChange}
            className="hidden"
          />

          {/* Guidelines */}
          <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <h4 className="text-sm font-medium text-yellow-900 mb-2">Verification Guidelines:</h4>
            <ul className="text-sm text-yellow-800 space-y-1">
              <li>• Upload clear, high-quality photos</li>
              <li>• Ensure all text in documents is readable</li>
              <li>• Personal picture should clearly show your face</li>
              <li>• Documents: max 10MB, Pictures: max 5MB</li>
              <li>• Supported formats: JPG, PNG, PDF (for documents)</li>
            </ul>
          </div>
        </div>

        {/* Send Button */}
        <div className="flex justify-center mt-8">
          <button
            onClick={handleSend}
            disabled={loading}
            className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-400 text-white px-8 py-3 rounded-md font-medium transition-colors duration-200 disabled:cursor-not-allowed"
          >
            {loading ? 'Sending...' : 'Send'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileVerificationPage;