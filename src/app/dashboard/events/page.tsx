"use client";
import React, { useState, useEffect } from 'react';
import { Calendar, Users, Plus, Search, Upload, ArrowLeft, Menu, X } from 'lucide-react';
import Popup, { PopupState } from '../../../components/Popup';

interface FormData {
  eventName: string;
  eventDescription: string;
  location: string;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
}

interface Tab {
  name: string;
  href: string;
}

interface OtherEventsPageProps {
  pageTitle: string;
}

const EventManagement: React.FC = () => {
  const [currentRoute, setCurrentRoute] = useState<string>('/events');
  const [routeHistory, setRouteHistory] = useState<string[]>(['/events']);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [formData, setFormData] = useState<FormData>({
    eventName: '',
    eventDescription: '',
    location: '',
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: ''
  });
  const [image, setImage] = useState<File | null>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [editingEvent, setEditingEvent] = useState<any>(null);
  const [popup, setPopup] = useState<PopupState>({
    isOpen: false,
    type: 'success',
    title: '',
    message: ''
  });

  useEffect(() => {
    if (currentRoute === '/events') {
      fetch('http://localhost:5000/api/events')
        .then(res => res.json())
        .then(data => setEvents(data))
        .catch(() => setEvents([
          // Mock data for demonstration
          {
            _id: '1',
            eventName: 'Tech Conference 2024',
            eventDescription: 'Annual technology conference featuring the latest innovations',
            location: 'Convention Center, New York',
            startDate: '2024-08-15',
            startTime: '09:00',
            endDate: '2024-08-17',
            endTime: '18:00',
            imageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=300&fit=crop'
          },
          {
            _id: '2', 
            eventName: 'Music Festival',
            eventDescription: 'Three days of amazing music and entertainment',
            location: 'Central Park, New York',
            startDate: '2024-09-01',
            startTime: '12:00',
            endDate: '2024-09-03',
            endTime: '23:00',
            imageUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=300&fit=crop'
          }
        ]));
    }
  }, [currentRoute]);

  const tabs: Tab[] = [
    { name: 'My events', href: '/events' },
    { name: 'Browse Events', href: '/events/browse' }, 
    { name: 'Events Going', href: '/events/going' },
    { name: 'Invited', href: '/events/invited' },
    { name: 'Events Interested', href: '/events/interested' },
    { name: 'Past Events', href: '/events/past' }
  ];

  // Navigation functions
  const navigateTo = (route: string): void => {
    setCurrentRoute(route);
    setRouteHistory(prev => [...prev, route]);
    setMobileMenuOpen(false);
  };

  const goBack = (): void => {
    if (routeHistory.length > 1) {
      const newHistory = [...routeHistory];
      newHistory.pop();
      const previousRoute = newHistory[newHistory.length - 1];
      setCurrentRoute(previousRoute);
      setRouteHistory(newHistory);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImage(e.target.files?.[0] || null);
  };

  const showPopup = (type: 'success' | 'error' | 'info' | 'warning', title: string, message: string) => {
    setPopup({
      isOpen: true,
      type,
      title,
      message
    });
  };

  const closePopup = () => {
    setPopup(prev => ({ ...prev, isOpen: false }));
  };

  const handleSubmit = async () => {
    try {
      const form = new FormData();
      form.append('eventName', formData.eventName);
      form.append('eventDescription', formData.eventDescription);
      form.append('location', formData.location);
      form.append('startDate', formData.startDate);
      form.append('startTime', formData.startTime);
      form.append('endDate', formData.endDate);
      form.append('endTime', formData.endTime);
      if (image) form.append('image', image);

      const res = await fetch('http://localhost:5000/api/events', {
        method: 'POST',
        body: form
      });
      if (res.ok) {
        showPopup('success', 'Event Created!', 'Event created successfully!');
        navigateTo('/events');
        setFormData({
          eventName: '',
          eventDescription: '',
          location: '',
          startDate: '',
          startTime: '',
          endDate: '',
          endTime: ''
        });
        setImage(null);
        // Refresh events list
        fetch('http://localhost:5000/api/events')
          .then(res => res.json())
          .then(data => setEvents(data))
          .catch(() => setEvents([]));
      } else {
        const data = await res.json();
        showPopup('error', 'Error', 'Error: ' + data.error);
      }
    } catch (err) {
      showPopup('error', 'Network Error', 'Network error occurred');
    }
  };

  const handleDelete = async (id: string) => {
    showPopup('warning', 'Confirm Delete', 'Are you sure you want to delete this event?');
    // Note: In a real app, you'd want to handle the confirmation properly
    try {
      await fetch(`http://localhost:5000/api/events/${id}`, { method: 'DELETE' });
      // Refresh events list
      fetch('http://localhost:5000/api/events')
        .then(res => res.json())
        .then(data => setEvents(data))
        .catch(() => setEvents([]));
      showPopup('success', 'Event Deleted!', 'Event deleted successfully!');
    } catch (err) {
      showPopup('error', 'Network Error', 'Network error occurred');
    }
  };

  const handleEdit = (event: any) => {
    setEditingEvent(event);
    setFormData({
      eventName: event.eventName,
      eventDescription: event.eventDescription,
      location: event.location,
      startDate: event.startDate,
      startTime: event.startTime,
      endDate: event.endDate,
      endTime: event.endTime
    });
    setImage(null);
    navigateTo('/events/edit');
  };

  const handleUpdate = async () => {
    if (!editingEvent) return;
    try {
      const form = new FormData();
      form.append('eventName', formData.eventName);
      form.append('eventDescription', formData.eventDescription);
      form.append('location', formData.location);
      form.append('startDate', formData.startDate);
      form.append('startTime', formData.startTime);
      form.append('endDate', formData.endDate);
      form.append('endTime', formData.endTime);
      if (image) form.append('image', image);
      const res = await fetch(`http://localhost:5000/api/events/${editingEvent._id}`, {
        method: 'PUT',
        body: form
      });
      if (res.ok) {
        showPopup('success', 'Event Updated!', 'Event updated successfully!');
        setEditingEvent(null);
        navigateTo('/events');
        setFormData({
          eventName: '',
          eventDescription: '',
          location: '',
          startDate: '',
          startTime: '',
          endDate: '',
          endTime: ''
        });
        setImage(null);
        // Refresh events list
        fetch('http://localhost:5000/api/events')
          .then(res => res.json())
          .then(data => setEvents(data))
          .catch(() => setEvents([]));
      } else {
        const data = await res.json();
        showPopup('error', 'Error', 'Error: ' + data.error);
      }
    } catch (err) {
      showPopup('error', 'Network Error', 'Network error occurred');
    }
  };

  // Get current active tab
  const getCurrentTab = (): string => {
    const activeTab = tabs.find(tab => tab.href === currentRoute);
    return activeTab ? activeTab.name : 'My events';
  };

  // Shared header component
  const Header: React.FC = () => (
    <div className="flex justify-between items-center mb-6 sm:mb-8">
      <h1 className="text-2xl sm:text-3xl font-semibold text-gray-800">Events</h1>
      <div className="flex items-center gap-2 sm:gap-3">
        <button className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200 transition-colors">
          <Search className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
        </button>
        <button className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200 transition-colors">
          <Users className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
        </button>
        <button 
          className="sm:hidden w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200 transition-colors"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="w-4 h-4 text-gray-600" /> : <Menu className="w-4 h-4 text-gray-600" />}
        </button>
      </div>
    </div>
  );

  // Shared tabs component
  const TabsNavigation: React.FC = () => (
    <>
      {/* Desktop Tabs */}
      <div className="hidden sm:block border-b border-gray-200 mb-6 sm:mb-10">
        <div className="flex space-x-0 overflow-x-auto">
          {tabs.map((tab: Tab) => (
            <button 
              key={tab.name} 
              onClick={() => navigateTo(tab.href)}
              className={`px-3 sm:px-5 py-3 text-xs sm:text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                getCurrentTab() === tab.name
                  ? 'text-blue-600 border-blue-600'
                  : 'text-gray-500 border-transparent hover:text-blue-600'
              }`}
            >
              {tab.name}
            </button>
          ))}
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 sm:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="fixed top-0 right-0 h-full w-64 bg-white shadow-lg z-50 sm:hidden">
            <div className="p-4 border-b">
              <h3 className="font-semibold text-gray-800">Navigation</h3>
            </div>
            <div className="py-2">
              {tabs.map((tab: Tab) => (
                <button 
                  key={tab.name} 
                  onClick={() => navigateTo(tab.href)}
                  className={`w-full text-left px-4 py-3 text-sm transition-colors ${
                    getCurrentTab() === tab.name
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {tab.name}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </>
  );

  // Main events page
  const MainEventsPage: React.FC = () => (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 bg-white min-h-screen">
      {/* Popup Modal */}
      <Popup popup={popup} onClose={closePopup} />
      <Header />
      <TabsNavigation />
      
      <div className="mb-6">
        {events.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 text-base sm:text-lg mb-4">No events to show</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {events.map(event => (
              <div key={event._id} className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                {event.imageUrl && (
                  <img 
                    src={event.imageUrl} 
                    alt="Event" 
                    className="w-full h-40 sm:h-48 object-cover" 
                  />
                )}
                <div className="p-4">
                  <h3 className="font-bold text-lg mb-2 line-clamp-2">{event.eventName}</h3>
                  <p className="text-gray-600 text-sm mb-2 line-clamp-3">{event.eventDescription}</p>
                  <p className="text-gray-500 text-sm mb-2">📍 {event.location}</p>
                  <p className="text-xs text-gray-400 mb-3">
                    {new Date(event.startDate).toLocaleDateString()} {event.startTime} - {new Date(event.endDate).toLocaleDateString()} {event.endTime}
                  </p>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleEdit(event)} 
                      className="flex-1 px-3 py-2 bg-yellow-400 text-white rounded text-sm hover:bg-yellow-500 transition-colors"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDelete(event._id)} 
                      className="flex-1 px-3 py-2 bg-red-500 text-white rounded text-sm hover:bg-red-600 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Event CTA */}
      <div className="text-center py-12 sm:py-20">
        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-red-500 rounded-2xl mx-auto mb-4 sm:mb-6 flex items-center justify-center">
          <Calendar className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
        </div>
        <button
          onClick={() => navigateTo('/events/create')}
          className="bg-blue-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-600 transition-colors"
        >
          Create Event
        </button>
      </div>

      {/* Floating Action Button */}
      <button
        onClick={() => navigateTo('/events/create')}
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 w-12 h-12 sm:w-14 sm:h-14 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600 transition-colors flex items-center justify-center z-30"
      >
        <Plus className="w-5 h-5 sm:w-6 sm:h-6" />
      </button>
    </div>
  );

  // Create event page
  const CreateEventPage: React.FC = () => (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 bg-white min-h-screen">
      {/* Popup Modal */}
      <Popup popup={popup} onClose={closePopup} />
      <Header />
      <TabsNavigation />

      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-6 sm:mb-8">
          <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-500 rounded-full flex items-center justify-center">
            <Plus className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
          </div>
          <span className="text-base sm:text-lg font-medium">Create new event</span>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
            {/* Image Upload Section */}
            <div className="lg:col-span-1">
              <div className="text-sm text-gray-600 mb-3">Select an image</div>
              <div className="w-full h-48 bg-gray-50 border-2 border-dashed border-gray-200 rounded-lg flex flex-col items-center justify-center p-4">
                <Upload className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400 mb-3" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="text-xs sm:text-sm"
                />
                {image && (
                  <p className="text-xs text-green-600 mt-2">Image selected: {image.name}</p>
                )}
              </div>
            </div>

            {/* Form Fields */}
            <div className="lg:col-span-2 space-y-4 sm:space-y-6">
              <div>
                <input
                  type="text"
                  name="eventName"
                  value={formData.eventName}
                  onChange={handleInputChange}
                  placeholder="Event Name"
                  className="w-full p-3 sm:p-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                />
              </div>

              <div>
                <textarea
                  name="eventDescription"
                  value={formData.eventDescription}
                  onChange={handleInputChange}
                  placeholder="Event Description"
                  rows={4}
                  className="w-full p-3 sm:p-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm sm:text-base"
                />
              </div>

              <div>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="Location"
                  className="w-full p-3 sm:p-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                />
              </div>

              <div>
                <div className="text-sm text-blue-600 mb-3">When this event will start?</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    className="w-full p-3 sm:p-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                  />
                  <input
                    type="time"
                    name="startTime"
                    value={formData.startTime}
                    onChange={handleInputChange}
                    className="w-full p-3 sm:p-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                  />
                </div>
              </div>

              <div>
                <div className="text-sm text-blue-600 mb-3">When this event will end?</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <input
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleInputChange}
                    className="w-full p-3 sm:p-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                  />
                  <input
                    type="time"
                    name="endTime"
                    value={formData.endTime}
                    onChange={handleInputChange}
                    className="w-full p-3 sm:p-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-between items-center pt-6 sm:pt-8 gap-4 sm:gap-0">
            <button
              type="button"
              onClick={goBack}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors w-full sm:w-auto justify-center sm:justify-start"
            >
              <ArrowLeft className="w-4 h-4" />
              Go back
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!formData.eventName.trim()}
              className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-6 sm:px-8 py-3 rounded-lg font-medium transition-colors w-full sm:w-auto"
            >
              Publish
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Edit Event Page
  const EditEventPage: React.FC = () => (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 bg-white min-h-screen">
      {/* Popup Modal */}
      <Popup popup={popup} onClose={closePopup} />
      <Header />
      <div className="flex items-center gap-3 mb-6 sm:mb-8">
        <div className="w-6 h-6 sm:w-8 sm:h-8 bg-yellow-400 rounded-full flex items-center justify-center">
          <Plus className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
        </div>
        <span className="text-base sm:text-lg font-medium">Edit event</span>
      </div>
      
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          <div className="lg:col-span-1">
            <div className="text-sm text-gray-600 mb-3">Update image</div>
            <div className="w-full h-48 bg-gray-50 border-2 border-dashed border-gray-200 rounded-lg flex flex-col items-center justify-center p-4">
              {editingEvent?.imageUrl && (
                <img src={editingEvent.imageUrl} alt="Event" className="w-20 h-20 sm:w-24 sm:h-24 object-cover mb-2 rounded" />
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="text-xs sm:text-sm"
              />
            </div>
          </div>
          
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            <div>
              <input
                type="text"
                name="eventName"
                value={formData.eventName}
                onChange={handleInputChange}
                placeholder="Event Name"
                className="w-full p-3 sm:p-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
              />
            </div>
            <div>
              <textarea
                name="eventDescription"
                value={formData.eventDescription}
                onChange={handleInputChange}
                placeholder="Event Description"
                rows={4}
                className="w-full p-3 sm:p-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm sm:text-base"
              />
            </div>
            <div>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                placeholder="Location"
                className="w-full p-3 sm:p-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
              />
            </div>
            <div>
              <div className="text-sm text-blue-600 mb-3">When this event will start?</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  className="w-full p-3 sm:p-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                />
                <input
                  type="time"
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleInputChange}
                  className="w-full p-3 sm:p-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                />
              </div>
            </div>
            <div>
              <div className="text-sm text-blue-600 mb-3">When this event will end?</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleInputChange}
                  className="w-full p-3 sm:p-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                />
                <input
                  type="time"
                  name="endTime"
                  value={formData.endTime}
                  onChange={handleInputChange}
                  className="w-full p-3 sm:p-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                />
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row justify-between items-center pt-6 sm:pt-8 gap-4 sm:gap-0">
          <button
            type="button"
            onClick={() => { setEditingEvent(null); navigateTo('/events'); }}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors w-full sm:w-auto justify-center sm:justify-start"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleUpdate}
            className="bg-blue-500 text-white px-6 sm:px-8 py-3 rounded-lg font-medium hover:bg-blue-600 transition-colors w-full sm:w-auto"
          >
            Update
          </button>
        </div>
      </div>
    </div>
  );

  // Other pages component
  const OtherEventsPage: React.FC<OtherEventsPageProps> = ({ pageTitle }) => (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 bg-white min-h-screen">
      {/* Popup Modal */}
      <Popup popup={popup} onClose={closePopup} />
      <Header />
      <TabsNavigation />
      
      <div className="text-center py-12 sm:py-20">
        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-blue-500 rounded-2xl mx-auto mb-4 sm:mb-6 flex items-center justify-center">
          <Calendar className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
        </div>
        <p className="text-gray-500 text-base sm:text-lg mb-6 sm:mb-8">{pageTitle} - Coming Soon</p>
        <p className="text-gray-400 text-sm">This page is under development</p>
      </div>

      <button
        onClick={() => navigateTo('/events/create')}
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 w-12 h-12 sm:w-14 sm:h-14 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600 transition-colors flex items-center justify-center z-30"
      >
        <Plus className="w-5 h-5 sm:w-6 sm:h-6" />
      </button>
    </div>
  );

  // Render based on current route
  const renderCurrentPage = (): React.ReactElement => {
    switch (currentRoute) {
      case '/events':
        return <MainEventsPage />;
      case '/events/create':
        return <CreateEventPage />;
      case '/events/edit':
        return <EditEventPage />;
      case '/events/browse':
        return <OtherEventsPage pageTitle="Browse Events" />;
      case '/events/going':
        return <OtherEventsPage pageTitle="Events Going" />;
      case '/events/invited':
        return <OtherEventsPage pageTitle="Invited Events" />;
      case '/events/interested':
        return <OtherEventsPage pageTitle="Events Interested" />;
      case '/events/past':
        return <OtherEventsPage pageTitle="Past Events" />;
      default:
        return <MainEventsPage />;
    }
  };

  return renderCurrentPage();
};

export default EventManagement;