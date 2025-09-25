'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDarkMode } from '../../contexts/DarkModeContext';


interface RegisterForm {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  gender: string;
  agreeToTerms: boolean;
}

interface RegisterErrors {
  username?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  agreeToTerms?: string;
}

interface PopupState {
  isOpen: boolean;
  type: 'success' | 'error';
  title: string;
  message: string;
}

export default function Register(): React.ReactElement {
  const { isDarkMode } = useDarkMode();
  const [formData, setFormData] = useState<RegisterForm>({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    gender: 'Female',
    agreeToTerms: false
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [mounted, setMounted] = useState<boolean>(false);
  const [errors, setErrors] = useState<RegisterErrors>({});
  const [popup, setPopup] = useState<PopupState>({
    isOpen: false,
    type: 'success',
    title: '',
    message: ''
  });
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  const showPopup = (type: 'success' | 'error', title: string, message: string) => {
    setPopup({
      isOpen: true,
      type,
      title,
      message
    });
  };

  const closePopup = () => {
    setPopup(prev => ({ ...prev, isOpen: false }));
    if (popup.type === 'success') {
      // Redirect to start-up page for profile setup
      router.push('/start-up');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>): void => {
    const target = e.target;
    const { name, value, type } = target;

    const checked = target instanceof HTMLInputElement ? target.checked : false;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    if (errors[name as keyof RegisterErrors]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = (): RegisterErrors => {
    const newErrors: RegisterErrors = {};
    
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = 'You must agree to the terms';
    }
    
    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    const newErrors = validateForm();

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
              const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://jaifriend-backend.hgdjlive.com'}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.username,
          username: formData.username,
          email: formData.email,
          password: formData.password,
          gender: formData.gender
        })
      });
      const data = await response.json();
      setIsLoading(false);

      if (response.ok) {
        localStorage.setItem('token', data.token);
        showPopup('success', 'Registration Successful!', 'Your account has been created successfully. You will be redirected to complete your profile setup.');
      } else {
        showPopup('error', 'Registration Failed', data.message || 'Something went wrong. Please try again.');
      }
    } catch (error) {
      setIsLoading(false);
      showPopup('error', 'Network Error', 'Unable to connect to the server. Please check your internet connection and try again.');
    }
  };

  if (!mounted) {
    return <div></div>;
  }

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-200 ${
      isDarkMode ? 'bg-gray-900' : 'bg-[#f8f9fa]'
    }`}>
      {/* Custom Popup Modal */}
      {popup.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`rounded-2xl shadow-2xl max-w-md w-full mx-4 transform transition-all duration-300 scale-100 ${
            isDarkMode ? 'bg-gray-800' : 'bg-white'
          }`}>
            <div className="p-6">
              {/* Icon */}
              <div className="flex items-center justify-center mb-4">
                {popup.type === 'success' ? (
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                  </div>
                ) : (
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                  </div>
                )}
              </div>
              
              {/* Content */}
              <div className="text-center">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{popup.title}</h3>
                <p className="text-gray-600 mb-6">{popup.message}</p>
                
                {/* Button */}
                <button
                  onClick={closePopup}
                  className={`w-full py-3 px-4 rounded-xl font-medium transition-all duration-200 ${
                    popup.type === 'success'
                      ? 'bg-green-500 hover:bg-green-600 text-white'
                      : 'bg-red-500 hover:bg-red-600 text-white'
                  }`}
                >
                  {popup.type === 'success' ? 'Continue' : 'Try Again'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navbar */}
      <nav className="flex justify-between items-center px-8 py-4">
        <div className="flex items-center gap-2">
          <div className="bg-blue-100 rounded-full p-2">
            <Image src="/globe.svg" alt="logo" width={32} height={32} />
          </div>
          <span className="text-2xl font-bold text-blue-700">jaifriend</span>
        </div>
        <Link href="/" className="bg-blue-600 text-white px-6 py-2 rounded font-semibold hover:bg-blue-700 transition">
          Login
        </Link>
      </nav>

      <main className="flex flex-col items-center justify-center flex-1">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100">
            <h1 className="text-2xl font-bold text-gray-800 mb-8 text-left">Sign up</h1>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-blue-500 mb-2">
                  Username
                </label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  className={`w-full px-0 py-3 border-0 border-b-2 bg-transparent focus:outline-none focus:ring-0 transition-all duration-300 text-gray-700 placeholder-gray-400 ${
                    errors.username ? 'border-red-500' : 'border-blue-500 focus:border-blue-600'
                  }`}
                  placeholder=""
                  required
                />
                {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username}</p>}
              </div>

              <div>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full px-0 py-3 border-0 border-b-2 bg-transparent focus:outline-none focus:ring-0 transition-all duration-300 text-gray-700 placeholder-gray-500 ${
                    errors.email ? 'border-red-500' : 'border-gray-300 focus:border-blue-500'
                  }`}
                  placeholder="E-mail address"
                  required
                />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
              </div>

              <div>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`w-full px-0 py-3 border-0 border-b-2 bg-transparent focus:outline-none focus:ring-0 transition-all duration-300 text-gray-700 placeholder-gray-500 ${
                    errors.password ? 'border-red-500' : 'border-gray-300 focus:border-blue-500'
                  }`}
                  placeholder="Password"
                  required
                />
                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
              </div>

              <div>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className={`w-full px-0 py-3 border-0 border-b-2 bg-transparent focus:outline-none focus:ring-0 transition-all duration-300 text-gray-700 placeholder-gray-500 ${
                    errors.confirmPassword ? 'border-red-500' : 'border-gray-300 focus:border-blue-500'
                  }`}
                  placeholder="Confirm Password"
                  required
                />
                {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
              </div>

              <div>
                <label htmlFor="gender" className="block text-sm font-medium text-gray-600 mb-2">
                  Gender
                </label>
                <select
                  id="gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  className="w-full px-0 py-3 border-0 border-b-2 border-gray-300 bg-transparent focus:outline-none focus:ring-0 focus:border-blue-500 transition-all duration-300 text-gray-700"
                >
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                  <option value="Other">Other</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
              </div>

              <div className="flex items-start space-x-3 pt-4">
                <input
                  type="checkbox"
                  id="agreeToTerms"
                  name="agreeToTerms"
                  checked={formData.agreeToTerms}
                  onChange={handleInputChange}
                  className={`w-4 h-4 mt-1 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 ${
                    errors.agreeToTerms ? 'border-red-500' : ''
                  }`}
                />
                <label htmlFor="agreeToTerms" className="text-sm text-gray-600 leading-relaxed">
                  By creating your account, you agree to our{' '}
                  <a href="#" className="text-blue-500 hover:text-blue-600 underline">
                    Terms of Use
                  </a>{' '}
                  &{' '}
                  <a href="#" className="text-blue-500 hover:text-blue-600 underline">
                    Privacy Policy
                  </a>
                </label>
              </div>
              {errors.agreeToTerms && <p className="text-red-500 text-xs">{errors.agreeToTerms}</p>}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:transform-none shadow-lg hover:shadow-xl text-base mt-8"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Creating Account...
                  </div>
                ) : (
                  "Let's Go !"
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link href="/" className="text-blue-500 hover:text-blue-600 font-medium underline">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center text-gray-500 text-sm py-6 border-t bg-white">
        <div className="mb-2">
          © 2025 Jaifriend · Terms of Use · Privacy Policy · Contact Us · About · Directory · Forum · 🌐 Language
        </div>
      </footer>
    </div>
  );
}
