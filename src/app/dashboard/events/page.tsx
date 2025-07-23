"use client";
import React, { useState, useEffect } from 'react';
import { Calendar, Users, Plus, Search, Upload, ArrowLeft } from 'lucide-react';

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

  useEffect(() => {
    if (currentRoute === '/events') {
      fetch('http://localhost:5000/api/events')
        .then(res => res.json())
        .then(data => setEvents(data))
        .catch(() => setEvents([]));
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
        alert('Event created successfully!');
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
        alert('Error: ' + data.error);
      }
    } catch (err) {
      alert('Network error');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this event?')) return;
    try {
      await fetch(`http://localhost:5000/api/events/${id}`, { method: 'DELETE' });
      // Refresh events list
      fetch('http://localhost:5000/api/events')
        .then(res => res.json())
        .then(data => setEvents(data))
        .catch(() => setEvents([]));
    } catch (err) {
      alert('Network error');
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
        alert('Event updated successfully!');
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
        alert('Error: ' + data.error);
      }
    } catch (err) {
      alert('Network error');
    }
  };

  // Get current active tab
  const getCurrentTab = (): string => {
    const activeTab = tabs.find(tab => tab.href === currentRoute);
    return activeTab ? activeTab.name : 'My events';
  };

  // Shared header component
  const Header: React.FC = () => (
    <div className="flex justify-between items-center mb-8">
      <h1 className="text-3xl font-semibold text-gray-800">Events</h1>
      <div className="flex gap-3">
        <button className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200 transition-colors">
          <Search className="w-5 h-5 text-gray-600" />
        </button>
        <button className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200 transition-colors">
          <Users className="w-5 h-5 text-gray-600" />
        </button>
      </div>
    </div>
  );

  // Shared tabs component
  const TabsNavigation: React.FC = () => (
    <div className="border-b border-gray-200 mb-10">
      <div className="flex space-x-0">
        {tabs.map((tab: Tab) => (
          <button 
            key={tab.name} 
            onClick={() => navigateTo(tab.href)}
            className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
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
  );

  // Main events page
  const MainEventsPage: React.FC = () => (
    <div className="max-w-6xl mx-auto p-6 bg-white min-h-screen">
      <Header />
      <TabsNavigation />
      <div>
        {events.length === 0 ? (
          <p className="text-gray-500 text-lg mb-8">No events to show</p>
        ) : (
          events.map(event => (
            <div key={event._id} className="mb-4 p-4 border rounded bg-gray-50">
              <h3 className="font-bold text-lg mb-1">{event.eventName}</h3>
              <p className="mb-1">{event.eventDescription}</p>
              <p className="mb-1 text-sm text-gray-600">{event.location}</p>
              {event.imageUrl && (
                <img src={event.imageUrl} alt="Event" className="w-32 h-32 object-cover mt-2 rounded" />
              )}
              <p className="text-xs text-gray-500 mt-1">
                {event.startDate} {event.startTime} - {event.endDate} {event.endTime}
              </p>
              <div className="flex gap-2 mt-2">
                <button onClick={() => handleEdit(event)} className="px-3 py-1 bg-yellow-400 text-white rounded hover:bg-yellow-500">Edit</button>
                <button onClick={() => handleDelete(event._id)} className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600">Delete</button>
              </div>
            </div>
          ))
        )}
      </div>
      <div className="text-center py-20">
        <div className="w-20 h-20 bg-red-500 rounded-2xl mx-auto mb-6 flex items-center justify-center">
          <Calendar className="w-10 h-10 text-white" />
        </div>
        <button
          onClick={() => navigateTo('/events/create')}
          className="bg-blue-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-600 transition-colors"
        >
          Create
        </button>
      </div>
      <button
        onClick={() => navigateTo('/events/create')}
        className="fixed bottom-6 right-6 w-14 h-14 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600 transition-colors flex items-center justify-center"
      >
        <Plus className="w-6 h-6" />
      </button>
    </div>
  );

  // Create event page
  const CreateEventPage: React.FC = () => (
    <div className="max-w-6xl mx-auto p-6 bg-white min-h-screen">
      <Header />
      <TabsNavigation />

      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
            <Plus className="w-4 h-4 text-white" />
          </div>
          <span className="text-lg font-medium">Create new event</span>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <div className="text-sm text-gray-600 mb-3">Select an image</div>
              <div className="w-full h-48 bg-gray-50 border-2 border-dashed border-gray-200 rounded-lg flex flex-col items-center justify-center">
                <Upload className="w-8 h-8 text-gray-400 mb-3" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </div>
            </div>

            <div className="lg:col-span-2 space-y-6">
              <div>
                <input
                  type="text"
                  name="eventName"
                  value={formData.eventName}
                  onChange={handleInputChange}
                  placeholder="Event Name"
                  className="w-full p-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <textarea
                  name="eventDescription"
                  value={formData.eventDescription}
                  onChange={handleInputChange}
                  placeholder="Event Description"
                  rows={4}
                  className="w-full p-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>

              <div>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="Location"
                  className="w-full p-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <div className="text-sm text-blue-600 mb-3">When this event will start?</div>
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    className="w-full p-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <input
                    type="time"
                    name="startTime"
                    value={formData.startTime}
                    onChange={handleInputChange}
                    className="w-full p-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <div className="text-sm text-blue-600 mb-3">When this event will end?</div>
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleInputChange}
                    className="w-full p-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <input
                    type="time"
                    name="endTime"
                    value={formData.endTime}
                    onChange={handleInputChange}
                    className="w-full p-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-between pt-8">
            <button
              type="button"
              onClick={goBack}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Go back
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="bg-blue-500 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-600 transition-colors"
            >
              Publish
            </button>
          </div>
        </div>
      </div>

      <button
        onClick={() => navigateTo('/events/create')}
        className="fixed bottom-6 right-6 w-14 h-14 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600 transition-colors flex items-center justify-center"
      >
        <Plus className="w-6 h-6" />
      </button>
    </div>
  );

  // Edit Event Page
  const EditEventPage: React.FC = () => (
    <div className="max-w-4xl mx-auto p-6 bg-white min-h-screen">
      <Header />
      <div className="flex items-center gap-3 mb-8">
        <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
          <Plus className="w-4 h-4 text-white" />
        </div>
        <span className="text-lg font-medium">Edit event</span>
      </div>
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <div className="text-sm text-gray-600 mb-3">Update image</div>
            <div className="w-full h-48 bg-gray-50 border-2 border-dashed border-gray-200 rounded-lg flex flex-col items-center justify-center">
              {editingEvent?.imageUrl && (
                <img src={editingEvent.imageUrl} alt="Event" className="w-24 h-24 object-cover mb-2 rounded" />
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
              />
            </div>
          </div>
          <div className="lg:col-span-2 space-y-6">
            <div>
              <input
                type="text"
                name="eventName"
                value={formData.eventName}
                onChange={handleInputChange}
                placeholder="Event Name"
                className="w-full p-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <textarea
                name="eventDescription"
                value={formData.eventDescription}
                onChange={handleInputChange}
                placeholder="Event Description"
                rows={4}
                className="w-full p-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>
            <div>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                placeholder="Location"
                className="w-full p-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <div className="text-sm text-blue-600 mb-3">When this event will start?</div>
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  className="w-full p-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <input
                  type="time"
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleInputChange}
                  className="w-full p-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div>
              <div className="text-sm text-blue-600 mb-3">When this event will end?</div>
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleInputChange}
                  className="w-full p-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <input
                  type="time"
                  name="endTime"
                  value={formData.endTime}
                  onChange={handleInputChange}
                  className="w-full p-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>
        <div className="flex justify-between pt-8">
          <button
            type="button"
            onClick={() => { setEditingEvent(null); navigateTo('/events'); }}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleUpdate}
            className="bg-blue-500 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-600 transition-colors"
          >
            Update
          </button>
        </div>
      </div>
    </div>
  );

  // Other pages component
  const OtherEventsPage: React.FC<OtherEventsPageProps> = ({ pageTitle }) => (
    <div className="max-w-6xl mx-auto p-6 bg-white min-h-screen">
      <Header />
      <TabsNavigation />
      
      <div className="text-center py-20">
        <div className="w-20 h-20 bg-blue-500 rounded-2xl mx-auto mb-6 flex items-center justify-center">
          <Calendar className="w-10 h-10 text-white" />
        </div>
        <p className="text-gray-500 text-lg mb-8">{pageTitle} - Coming Soon</p>
        <p className="text-gray-400 text-sm">This page is under development</p>
      </div>

      <button
        onClick={() => navigateTo('/events/create')}
        className="fixed bottom-6 right-6 w-14 h-14 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600 transition-colors flex items-center justify-center"
      >
        <Plus className="w-6 h-6" />
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