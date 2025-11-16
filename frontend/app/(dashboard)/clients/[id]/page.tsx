'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import { useThemeStore } from '@/lib/store';
import { getStorageUrl } from '@/lib/utils';
import { Pencil, Phone, Envelope, DotsThree, Warning, WhatsappLogo } from '@phosphor-icons/react/dist/ssr';

type ContactFieldKey = 'customer_phone' | 'secondary_phone' | 'customer_email' | 'emergency_phone';

interface Client {
  id: number;
  customer_name: string;
  customer_phone: string;
  secondary_phone: string | null;
  emergency_phone: string | null;
  customer_email: string | null;
  gender: string | null;
  nationality: string | null;
  date_of_birth: string | null;
  address: string | null;
  profile_image: string | null;
}

interface Booking {
  id: number;
  booking_type: string;
  trip_title: string | null;
  date: string;
  total_amount: number;
}

export default function SingleClientPage() {
  const params = useParams();
  const router = useRouter();
  const { isDark } = useThemeStore();
  const [client, setClient] = useState<Client | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [clientSince, setClientSince] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValues, setEditValues] = useState({
    customer_phone: '',
    gender: '',
    nationality: '',
    date_of_birth: '',
    address: '',
    secondary_phone: '',
    emergency_phone: '',
    customer_email: '',
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (params.id) {
      fetchClient();
    }
  }, [params.id]);

  const fetchClient = async () => {
    try {
      const response = await api.get(`/clients/${params.id}`);
      setClient(response.data.client);
      setBookings(response.data.bookings);
      setClientSince(response.data.client_since);
      setEditValues({
        customer_phone: response.data.client.customer_phone || '',
        gender: response.data.client.gender || '',
        nationality: response.data.client.nationality || '',
        date_of_birth: response.data.client.date_of_birth || '',
        address: response.data.client.address || '',
        secondary_phone: response.data.client.secondary_phone || '',
        emergency_phone: response.data.client.emergency_phone || '',
        customer_email: response.data.client.customer_email || '',
      });
    } catch (error) {
      console.error('Error fetching client:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (field: string) => {
    setEditingField(field);
  };

  const phoneFields: ContactFieldKey[] = ['customer_phone', 'secondary_phone', 'emergency_phone'];

  const handleSave = async (field: string) => {
    if (phoneFields.includes(field as ContactFieldKey)) {
      const value = editValues[field as keyof typeof editValues] || '';
      if (value.length > 10) {
        alert('Phone numbers must not exceed 10 digits.');
        return;
      }
    }

    try {
      const updateData: any = {};
      updateData[field] = editValues[field as keyof typeof editValues] || null;

      await api.put(`/clients/${params.id}`, updateData);
      await fetchClient();
      setEditingField(null);
    } catch (error) {
      console.error('Error updating client:', error);
    }
  };

  const handleCancel = () => {
    setEditingField(null);
    if (client) {
      setEditValues({
        customer_phone: client.customer_phone || '',
        gender: client.gender || '',
        nationality: client.nationality || '',
        date_of_birth: client.date_of_birth || '',
        address: client.address || '',
        secondary_phone: client.secondary_phone || '',
        emergency_phone: client.emergency_phone || '',
        customer_email: client.customer_email || '',
      });
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('profile_image', file);

    try {
      await api.put(`/clients/${params.id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      await fetchClient();
    } catch (error) {
      console.error('Error uploading image:', error);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const getTypeColor = (type: string) => {
    if (isDark) {
      switch (type) {
        case 'trip':
          return 'bg-purple-900/50 text-purple-300';
        case 'ticket':
          return 'bg-blue-900/50 text-blue-300';
        case 'hotel':
          return 'bg-orange-900/50 text-orange-300';
        default:
          return 'bg-[#4a3f5a] text-gray-300';
      }
    } else {
      switch (type) {
        case 'trip':
          return 'bg-purple-100 text-purple-800';
        case 'ticket':
          return 'bg-blue-100 text-blue-800';
        case 'hotel':
          return 'bg-orange-100 text-orange-800';
        default:
          return 'bg-gray-100 text-gray-800';
      }
    }
  };

  const getWhatsappLink = (value: string | null) => {
    if (!value) return null;
    const cleaned = value.replace(/\D/g, '');
    if (!cleaned) return null;
    let digits = cleaned;
    if (digits.length === 10 && digits.startsWith('0')) {
      digits = digits.slice(1);
    }
    return `https://wa.me/+213${digits}`;
  };

  const contactDetails: Array<{
    key: ContactFieldKey;
    label: string;
    placeholder: string;
    type: 'tel' | 'email';
    icon: 'phone' | 'envelope' | 'warning';
    isPhone?: boolean;
  }> = [
    {
      key: 'customer_phone',
      label: 'Primary number',
      placeholder: 'Add phone number',
      type: 'tel',
      icon: 'phone',
      isPhone: true,
    },
    {
      key: 'secondary_phone',
      label: 'Second number',
      placeholder: 'Add second number',
      type: 'tel',
      icon: 'phone',
      isPhone: true,
    },
    {
      key: 'customer_email',
      label: 'Email',
      placeholder: 'Add email',
      type: 'email',
      icon: 'envelope',
    },
    {
      key: 'emergency_phone',
      label: 'Urgency number',
      placeholder: 'Add urgency number',
      type: 'tel',
      icon: 'warning',
      isPhone: true,
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className={`${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Loading...</div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className={`${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Client not found</div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className={`text-2xl font-bold ${isDark ? 'text-[#F6F4FF]' : 'text-gray-900'}`}>
            Profile
          </h1>
        </div>
        <button
          className={`p-2 rounded-lg transition-colors ${
            isDark ? 'hover:bg-[#4a3f5a] text-gray-300' : 'hover:bg-gray-100 text-gray-600'
          }`}
        >
          <DotsThree size={24} weight="bold" />
        </button>
      </div>

      {/* First Section: Grid with User Card */}
      <div className="grid grid-cols-3 gap-6 mb-8">
        {/* User Card */}
        <div
          className={`rounded-lg border p-6 ${
            isDark
              ? 'bg-[#3a2f4a] border-[#3a2f4a]'
              : 'bg-white border-gray-200'
          }`}
          style={{
            boxShadow: isDark ? '0 5px 20px 0 rgba(0, 0, 0, 0.3)' : '0 5px 20px 0 rgba(0, 0, 0, 0.05)',
          }}
        >
          {/* Profile Picture */}
          <div className="mb-6 flex items-center gap-4 border-b pb-6" style={{ borderColor: isDark ? '#4a3f5a' : '#E5E7EB' }}>
            <div className="relative">
              {client.profile_image && getStorageUrl(client.profile_image) ? (
                <img
                  src={getStorageUrl(client.profile_image) ?? undefined}
                  alt={client.customer_name}
                  className="w-20 h-20 rounded-full object-cover"
                />
              ) : (
                <div
                  className="w-20 h-20 rounded-full flex items-center justify-center text-white text-xl font-medium"
                  style={{
                    background: 'linear-gradient(180deg, #B09FFF 7%, #8A77ED 46%)',
                  }}
                >
                  {getInitials(client.customer_name)}
                </div>
              )}
              <button
                onClick={() => fileInputRef.current?.click()}
                className={`absolute bottom-0 right-0 w-7 h-7 rounded-full flex items-center justify-center ${
                  isDark ? 'bg-[#271f36] border-2 border-[#3a2f4a]' : 'bg-white border-2 border-gray-200'
                }`}
              >
                <Pencil size={14} weight="fill" className={isDark ? 'text-gray-300' : 'text-gray-600'} />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>
            <div>
              <h2 className={`text-xl font-bold mb-1 ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
                {client.customer_name}
              </h2>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                Client since {clientSince ? new Date(clientSince).toLocaleDateString('en-GB') : 'N/A'}
              </p>
            </div>
          </div>

          {/* Contact Information */}
          <div className="mb-6 border-b pb-6 space-y-4" style={{ borderColor: isDark ? '#4a3f5a' : '#E5E7EB' }}>
            {contactDetails.map((detail) => {
              const value = (client as Record<ContactFieldKey, string | null>)[detail.key];
              const iconBg =
                detail.icon === 'warning'
                  ? 'bg-[#FEF3C7]'
                  : isDark
                  ? 'bg-[#4a3f5a]'
                  : 'bg-[#F6F4FF]';
              const iconComponent =
                detail.icon === 'phone' ? (
                  <Phone size={16} weight="fill" className="text-[#8A77ED]" />
                ) : detail.icon === 'envelope' ? (
                  <Envelope size={16} weight="fill" className="text-[#8A77ED]" />
                ) : (
                  <Warning size={16} weight="fill" className="text-[#D97706]" />
                );
              const whatsappLink = detail.isPhone ? getWhatsappLink(value || null) : null;

              return (
                <div key={detail.key} className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${iconBg}`}>{iconComponent}</div>
                  <div className="flex-1">
                    {editingField === detail.key ? (
                      <div className="space-y-2">
                        <input
                          type={detail.type}
                          value={editValues[detail.key]}
                          onChange={(e) => setEditValues({ ...editValues, [detail.key]: e.target.value })}
                          placeholder={detail.placeholder}
                          maxLength={detail.isPhone ? 10 : undefined}
                          className={`w-full text-sm px-2 py-1 border rounded ${
                            isDark
                              ? 'bg-[#271f36] border-[#3a2f4a] text-gray-100'
                              : 'bg-white border-gray-300 text-gray-900'
                          }`}
                        />
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleSave(detail.key)}
                            className={`text-xs px-2 py-1 rounded ${
                              isDark ? 'bg-green-600 text-white' : 'bg-green-500 text-white'
                            }`}
                          >
                            Save
                          </button>
                          <button
                            onClick={handleCancel}
                            className={`text-xs px-2 py-1 rounded ${
                              isDark ? 'bg-gray-600 text-white' : 'bg-gray-400 text-white'
                            }`}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <div className="flex-1">
                          <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{detail.label}</p>
                          <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            {value || detail.placeholder}
                          </p>
                        </div>
                        {whatsappLink && (
                          <a
                            href={whatsappLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full bg-[#25D366] text-white"
                          >
                            <WhatsappLogo size={14} weight="fill" className="text-white" />
                            <span className="underline">WhatsApp</span>
                          </a>
                        )}
                        <button onClick={() => handleEdit(detail.key)} className="p-1 hover:opacity-70">
                          <Pencil size={14} weight="fill" className={isDark ? 'text-gray-400' : 'text-gray-500'} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Personal Information */}
          <div>
            <h3 className={`text-sm font-semibold mb-4 ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>
              Personal information
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {/* Gender */}
              <div>
                <p className={`text-xs mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Genre</p>
                {editingField === 'gender' ? (
                  <div className="space-y-2">
                    <select
                      value={editValues.gender}
                      onChange={(e) => setEditValues({ ...editValues, gender: e.target.value })}
                      className={`w-full text-sm px-2 py-1 border rounded ${
                        isDark
                          ? 'bg-[#271f36] border-[#3a2f4a] text-gray-100'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    >
                      <option value="">Select...</option>
                      <option value="men">Men</option>
                      <option value="women">Women</option>
                    </select>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleSave('gender')}
                        className={`text-xs px-2 py-1 rounded ${
                          isDark ? 'bg-green-600 text-white' : 'bg-green-500 text-white'
                        }`}
                      >
                        Save
                      </button>
                      <button
                        onClick={handleCancel}
                        className={`text-xs px-2 py-1 rounded ${
                          isDark ? 'bg-gray-600 text-white' : 'bg-gray-400 text-white'
                        }`}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <p className={`text-sm ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>
                      {client.gender || 'Add gender'}
                    </p>
                    <button
                      onClick={() => handleEdit('gender')}
                      className="p-1 hover:opacity-70"
                    >
                      <Pencil size={14} weight="fill" className={isDark ? 'text-gray-400' : 'text-gray-500'} />
                    </button>
                  </div>
                )}
              </div>

              {/* Nationality */}
              <div>
                <p className={`text-xs mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Nationalité</p>
                {editingField === 'nationality' ? (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={editValues.nationality}
                      onChange={(e) => setEditValues({ ...editValues, nationality: e.target.value })}
                      placeholder="Add nationality"
                      className={`w-full text-sm px-2 py-1 border rounded ${
                        isDark
                          ? 'bg-[#271f36] border-[#3a2f4a] text-gray-100'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleSave('nationality')}
                        className={`text-xs px-2 py-1 rounded ${
                          isDark ? 'bg-green-600 text-white' : 'bg-green-500 text-white'
                        }`}
                      >
                        Save
                      </button>
                      <button
                        onClick={handleCancel}
                        className={`text-xs px-2 py-1 rounded ${
                          isDark ? 'bg-gray-600 text-white' : 'bg-gray-400 text-white'
                        }`}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <p className={`text-sm ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>
                      {client.nationality || 'Add nationality'}
                    </p>
                    <button
                      onClick={() => handleEdit('nationality')}
                      className="p-1 hover:opacity-70"
                    >
                      <Pencil size={14} weight="fill" className={isDark ? 'text-gray-400' : 'text-gray-500'} />
                    </button>
                  </div>
                )}
              </div>

              {/* Date of Birth */}
              <div>
                <p className={`text-xs mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Date de naissance</p>
                {editingField === 'date_of_birth' ? (
                  <div className="space-y-2">
                    <input
                      type="date"
                      value={editValues.date_of_birth}
                      onChange={(e) => setEditValues({ ...editValues, date_of_birth: e.target.value })}
                      className={`w-full text-sm px-2 py-1 border rounded ${
                        isDark
                          ? 'bg-[#271f36] border-[#3a2f4a] text-gray-100'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleSave('date_of_birth')}
                        className={`text-xs px-2 py-1 rounded ${
                          isDark ? 'bg-green-600 text-white' : 'bg-green-500 text-white'
                        }`}
                      >
                        Save
                      </button>
                      <button
                        onClick={handleCancel}
                        className={`text-xs px-2 py-1 rounded ${
                          isDark ? 'bg-gray-600 text-white' : 'bg-gray-400 text-white'
                        }`}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <p className={`text-sm ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>
                      {client.date_of_birth
                        ? new Date(client.date_of_birth).toLocaleDateString('en-GB', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                          })
                        : 'Add date of birth'}
                    </p>
                    <button
                      onClick={() => handleEdit('date_of_birth')}
                      className="p-1 hover:opacity-70"
                    >
                      <Pencil size={14} weight="fill" className={isDark ? 'text-gray-400' : 'text-gray-500'} />
                    </button>
                  </div>
                )}
              </div>

              {/* Address */}
              <div>
                <p className={`text-xs mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Addresse</p>
                {editingField === 'address' ? (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={editValues.address}
                      onChange={(e) => setEditValues({ ...editValues, address: e.target.value })}
                      placeholder="Add address"
                      className={`w-full text-sm px-2 py-1 border rounded ${
                        isDark
                          ? 'bg-[#271f36] border-[#3a2f4a] text-gray-100'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleSave('address')}
                        className={`text-xs px-2 py-1 rounded ${
                          isDark ? 'bg-green-600 text-white' : 'bg-green-500 text-white'
                        }`}
                      >
                        Save
                      </button>
                      <button
                        onClick={handleCancel}
                        className={`text-xs px-2 py-1 rounded ${
                          isDark ? 'bg-gray-600 text-white' : 'bg-gray-400 text-white'
                        }`}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <p className={`text-sm ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>
                      {client.address || 'Add address'}
                    </p>
                    <button
                      onClick={() => handleEdit('address')}
                      className="p-1 hover:opacity-70"
                    >
                      <Pencil size={14} weight="fill" className={isDark ? 'text-gray-400' : 'text-gray-500'} />
                    </button>
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>

        {/* Empty columns */}
        <div></div>
        <div></div>
      </div>

      {/* Second Section: Bookings Table */}
      <div
        className={`rounded-lg border overflow-hidden ${
          isDark ? 'bg-[#3a2f4a] border-[#3a2f4a]' : 'bg-white border-gray-200'
        }`}
        style={{
          boxShadow: isDark ? '0 5px 20px 0 rgba(0, 0, 0, 0.3)' : '0 5px 20px 0 rgba(0, 0, 0, 0.05)',
        }}
      >
        <table className="w-full">
          <thead
            className={`border-b ${
              isDark ? 'bg-[#271f36] border-[#3a2f4a]' : 'bg-gray-50 border-gray-200'
            }`}
          >
            <tr>
              <th
                className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                  isDark ? 'text-gray-400' : 'text-gray-500'
                }`}
              >
                #ID
              </th>
              <th
                className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                  isDark ? 'text-gray-400' : 'text-gray-500'
                }`}
              >
                Post Type
              </th>
              <th
                className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                  isDark ? 'text-gray-400' : 'text-gray-500'
                }`}
              >
                Trip Name
              </th>
              <th
                className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                  isDark ? 'text-gray-400' : 'text-gray-500'
                }`}
              >
                Date
              </th>
              <th
                className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                  isDark ? 'text-gray-400' : 'text-gray-500'
                }`}
              >
                Price
              </th>
            </tr>
          </thead>
          <tbody
            className={`divide-y ${isDark ? 'bg-[#3a2f4a] divide-[#4a3f5a]' : 'bg-white divide-gray-200'}`}
          >
            {bookings.map((booking) => (
              <tr key={booking.id} className={isDark ? 'hover:bg-[#4a3f5a]' : 'hover:bg-gray-50'}>
                <td
                  className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                    isDark ? 'text-gray-200' : 'text-gray-900'
                  }`}
                >
                  #{booking.id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(
                      booking.booking_type
                    )}`}
                  >
                    {booking.booking_type}
                  </span>
                </td>
                <td
                  className={`px-6 py-4 text-sm ${isDark ? 'text-gray-200' : 'text-gray-900'}`}
                >
                  {booking.trip_title ? truncateText(booking.trip_title, 30) : '—'}
                </td>
                <td
                  className={`px-6 py-4 whitespace-nowrap text-sm ${
                    isDark ? 'text-gray-400' : 'text-gray-500'
                  }`}
                >
                  {new Date(booking.date).toLocaleDateString()}
                </td>
                <td
                  className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                    isDark ? 'text-gray-200' : 'text-gray-900'
                  }`}
                >
                  {typeof booking.total_amount === 'number'
                    ? booking.total_amount.toFixed(2)
                    : parseFloat(booking.total_amount || '0').toFixed(2)}{' '}
                  DA
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {bookings.length === 0 && (
          <div className="text-center py-12">
            <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>No bookings found</p>
          </div>
        )}
      </div>
    </div>
  );
}
