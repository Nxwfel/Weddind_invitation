import React, { useState, useEffect } from 'react';
import apiClient from '../api/client';
import toast from 'react-hot-toast';
import { Plus, X } from 'lucide-react';

export default function AdminsPage() {
  const [admins, setAdmins] = useState([]);
  const [commissionInfo, setCommissionInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  const [formData, setFormData] = useState({
    admin_id: '',
    phone_number: '',
    password: '',
    commission_percentage: 0
  });

  const fetchData = async () => {
    try {
      const [admRes, commRes] = await Promise.all([
        apiClient.get('/admins/'),
        apiClient.get('/admins/commission/')
      ]);
      setAdmins(admRes.data);
      setCommissionInfo(commRes.data);
    } catch (err) {
      toast.error('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openCreateModal = () => {
    setIsEditing(false);
    setFormData({ admin_id: '', phone_number: '', password: '', commission_percentage: 0 });
    setShowModal(true);
  };

  const openEditModal = (admin) => {
    setIsEditing(true);
    setFormData({
      admin_id: admin.admin_id || admin.id,
      phone_number: admin.phone_number,
      password: '', // password left blank on edit unless changing
      commission_percentage: admin.commission_percentage || 0
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData };
      if (isEditing && !payload.password) {
        delete payload.password; // Don't send empty password on update
      }

      if (isEditing) {
        await apiClient.put('/admins/', payload);
        toast.success("Admin updated successfully");
      } else {
        await apiClient.post('/admins/', payload);
        toast.success("Admin created successfully");
      }
      setShowModal(false);
      fetchData();
    } catch (err) {
      if (err.response?.status === 422) {
        toast.error("Validation error: " + JSON.stringify(err.response.data.detail));
      } else {
        toast.error('Failed to save admin');
      }
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Admins</h2>
        <button 
          onClick={openCreateModal}
          className="flex items-center gap-2 bg-[#1b3312] text-white px-4 py-2 rounded-lg hover:bg-[#2a4d1c]"
        >
          <Plus size={20} /> Add Admin
        </button>
      </div>

      {commissionInfo && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <h3 className="font-semibold text-green-800">Commission Info</h3>
          <pre className="text-sm mt-2 text-green-700 font-mono">
            {JSON.stringify(commissionInfo, null, 2)}
          </pre>
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone Number</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Commission %</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr><td colSpan="4" className="px-6 py-4 text-center text-gray-500">Loading...</td></tr>
            ) : admins.length === 0 ? (
              <tr><td colSpan="4" className="px-6 py-4 text-center text-gray-500">No admins found</td></tr>
            ) : (
              admins.map((adm) => (
                <tr key={adm.admin_id || adm.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{adm.admin_id || adm.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{adm.phone_number}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{adm.commission_percentage}%</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button onClick={() => openEditModal(adm)} className="text-blue-600 hover:text-blue-900">Edit</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-lg font-bold">{isEditing ? 'Edit Admin' : 'New Admin'}</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Phone Number *</label>
                <input required type="text" value={formData.phone_number} onChange={e => setFormData({...formData, phone_number: e.target.value})} className="mt-1 w-full border border-gray-300 rounded-md shadow-sm p-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Password {isEditing && <span className="font-normal text-xs text-gray-500">(Leave blank to keep current)</span>}
                  {!isEditing && "*"}
                </label>
                <input required={!isEditing} type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="mt-1 w-full border border-gray-300 rounded-md shadow-sm p-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Commission % *</label>
                <input required type="number" min="0" max="100" step="0.1" value={formData.commission_percentage} onChange={e => setFormData({...formData, commission_percentage: parseFloat(e.target.value) || 0})} className="mt-1 w-full border border-gray-300 rounded-md shadow-sm p-2" />
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-[#1b3312] text-white rounded-lg hover:bg-[#2a4d1c]">{isEditing ? 'Save Changes' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
