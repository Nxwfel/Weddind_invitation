import React, { useState, useEffect } from 'react';
import apiClient from '../api/client';
import toast from 'react-hot-toast';
import { Plus, X, Pencil, Trash2, Search } from 'lucide-react';

const emptyForm = {
  invitation_id: '',
  checked_by_admin_id: '',
  guest_name_snapshot: '',
  is_valid_entry: true,
};

export default function CheckinsPage() {
  const [checkins, setCheckins] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showFormModal, setShowFormModal] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [formLoading, setFormLoading] = useState(false);

  // Lookup by invitation ID
  const [invLookupId, setInvLookupId] = useState('');
  const [lookupLoading, setLookupLoading] = useState(false);

  /* ── fetch all ── */
  const fetchCheckins = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/checkins/');
      setCheckins(res.data);
    } catch {
      toast.error('Failed to load check-ins');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCheckins(); }, []);

  /* ── lookup by invitation ── */
  const handleLookup = async (e) => {
    e.preventDefault();
    if (!invLookupId.trim()) return;
    setLookupLoading(true);
    try {
      const res = await apiClient.get(`/checkins/invitation/${invLookupId.trim()}`);
      setCheckins(Array.isArray(res.data) ? res.data : [res.data]);
      toast.success(`Showing check-ins for invitation #${invLookupId}`);
    } catch {
      toast.error('No check-ins found for that invitation ID');
    } finally {
      setLookupLoading(false);
    }
  };

  /* ── open create ── */
  const openCreate = () => {
    setEditTarget(null);
    setFormData(emptyForm);
    setShowFormModal(true);
  };

  /* ── open edit (only is_valid_entry is updatable) ── */
  const openEdit = (chk) => {
    setEditTarget(chk);
    setFormData({
      invitation_id: chk.invitation_id ?? '',
      checked_by_admin_id: chk.checked_by_admin_id ?? '',
      guest_name_snapshot: chk.guest_name_snapshot ?? '',
      is_valid_entry: chk.is_valid_entry ?? true,
    });
    setShowFormModal(true);
  };

  /* ── submit ── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      if (editTarget) {
        const id = editTarget.checkin_id || editTarget.id;
        await apiClient.put('/checkins/', { id, is_valid_entry: formData.is_valid_entry });
        toast.success('Check-in updated');
      } else {
        await apiClient.post('/checkins/', {
          invitation_id: formData.invitation_id,
          checked_by_admin_id: formData.checked_by_admin_id,
          guest_name_snapshot: formData.guest_name_snapshot,
          is_valid_entry: formData.is_valid_entry,
        });
        toast.success('Check-in logged');
      }
      setShowFormModal(false);
      fetchCheckins();
    } catch (err) {
      if (err.response?.status === 422) {
        const detail = err.response.data?.detail;
        const msg = Array.isArray(detail)
          ? detail.map((d) => `${d.loc?.slice(-1)[0]}: ${d.msg}`).join(', ')
          : JSON.stringify(detail);
        toast.error(`Validation: ${msg}`);
      } else {
        toast.error(editTarget ? 'Failed to update check-in' : 'Failed to log check-in');
      }
    } finally {
      setFormLoading(false);
    }
  };

  /* ── delete ── */
  const handleDelete = async (chk) => {
    const id = chk.checkin_id || chk.id;
    if (!window.confirm('Delete this check-in record?')) return;
    try {
      await apiClient.delete(`/checkins/${id}`);
      toast.success('Deleted');
      fetchCheckins();
    } catch {
      toast.error('Failed to delete');
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-800">Event Check-ins</h2>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-[#1b3312] text-white px-4 py-2 rounded-lg hover:bg-[#2a4d1c] transition-colors"
        >
          <Plus size={18} /> Log Check-in
        </button>
      </div>

      {/* Lookup bar */}
      <form onSubmit={handleLookup} className="flex gap-3 mb-6">
        <input
          type="text"
          value={invLookupId}
          onChange={(e) => setInvLookupId(e.target.value)}
          placeholder="Filter by Invitation ID…"
          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#1b3312] focus:border-transparent"
        />
        <button type="submit" disabled={lookupLoading}
          className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm transition-colors disabled:opacity-50">
          <Search size={16} /> {lookupLoading ? 'Searching…' : 'Search'}
        </button>
        <button type="button" onClick={() => { setInvLookupId(''); fetchCheckins(); }}
          className="text-sm text-gray-500 hover:text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors">
          Reset
        </button>
      </form>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {['Checkin ID', 'Invitation ID', 'Guest Snapshot', 'Valid Entry', 'Admin ID', 'Actions'].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr><td colSpan="6" className="px-6 py-8 text-center text-gray-400">Loading…</td></tr>
            ) : checkins.length === 0 ? (
              <tr><td colSpan="6" className="px-6 py-8 text-center text-gray-400">No check-ins found</td></tr>
            ) : checkins.map((chk) => (
              <tr key={chk.checkin_id || chk.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm text-gray-400">{chk.checkin_id || chk.id}</td>
                <td className="px-4 py-3 text-sm text-gray-500">{chk.invitation_id}</td>
                <td className="px-4 py-3 text-sm font-medium text-gray-900">{chk.guest_name_snapshot}</td>
                <td className="px-4 py-3 text-sm">
                  <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${chk.is_valid_entry ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {chk.is_valid_entry ? 'Valid' : 'Denied'}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-500">{chk.checked_by_admin_id}</td>
                <td className="px-4 py-3 text-sm">
                  <div className="flex items-center gap-3">
                    <button onClick={() => openEdit(chk)} className="text-gray-400 hover:text-[#1b3312] transition-colors" title="Edit"><Pencil size={16} /></button>
                    <button onClick={() => handleDelete(chk)} className="text-gray-400 hover:text-red-600 transition-colors" title="Delete"><Trash2 size={16} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── Form Modal ── */}
      {showFormModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-lg font-bold">{editTarget ? 'Edit Check-in' : 'Log New Check-in'}</h3>
              <button onClick={() => setShowFormModal(false)} className="text-gray-400 hover:text-gray-600"><X size={22} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {!editTarget && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Invitation ID <span className="text-red-500">*</span></label>
                    <input required type="text" value={formData.invitation_id}
                      onChange={e => setFormData({ ...formData, invitation_id: e.target.value })}
                      className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-[#1b3312] focus:border-transparent" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Guest Name Snapshot <span className="text-red-500">*</span></label>
                    <input required type="text" value={formData.guest_name_snapshot}
                      onChange={e => setFormData({ ...formData, guest_name_snapshot: e.target.value })}
                      className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-[#1b3312] focus:border-transparent" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Admin ID <span className="text-red-500">*</span></label>
                    <input required type="text" value={formData.checked_by_admin_id}
                      onChange={e => setFormData({ ...formData, checked_by_admin_id: e.target.value })}
                      className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-[#1b3312] focus:border-transparent" />
                  </div>
                </>
              )}
              {editTarget && (
                <p className="text-sm text-gray-500">
                  Editing check-in for <strong>{editTarget.guest_name_snapshot}</strong>.<br />
                  Only the validity can be changed.
                </p>
              )}
              <div className="flex items-center gap-2">
                <input type="checkbox" id="is_valid_entry" checked={formData.is_valid_entry}
                  onChange={e => setFormData({ ...formData, is_valid_entry: e.target.checked })}
                  className="w-4 h-4 accent-[#1b3312]" />
                <label htmlFor="is_valid_entry" className="text-sm font-medium text-gray-700">Valid Entry</label>
              </div>
              <div className="pt-2 flex justify-end gap-3">
                <button type="button" onClick={() => setShowFormModal(false)}
                  className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
                <button type="submit" disabled={formLoading}
                  className="px-5 py-2 text-sm bg-[#1b3312] text-white rounded-lg hover:bg-[#2a4d1c] disabled:opacity-50">
                  {formLoading ? 'Saving…' : editTarget ? 'Save' : 'Log Check-in'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
