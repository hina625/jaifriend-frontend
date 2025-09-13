"use client";
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Search, 
  MoreVertical, 
  Phone, 
  Video, 
  Info, 
  Send, 
  Paperclip, 
  Smile, 
  Image as ImageIcon,
  FileText,
  Mic,
  Check,
  CheckCheck,
  Clock,
  ArrowLeft,
  Filter,
  Archive,
  Trash2,
  Shield,
  AlertTriangle,
  Star,
  StarOff,
  X,
  MessageCircle
} from 'lucide-react';
import { useDarkMode } from '@/contexts/DarkModeContext';

interface Message {
  _id: string;
  content: string;
  sender: {
    _id: string;
    name: string;
    username: string;
    avatar?: string;
  };
  receiver: {
    _id: string;
    name: string;
    username: string;
    avatar?: string;
  };
  timestamp: string;
  isRead: boolean;
  type: 'text' | 'image' | 'file' | 'voice';
  media?: string;
  replyTo?: {
    _id: string;
    content: string;
    sender: {
      name: string;
    };
  };
}

interface Conversation {
  _id: string;
  participants: Array<{
    _id: string;
    name: string;
    username: string;
    avatar?: string;
    isOnline?: boolean;
  }>;
  lastMessage: Message;
  unreadCount: number;
  isPinned: boolean;
  isArchived: boolean;
  updatedAt: string;
}

