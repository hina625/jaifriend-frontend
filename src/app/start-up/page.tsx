"use client";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { setupUserApi } from '@/utils/api';
import ResponsiveContainer from '@/components/ResponsiveContainer';

const users = [
  { name: "Daniel John", img: "/avatars/1.png.png" },
  { name: "Blanie William", img: "/avatars/2.png.png" },
  { name: "suicideboys ...", img: "/avatars/3.png.png" },
  { name: "Bruce Lester", img: "/avatars/4.png.png" },
  { name: "ProZenith", img: "/avatars/5.pmg.png" }, // This file exists with this name
  { name: "Amazing Indi...", img: "/avatars/6.png.png" },
  { name: "Mark Johnson", img: "/avatars/7.png.png" },
  { name: "Vouchr it", img: "/avatars/8.png.png" },
  { name: "themindfulm...", img: "/avatars/9.png.png" },
  { name: "rodwavemerch", img: "/avatars/10.png" },
  { name: "Rashmika Soni", img: "/avatars/11.png.png" },
  { name: "Jiten Patel", img: "/avatars/12.png.png" },
  { name: "unitecleansi...", img: "/avatars/13.png.png" },
  { name: "jer 123", img: "/avatars/14.png.png" },
  { name: "Chander Deep", img: "/avatars/15.png.png" },
  { name: "komalsharma", img: "/avatars/16.png.png" },
  { name: "RMC Elite", img: "/avatars/17.png.png" },
  { name: "mmmrssteamer", img: "/avatars/18.png.png" },
  { name: "Elisa Johnson", img: "/avatars/19.png.png" },
  { name: "Jenny Miller", img: "/avatars/20.png.png" },
];

const steps = ["Media", "Info", "Follow"];

export default function StartUpPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);
  const [fullName, setFullName] = useState("");
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Check if user is authenticated
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
    }
  }, [router]);

  const handleFinishSetup = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    console.log('Token being sent:', token); // Debug log

    setIsLoading(true);
    try {
      await setupUserApi(token, {
        avatar: selectedAvatar || '',
        fullName,
        bio,
        location
      });
      router.push('/dashboard');
    } catch (error: any) {
      console.error('Setup failed:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      alert(`Setup failed: ${error.response?.data?.message || error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const target = e.currentTarget;
    target.style.display = 'none';
    const nextSibling = target.nextSibling as HTMLElement;
    if (nextSibling) {
      nextSibling.style.display = 'flex';
    }
  };

  return (
    <ResponsiveContainer>
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-8">
        <div className="bg-white rounded-2xl shadow-xl flex w-full max-w-5xl overflow-hidden">
          {/* Left Panel */}
          <div className="bg-gray-200 flex flex-col justify-between items-center w-1/4 min-w-[180px] py-8 px-4">
            <div className="text-lg font-semibold text-gray-700 text-center mb-4">Follow our famous users.</div>
            <div className="w-full flex-1 flex items-end justify-center">
              <Image src="/illustration.svg" alt="illustration" width={120} height={60} />
            </div>
          </div>
          {/* Main Content */}
          <div className="flex-1 p-8">
            {/* Steps */}
            <div className="flex items-center justify-center gap-2 mb-6">
              {steps.map((s, i) => (
                <>
                  <button
                    key={s}
                    className={`px-4 py-1 rounded-full text-xs font-semibold transition-all duration-200 ${
                      step === i
                        ? "bg-orange-400 text-white"
                        : step > i
                        ? "bg-orange-200 text-orange-700"
                        : "bg-gray-100 text-gray-400"
                    }`}
                    onClick={() => setStep(i)}
                  >
                    {s}
                  </button>
                  {i < steps.length - 1 && <span className="text-gray-400">&#9654;</span>}
                </>
              ))}
            </div>

            {/* Step Content */}
            {step === 0 && (
              <div className="flex flex-col items-center justify-center min-h-[320px]">
                <div className="mb-6 text-gray-700 font-medium text-center">Upload your profile media (photo/avatar).</div>
                <div className="flex flex-col items-center gap-4">
                  <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border-2 border-blue-300">
                    {selectedAvatar ? (
                      <Image 
                        src={selectedAvatar} 
                        alt="avatar" 
                        width={96} 
                        height={96}
                        onError={handleImageError}
                      />
                    ) : null}
                    {!selectedAvatar && (
                      <span className="text-gray-400">No avatar selected</span>
                    )}
                  </div>
                  <div className="flex gap-2 flex-wrap justify-center">
                    {users.slice(0, 8).map((user, i) => (
                      <button
                        key={i}
                        className={`w-12 h-12 rounded-full overflow-hidden border-2 ${selectedAvatar === user.img ? "border-blue-500" : "border-gray-200"}`}
                        onClick={() => setSelectedAvatar(user.img)}
                        type="button"
                      >
                        <Image 
                          src={user.img} 
                          alt={user.name} 
                          width={48} 
                          height={48}
                          onError={handleImageError}
                        />
                        <div className="w-full h-full bg-gray-300 flex items-center justify-center text-xs text-gray-600" style={{display: 'none'}}>
                          {user.name.charAt(0)}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
                <button
                  className="mt-8 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded font-semibold text-sm"
                  onClick={() => setStep(1)}
                >
                  Next
                </button>
              </div>
            )}
            {step === 1 && (
              <div className="flex flex-col items-center justify-center min-h-[320px]">
                <div className="mb-6 text-gray-700 font-medium text-center">Fill in your info to continue.</div>
                <form className="w-full max-w-sm flex flex-col gap-4">
                  <input 
                    type="text" 
                    placeholder="Full Name" 
                    className="border rounded px-4 py-2 w-full"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                  <input 
                    type="text" 
                    placeholder="Bio" 
                    className="border rounded px-4 py-2 w-full"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                  />
                  <input 
                    type="text" 
                    placeholder="Location" 
                    className="border rounded px-4 py-2 w-full"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </form>
                <div className="flex gap-4 mt-8">
                  <button
                    className="bg-gray-200 text-gray-700 px-6 py-2 rounded font-semibold text-sm"
                    onClick={() => setStep(0)}
                  >
                    Back
                  </button>
                  <button
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded font-semibold text-sm"
                    onClick={() => setStep(2)}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
            {step === 2 && (
              <>
                <div className="text-center mb-6 text-gray-700 font-medium">Get latest activities from our popular users.</div>
                <div className="grid grid-cols-4 gap-4 mb-6">
                  {users.map((user, i) => (
                    <button key={i} className="flex flex-col items-center border border-gray-200 rounded-lg p-3 bg-white hover:bg-blue-50 transition">
                      <div className="w-14 h-14 rounded-full overflow-hidden bg-gray-100 mb-2 flex items-center justify-center">
                        <Image 
                          src={user.img} 
                          alt={user.name} 
                          width={56} 
                          height={56}
                          onError={handleImageError}
                        />
                        <div className="w-full h-full bg-gray-300 flex items-center justify-center text-xs text-gray-600" style={{display: 'none'}}>
                          {user.name.charAt(0)}
                        </div>
                      </div>
                      <span className="text-xs font-medium text-gray-700 truncate w-20 text-center">{user.name}</span>
                    </button>
                  ))}
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-gray-500 pl-1">Or <button 
                    className="underline hover:text-blue-600"
                    onClick={() => router.push('/dashboard')}
                  >Skip this step for now.</button></span>
                  <button 
                    onClick={handleFinishSetup}
                    disabled={isLoading}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? 'Setting up...' : 'Follow 20 & Finish'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </ResponsiveContainer>
  );
}
