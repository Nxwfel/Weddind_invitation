import React, { useState, useEffect } from 'react';
import apiClient from '../api/client';
import toast from 'react-hot-toast';

export default function EventPage() {
  const [eventData, setEventData] = useState({
    event_id: null,
    groom_name: '',
    bride_name: '',
    event_date: '',
    venue_name: '',
    venue_address: '',
    max_guests: 0
  });
  const [loading, setLoading] = useState(true);
  const [isNew, setIsNew] = useState(false);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        // Typically fetching the first event, or perhaps there's an index
        // Depending on backend, maybe /event/ returns a list or an object.
        // The spec says GET /event/{event_id}. We'll try ID 1.
        const res = await apiClient.get('/event/1');
        if (res.data) {
          // Format date for datetime-local
          let formattedDate = '';
          if (res.data.event_date) {
             const d = new Date(res.data.event_date);
             const tzoffset = d.getTimezoneOffset() * 60000; // offset in milliseconds
             const localISOTime = (new Date(d - tzoffset)).toISOString().slice(0, -1);
             formattedDate = localISOTime.slice(0,16);
          }
          const event_id = res.data.event_id ?? res.data.id ?? null;
          setEventData({ ...res.data, event_id, event_date: formattedDate });
          setIsNew(false);
        }
      } catch (err) {
        if (err.response?.status === 404) {
          setIsNew(true);
        } else {
          toast.error("Failed to load event details");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Format date back to standard ISO for the backend
    const payload = { ...eventData };
    if (payload.event_date) {
      payload.event_date = new Date(payload.event_date).toISOString();
    }

    if (!isNew) {
      payload.event_id = payload.event_id ?? payload.id;
      delete payload.id;
    }

    try {
      if (isNew) {
        await apiClient.post('/event/', payload);
        toast.success("Event created successfully");
        setIsNew(false);
      } else {
        await apiClient.put('/event/', payload);
        toast.success("Event updated successfully");
      }
    } catch (err) {
      if (err.response?.status === 422) {
        toast.error("Validation error: " + JSON.stringify(err.response.data.detail));
      } else {
        toast.error("Failed to save event details");
      }
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="max-w-2xl">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        {isNew ? 'Create Event' : 'Event Details'}
      </h2>

      <div className="bg-white rounded-lg shadow p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Groom's Name *</label>
              <input required type="text" value={eventData.groom_name} onChange={e => setEventData({...eventData, groom_name: e.target.value})} className="mt-1 w-full border border-gray-300 rounded-md p-2 shadow-sm focus:ring-[#1b3312] focus:border-[#1b3312]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Bride's Name *</label>
              <input required type="text" value={eventData.bride_name} onChange={e => setEventData({...eventData, bride_name: e.target.value})} className="mt-1 w-full border border-gray-300 rounded-md p-2 shadow-sm focus:ring-[#1b3312] focus:border-[#1b3312]" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Event Date & Time *</label>
            <input required type="datetime-local" value={eventData.event_date} onChange={e => setEventData({...eventData, event_date: e.target.value})} className="mt-1 w-full border border-gray-300 rounded-md p-2 shadow-sm focus:ring-[#1b3312] focus:border-[#1b3312]" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Venue Name *</label>
            <input required type="text" value={eventData.venue_name} onChange={e => setEventData({...eventData, venue_name: e.target.value})} className="mt-1 w-full border border-gray-300 rounded-md p-2 shadow-sm focus:ring-[#1b3312] focus:border-[#1b3312]" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Venue Address</label>
            <textarea value={eventData.venue_address} onChange={e => setEventData({...eventData, venue_address: e.target.value})} rows="2" className="mt-1 w-full border border-gray-300 rounded-md p-2 shadow-sm focus:ring-[#1b3312] focus:border-[#1b3312]" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Max Guests</label>
            <input type="number" value={eventData.max_guests} onChange={e => setEventData({...eventData, max_guests: parseInt(e.target.value) || 0})} className="mt-1 w-full border border-gray-300 rounded-md p-2 shadow-sm focus:ring-[#1b3312] focus:border-[#1b3312]" />
          </div>

          <div className="pt-4 flex justify-end">
            <button type="submit" className="bg-[#1b3312] text-white px-6 py-2 rounded-lg font-medium hover:bg-[#2a4d1c] transition-colors">
              {isNew ? 'Create Event' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