export default function MessagesPage() {
  const router = useRouter();
  const { isDarkMode } = useDarkMode();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [showConversationMenu, setShowConversationMenu] = useState(false);
  const [showMessageMenu, setShowMessageMenu] = useState<string | null>(null);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  // Mock data for demonstration
  useEffect(() => {
    const mockConversations: Conversation[] = [
      {
        _id: '1',
        participants: [
          {
            _id: '1',
            name: 'John Doe',
            username: 'johndoe',
            avatar: '/default-avatar.svg',
            isOnline: true
          },
          {
            _id: '2',
            name: 'You',
            username: 'you',
            avatar: '/default-avatar.svg',
            isOnline: true
          }
        ],
        lastMessage: {
          _id: '1',
          content: 'Hey! How are you doing?',
          sender: {
            _id: '1',
            name: 'John Doe',
            username: 'johndoe'
          },
          receiver: {
            _id: '2',
            name: 'You',
            username: 'you'
          },
          timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
          isRead: false,
          type: 'text'
        },
        unreadCount: 2,
        isPinned: true,
        isArchived: false,
        updatedAt: new Date(Date.now() - 2 * 60 * 1000).toISOString()
      },
      {
        _id: '2',
        participants: [
          {
            _id: '3',
            name: 'Jane Smith',
            username: 'janesmith',
            avatar: '/default-avatar.svg',
            isOnline: false
          },
          {
            _id: '2',
            name: 'You',
            username: 'you',
            avatar: '/default-avatar.svg',
            isOnline: true
          }
        ],
        lastMessage: {
          _id: '2',
          content: 'Thanks for the help!',
          sender: {
            _id: '2',
            name: 'You',
            username: 'you'
          },
          receiver: {
            _id: '3',
            name: 'Jane Smith',
            username: 'janesmith'
          },
          timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          isRead: true,
          type: 'text'
        },
        unreadCount: 0,
        isPinned: false,
        isArchived: false,
        updatedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString()
      },
      {
        _id: '3',
        participants: [
          {
            _id: '4',
            name: 'Mike Johnson',
            username: 'mikej',
            avatar: '/default-avatar.svg',
            isOnline: true
          },
          {
            _id: '2',
            name: 'You',
            username: 'you',
            avatar: '/default-avatar.svg',
            isOnline: true
          }
        ],
        lastMessage: {
          _id: '3',
          content: 'Can we meet tomorrow?',
          sender: {
            _id: '4',
            name: 'Mike Johnson',
            username: 'mikej'
          },
          receiver: {
            _id: '2',
            name: 'You',
            username: 'you'
          },
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          isRead: false,
          type: 'text'
        },
        unreadCount: 1,
        isPinned: false,
        isArchived: false,
        updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
      }
    ];

    setConversations(mockConversations);
    setLoading(false);
  }, []);

  // Mock messages for selected conversation
  useEffect(() => {
    if (selectedConversation) {
      const mockMessages: Message[] = [
        {
          _id: '1',
          content: 'Hey! How are you doing?',
          sender: {
            _id: selectedConversation.participants[0]._id,
            name: selectedConversation.participants[0].name,
            username: selectedConversation.participants[0].username
          },
          receiver: {
            _id: '2',
            name: 'You',
            username: 'you'
          },
          timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
          isRead: true,
          type: 'text'
        },
        {
          _id: '2',
          content: 'I\'m doing great! Thanks for asking. How about you?',
          sender: {
            _id: '2',
            name: 'You',
            username: 'you'
          },
          receiver: {
            _id: selectedConversation.participants[0]._id,
            name: selectedConversation.participants[0].name,
            username: selectedConversation.participants[0].username
          },
          timestamp: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
          isRead: true,
          type: 'text'
        },
        {
          _id: '3',
          content: 'Pretty good! Just working on some new projects.',
          sender: {
            _id: selectedConversation.participants[0]._id,
            name: selectedConversation.participants[0].name,
            username: selectedConversation.participants[0].username
          },
          receiver: {
            _id: '2',
            name: 'You',
            username: 'you'
          },
          timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
          isRead: true,
          type: 'text'
        },
        {
          _id: '4',
          content: 'That sounds exciting! What kind of projects?',
          sender: {
            _id: '2',
            name: 'You',
            username: 'you'
          },
          receiver: {
            _id: selectedConversation.participants[0]._id,
            name: selectedConversation.participants[0].name,
            username: selectedConversation.participants[0].username
          },
          timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
          isRead: false,
          type: 'text'
        }
      ];
      setMessages(mockMessages);
    }
  }, [selectedConversation]);

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || sending) return;

    setSending(true);
    
    // Simulate sending message
    const message: Message = {
      _id: Date.now().toString(),
      content: newMessage,
      sender: {
        _id: '2',
        name: 'You',
        username: 'you'
      },
      receiver: {
        _id: selectedConversation.participants[0]._id,
        name: selectedConversation.participants[0].name,
        username: selectedConversation.participants[0].username
      },
      timestamp: new Date().toISOString(),
      isRead: false,
      type: 'text'
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');
    
    // Update conversation last message
    setConversations(prev => prev.map(conv => 
      conv._id === selectedConversation._id 
        ? { ...conv, lastMessage: message, updatedAt: new Date().toISOString() }
        : conv
    ));

    setSending(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 60 * 1000) return 'Just now';
    if (diff < 60 * 60 * 1000) return `${Math.floor(diff / (60 * 1000))}m`;
    if (diff < 24 * 60 * 60 * 1000) return `${Math.floor(diff / (60 * 60 * 1000))}h`;
    if (diff < 7 * 24 * 60 * 60 * 1000) return `${Math.floor(diff / (24 * 60 * 60 * 1000))}d`;
    
    return date.toLocaleDateString();
  };

  const getOtherParticipant = (conversation: Conversation) => {
    return conversation.participants.find(p => p._id !== '2') || conversation.participants[0];
  };

  const filteredConversations = conversations.filter(conv => {
    const otherParticipant = getOtherParticipant(conv);
    return otherParticipant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
           otherParticipant.username.toLowerCase().includes(searchQuery.toLowerCase());
  });

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Loading messages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Sidebar */}
      <div className={`w-full max-w-md border-r transition-colors duration-200 ${
        isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      } ${selectedConversation ? 'hidden lg:block' : 'block'}`}>
        {/* Header */}
        <div className={`p-4 border-b transition-colors duration-200 ${
          isDarkMode ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <h1 className={`text-xl font-semibold transition-colors duration-200 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Messages
            </h1>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowSearch(!showSearch)}
                className={`p-2 rounded-lg transition-colors duration-200 ${
                  isDarkMode 
                    ? 'hover:bg-gray-700 text-gray-300' 
                    : 'hover:bg-gray-100 text-gray-600'
                }`}
              >
                <Search className="w-5 h-5" />
              </button>
              <button
                className={`p-2 rounded-lg transition-colors duration-200 ${
                  isDarkMode 
                    ? 'hover:bg-gray-700 text-gray-300' 
                    : 'hover:bg-gray-100 text-gray-600'
                }`}
              >
                <MoreVertical className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Search Bar */}
          {showSearch && (
            <div className="relative">
              <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-400'
              }`} />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 rounded-lg border-0 focus:ring-2 focus:ring-blue-500 outline-none text-sm transition-colors duration-200 ${
                  isDarkMode 
                    ? 'bg-gray-700 text-white placeholder-gray-400' 
                    : 'bg-gray-100 text-gray-900 placeholder-gray-500'
                }`}
              />
            </div>
          )}
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          {filteredConversations.length > 0 ? (
            <div className="space-y-1 p-2">
              {filteredConversations.map((conversation) => {
                const otherParticipant = getOtherParticipant(conversation);
                const isSelected = selectedConversation?._id === conversation._id;
                
                return (
                  <div
                    key={conversation._id}
                    onClick={() => setSelectedConversation(conversation)}
                    className={`p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                      isSelected
                        ? isDarkMode
                          ? 'bg-blue-900/30 border border-blue-700'
                          : 'bg-blue-50 border border-blue-200'
                        : isDarkMode
                          ? 'hover:bg-gray-700'
                          : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {/* Avatar */}
                      <div className="relative">
                        <img
                          src={otherParticipant.avatar || '/default-avatar.svg'}
                          alt={otherParticipant.name}
                          className="w-12 h-12 rounded-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = '/default-avatar.svg';
                          }}
                        />
                        {otherParticipant.isOnline && (
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className={`font-medium truncate transition-colors duration-200 ${
                            isDarkMode ? 'text-white' : 'text-gray-900'
                          }`}>
                            {otherParticipant.name}
                          </h3>
                          <span className={`text-xs transition-colors duration-200 ${
                            isDarkMode ? 'text-gray-400' : 'text-gray-500'
                          }`}>
                            {formatTime(conversation.updatedAt)}
                          </span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <p className={`text-sm truncate transition-colors duration-200 ${
                            conversation.unreadCount > 0
                              ? isDarkMode
                                ? 'text-white font-medium'
                                : 'text-gray-900 font-medium'
                              : isDarkMode
                                ? 'text-gray-300'
                                : 'text-gray-600'
                          }`}>
                            {conversation.lastMessage.content}
                          </p>
                          
                          {conversation.unreadCount > 0 && (
                            <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-medium ${
                              isDarkMode ? 'bg-blue-500 text-white' : 'bg-blue-500 text-white'
                            }`}>
                              {conversation.unreadCount > 9 ? '9+' : conversation.unreadCount}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
                isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
              }`}>
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className={`text-lg font-medium mb-2 transition-colors duration-200 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                No conversations found
              </h3>
              <p className={`text-sm transition-colors duration-200 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>
                Try searching with different keywords
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Chat Area */}
      {selectedConversation ? (
        <div className="flex-1 flex flex-col">
          {/* Chat Header */}
          <div className={`p-4 border-b transition-colors duration-200 ${
            isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSelectedConversation(null)}
                  className="lg:hidden p-2 rounded-lg transition-colors duration-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                
                <div className="relative">
                  <img
                    src={getOtherParticipant(selectedConversation).avatar || '/default-avatar.svg'}
                    alt={getOtherParticipant(selectedConversation).name}
                    className="w-10 h-10 rounded-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = '/default-avatar.svg';
                    }}
                  />
                  {getOtherParticipant(selectedConversation).isOnline && (
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                  )}
                </div>
                
                <div>
                  <h2 className={`font-semibold transition-colors duration-200 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    {getOtherParticipant(selectedConversation).name}
                  </h2>
                  <p className={`text-sm transition-colors duration-200 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    {getOtherParticipant(selectedConversation).isOnline ? 'Online' : 'Last seen recently'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button className={`p-2 rounded-lg transition-colors duration-200 ${
                  isDarkMode 
                    ? 'hover:bg-gray-700 text-gray-300' 
                    : 'hover:bg-gray-100 text-gray-600'
                }`}>
                  <Phone className="w-5 h-5" />
                </button>
                <button className={`p-2 rounded-lg transition-colors duration-200 ${
                  isDarkMode 
                    ? 'hover:bg-gray-700 text-gray-300' 
                    : 'hover:bg-gray-100 text-gray-600'
                }`}>
                  <Video className="w-5 h-5" />
                </button>
                <button className={`p-2 rounded-lg transition-colors duration-200 ${
                  isDarkMode 
                    ? 'hover:bg-gray-700 text-gray-300' 
                    : 'hover:bg-gray-100 text-gray-600'
                }`}>
                  <Info className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => {
              const isOwn = message.sender._id === '2';
              const isRead = message.isRead;
              
              return (
                <div
                  key={message._id}
                  className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl transition-colors duration-200 ${
                    isOwn
                      ? isDarkMode
                        ? 'bg-blue-600 text-white'
                        : 'bg-blue-500 text-white'
                      : isDarkMode
                        ? 'bg-gray-700 text-white'
                        : 'bg-gray-200 text-gray-900'
                  }`}>
                    <p className="text-sm">{message.content}</p>
                    <div className={`flex items-center justify-end gap-1 mt-1 ${
                      isOwn ? 'text-blue-100' : isDarkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      <span className="text-xs">
                        {new Date(message.timestamp).toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </span>
                      {isOwn && (
                        <div className="ml-1">
                          {isRead ? (
                            <CheckCheck className="w-3 h-3" />
                          ) : (
                            <Check className="w-3 h-3" />
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            
            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div className={`px-4 py-2 rounded-2xl transition-colors duration-200 ${
                  isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
                }`}>
                  <div className="flex items-center gap-1">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                    <span className={`text-xs ml-2 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      {getOtherParticipant(selectedConversation).name} is typing...
                    </span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div className={`p-4 border-t transition-colors duration-200 ${
            isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            {/* Reply Preview */}
            {replyingTo && (
              <div className={`mb-3 p-3 rounded-lg border-l-4 border-blue-500 ${
                isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
              }`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-xs font-medium ${
                      isDarkMode ? 'text-blue-300' : 'text-blue-600'
                    }`}>
                      Replying to {replyingTo.sender.name}
                    </p>
                    <p className={`text-sm truncate ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      {replyingTo.content}
                    </p>
                  </div>
                  <button
                    onClick={() => setReplyingTo(null)}
                    className={`p-1 rounded ${
                      isDarkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-200'
                    }`}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            <div className="flex items-end gap-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                className={`p-2 rounded-lg transition-colors duration-200 ${
                  isDarkMode 
                    ? 'hover:bg-gray-700 text-gray-300' 
                    : 'hover:bg-gray-100 text-gray-600'
                }`}
              >
                <Paperclip className="w-5 h-5" />
              </button>
              
              <button
                onClick={() => imageInputRef.current?.click()}
                className={`p-2 rounded-lg transition-colors duration-200 ${
                  isDarkMode 
                    ? 'hover:bg-gray-700 text-gray-300' 
                    : 'hover:bg-gray-100 text-gray-600'
                }`}
              >
                <ImageIcon className="w-5 h-5" />
              </button>

              <div className="flex-1 relative">
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type a message..."
                  className={`w-full px-4 py-3 pr-12 rounded-2xl border-0 resize-none focus:ring-2 focus:ring-blue-500 outline-none transition-colors duration-200 ${
                    isDarkMode 
                      ? 'bg-gray-700 text-white placeholder-gray-400' 
                      : 'bg-gray-100 text-gray-900 placeholder-gray-500'
                  }`}
                  rows={1}
                  style={{ minHeight: '44px', maxHeight: '120px' }}
                />
                
                <button className={`absolute right-2 top-1/2 transform -translate-y-1/2 p-2 rounded-lg transition-colors duration-200 ${
                  isDarkMode 
                    ? 'hover:bg-gray-600 text-gray-300' 
                    : 'hover:bg-gray-200 text-gray-600'
                }`}>
                  <Smile className="w-5 h-5" />
                </button>
              </div>

              <button
                onClick={handleSendMessage}
                disabled={!newMessage.trim() || sending}
                className={`p-2 rounded-lg transition-colors duration-200 ${
                  newMessage.trim() && !sending
                    ? 'bg-blue-500 hover:bg-blue-600 text-white'
                    : isDarkMode
                      ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                {sending ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* Hidden file inputs */}
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept=".pdf,.doc,.docx,.txt"
            onChange={(e) => {
              // Handle file upload
              console.log('File selected:', e.target.files?.[0]);
            }}
          />
          <input
            ref={imageInputRef}
            type="file"
            className="hidden"
            accept="image/*"
            onChange={(e) => {
              // Handle image upload
              console.log('Image selected:', e.target.files?.[0]);
            }}
          />
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
              isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
            }`}>
              <MessageCircle className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className={`text-lg font-medium mb-2 transition-colors duration-200 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Select a conversation
            </h3>
            <p className={`text-sm transition-colors duration-200 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Choose a conversation from the sidebar to start messaging
            </p>
          </div>
        </div>
      )}
    </div>
  );
}