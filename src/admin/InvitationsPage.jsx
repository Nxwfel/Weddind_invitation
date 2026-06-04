import React, { useState, useEffect } from 'react';
import apiClient from '../api/client';
import toast from 'react-hot-toast';
import { Copy, Plus, X, Mail, Pencil, Trash2, Eye } from 'lucide-react';

const emptyForm = {
  guest_full_name: '',
  guest_phone: '',
  guest_email: '',
  message: '',
  is_valid: true,
  sent_at: '',
  opened_at: '',
};

export default function InvitationsPage() {
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Create / Edit modal
  const [showFormModal, setShowFormModal] = useState(false);
  const [editTarget, setEditTarget] = useState(null); // null = create mode
  const [formData, setFormData] = useState(emptyForm);
  const [formLoading, setFormLoading] = useState(false);

  // View modal
  const [viewData, setViewData] = useState(null);

  // Code reveal modal (post-create)
  const [newCodeModal, setNewCodeModal] = useState({ show: false, code: '' });
  const [codeCopied, setCodeCopied] = useState(false);

  /* ── helpers ── */
  const toLocalInput = (iso) => {
    if (!iso) return '';
    const d = new Date(iso);
    return new Date(d - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  };

  const fetchInvitations = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/invitations/');
      setInvitations(res.data);
    } catch {
      toast.error('Failed to load invitations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchInvitations(); }, []);

  /* ── open create modal ── */
  const openCreate = () => {
    setEditTarget(null);
    setFormData(emptyForm);
    setShowFormModal(true);
  };

  /* ── open edit modal ── */
  const openEdit = (inv) => {
    setEditTarget(inv);
    setFormData({
      guest_full_name: inv.guest_full_name || '',
      guest_phone: inv.guest_phone || '',
      guest_email: inv.guest_email || '',
      message: inv.message || '',
      is_valid: inv.is_valid ?? true,
      sent_at: toLocalInput(inv.sent_at),
      opened_at: toLocalInput(inv.opened_at),
    });
    setShowFormModal(true);
  };

  /* ── view single ── */
  const openView = async (inv) => {
    try {
      const id = inv.id || inv._id;
      const res = await apiClient.get(`/invitations/${id}`);
      setViewData(res.data);
    } catch {
      toast.error('Failed to fetch invitation details');
    }
  };

  /* ── create / update ── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      const payload = { ...formData };
      if (payload.sent_at) payload.sent_at = new Date(payload.sent_at).toISOString();
      else delete payload.sent_at;
      if (payload.opened_at) payload.opened_at = new Date(payload.opened_at).toISOString();
      else delete payload.opened_at;

      if (editTarget) {
        // PUT — include the id from the existing record
        await apiClient.put('/invitations/', { ...payload, id: editTarget.id || editTarget._id });
        toast.success('Invitation updated');
        setShowFormModal(false);
        fetchInvitations();
      } else {
        // POST
        const res = await apiClient.post('/invitations/', payload);
        setShowFormModal(false);
        fetchInvitations();
        if (res.data?.invitation_code) {
          setCodeCopied(false);
          setNewCodeModal({ show: true, code: res.data.invitation_code });
        } else {
          toast.success('Invitation created');
        }
      }
    } catch (err) {
      if (err.response?.status === 422) {
        const detail = err.response.data?.detail;
        const msg = Array.isArray(detail)
          ? detail.map((d) => `${d.loc?.slice(-1)[0]}: ${d.msg}`).join(', ')
          : JSON.stringify(detail);
        toast.error(`Validation: ${msg}`);
      } else {
        toast.error(editTarget ? 'Failed to update invitation' : 'Failed to create invitation');
      }
    } finally {
      setFormLoading(false);
    }
  };

  /* ── delete ── */
  const handleDelete = async (inv) => {
    const id = inv.id || inv._id;
    if (!window.confirm(`Delete invitation for "${inv.guest_full_name}"?`)) return;
    try {
      await apiClient.delete(`/invitations/${id}`);
      toast.success('Deleted successfully');
      fetchInvitations();
    } catch {
      toast.error('Failed to delete');
    }
  };

  /* ── copy code ── */
  const copyCode = async () => {
    await navigator.clipboard.writeText(newCodeModal.code);
    setCodeCopied(true);
    toast.success('Code copied to clipboard!');
  };

  /* ─────────────────────────── UI ─────────────────────────── */
  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Invitations</h2>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-[#1b3312] text-white px-4 py-2 rounded-lg hover:bg-[#2a4d1c] transition-colors"
        >
          <Plus size={18} /> Create New
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {['ID', 'Guest Name', 'Phone', 'Email', 'Code', 'Valid', 'Sent At', 'Opened At', 'Actions'].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr><td colSpan="8" className="px-6 py-8 text-center text-gray-400">Loading…</td></tr>
            ) : invitations.length === 0 ? (
              <tr><td colSpan="8" className="px-6 py-8 text-center text-gray-400">No invitations yet</td></tr>
            ) : invitations.map((inv) => (
              <tr key={inv.id || inv._id || inv.invitation_code} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm text-gray-400">{inv.id ?? '—'}</td>
                <td className="px-4 py-3 text-sm font-medium text-gray-900">{inv.guest_full_name}</td>
                <td className="px-4 py-3 text-sm text-gray-500">{inv.guest_phone || '—'}</td>
                <td className="px-4 py-3 text-sm text-gray-500">{inv.guest_email || '—'}</td>
                <td className="px-4 py-3 text-sm">
                  {inv.invitation_code ? (
                    <div className="flex items-center gap-1 max-w-[160px]">
                      <span className="font-mono text-xs text-gray-600 truncate" title={inv.invitation_code}>
                        {inv.invitation_code}
                      </span>
                      <button
                        onClick={() => { navigator.clipboard.writeText(inv.invitation_code); toast.success('Code copied!'); }}
                        className="shrink-0 text-gray-300 hover:text-[#1b3312] transition-colors"
                        title="Copy code"
                      >
                        <Copy size={13} />
                      </button>
                    </div>
                  ) : '—'}
                </td>
                <td className="px-4 py-3 text-sm">
                  <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${inv.is_valid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {inv.is_valid ? 'Yes' : 'No'}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-500">
                  {inv.sent_at ? new Date(inv.sent_at).toLocaleDateString() : '—'}
                </td>
                <td className="px-4 py-3 text-sm text-gray-500">
                  {inv.opened_at ? new Date(inv.opened_at).toLocaleString() : 'Unopened'}
                </td>
                <td className="px-4 py-3 text-sm">
                  <div className="flex items-center gap-3">
                    <button onClick={() => openView(inv)} className="text-gray-400 hover:text-blue-600 transition-colors" title="View"><Eye size={16} /></button>
                    <button onClick={() => openEdit(inv)} className="text-gray-400 hover:text-[#1b3312] transition-colors" title="Edit"><Pencil size={16} /></button>
                    <button onClick={() => handleDelete(inv)} className="text-gray-400 hover:text-red-600 transition-colors" title="Delete"><Trash2 size={16} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── Create / Edit Modal ── */}
      {showFormModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md my-8">
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-lg font-bold">{editTarget ? 'Edit Invitation' : 'New Invitation'}</h3>
              <button onClick={() => setShowFormModal(false)} className="text-gray-400 hover:text-gray-600"><X size={22} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Guest Full Name <span className="text-red-500">*</span></label>
                <input required type="text" value={formData.guest_full_name}
                  onChange={e => setFormData({ ...formData, guest_full_name: e.target.value })}
                  className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-[#1b3312] focus:border-transparent" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input type="text" value={formData.guest_phone}
                    onChange={e => setFormData({ ...formData, guest_phone: e.target.value })}
                    className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-[#1b3312] focus:border-transparent" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input type="email" value={formData.guest_email}
                    onChange={e => setFormData({ ...formData, guest_email: e.target.value })}
                    className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-[#1b3312] focus:border-transparent" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Personal Message</label>
                <textarea value={formData.message} rows={3}
                  onChange={e => setFormData({ ...formData, message: e.target.value })}
                  className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-[#1b3312] focus:border-transparent" />
              </div>
              {editTarget && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Sent At</label>
                      <input type="datetime-local" value={formData.sent_at}
                        onChange={e => setFormData({ ...formData, sent_at: e.target.value })}
                        className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-[#1b3312] focus:border-transparent" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Opened At</label>
                      <input type="datetime-local" value={formData.opened_at}
                        onChange={e => setFormData({ ...formData, opened_at: e.target.value })}
                        className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-[#1b3312] focus:border-transparent" />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="is_valid" checked={formData.is_valid}
                      onChange={e => setFormData({ ...formData, is_valid: e.target.checked })}
                      className="w-4 h-4 accent-[#1b3312]" />
                    <label htmlFor="is_valid" className="text-sm font-medium text-gray-700">Valid Invitation</label>
                  </div>
                </>
              )}
              <div className="pt-2 flex justify-end gap-3">
                <button type="button" onClick={() => setShowFormModal(false)}
                  className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={formLoading}
                  className="px-5 py-2 text-sm bg-[#1b3312] text-white rounded-lg hover:bg-[#2a4d1c] disabled:opacity-50 transition-colors">
                  {formLoading ? 'Saving…' : editTarget ? 'Save Changes' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── View Modal ── */}
      {viewData && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-lg font-bold">Invitation Details</h3>
              <button onClick={() => setViewData(null)} className="text-gray-400 hover:text-gray-600"><X size={22} /></button>
            </div>
            <dl className="p-6 space-y-3 text-sm">
              {Object.entries(viewData).map(([k, v]) => (
                <div key={k} className="flex gap-4">
                  <dt className="w-36 font-medium text-gray-500 capitalize shrink-0">{k.replace(/_/g, ' ')}</dt>
                  <dd className="text-gray-900 break-all">{v === null || v === undefined ? '—' : String(v)}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      )}

      {/* ── CRITICAL Code Modal ── */}
      {newCodeModal.show && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 text-center">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail size={32} />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Invitation Created!</h3>
            <p className="text-red-600 font-semibold text-sm mb-1">⚠ This code will NOT be shown again.</p>
            <p className="text-gray-500 text-sm mb-6">Copy it now and share it with the guest before closing this window.</p>

            <div className="bg-gray-50 border-2 border-dashed border-[#1b3312]/30 p-4 rounded-xl flex items-center justify-between mb-6 gap-4">
              <span className="text-2xl font-mono font-bold tracking-widest text-[#1b3312] break-all">{newCodeModal.code}</span>
              <button onClick={copyCode} title="Copy" className="shrink-0 text-gray-400 hover:text-[#1b3312] transition-colors">
                <Copy size={22} />
              </button>
            </div>

            <button
              disabled={!codeCopied}
              onClick={() => setNewCodeModal({ show: false, code: '' })}
              className={`w-full py-3 rounded-xl font-bold transition-colors ${
                codeCopied
                  ? 'bg-[#1b3312] text-white hover:bg-[#2a4d1c]'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              {codeCopied ? 'Done — Close' : 'Copy the code above to continue'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
