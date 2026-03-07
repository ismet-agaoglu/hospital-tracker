import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = '/api'; // Proxy via Vite

interface Clinic {
  id: string;
  name: string;
  address?: string;
  _count?: {
    patients: number;
    users: number;
  };
}

export default function ClinicSelect() {
  const navigate = useNavigate();
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchClinics();
  }, []);

  const fetchClinics = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await axios.get(`${API_URL}/clinics`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setClinics(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch clinics');
      if (err.response?.status === 401) {
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const selectClinic = (clinic: Clinic) => {
    localStorage.setItem('selectedClinic', JSON.stringify(clinic));
    navigate('/panels');
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4">⏳</div>
          <p className="text-gray-600">Klinikler yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <span className="text-2xl">🏥</span>
              <span className="ml-2 text-xl font-bold text-gray-900">Hospital Tracker</span>
            </div>
            <button
              onClick={handleLogout}
              className="text-gray-600 hover:text-gray-900 font-medium"
            >
              Çıkış Yap
            </button>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Klinik Seçin</h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {clinics.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-5xl mb-4">🏥</div>
            <p className="text-gray-600">Henüz erişiminiz olan bir klinik yok.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {clinics.map((clinic) => (
              <button
                key={clinic.id}
                onClick={() => selectClinic(clinic)}
                className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition text-left"
              >
                <div className="flex items-center mb-4">
                  <div className="text-4xl mr-4">🏥</div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{clinic.name}</h3>
                    {clinic.address && (
                      <p className="text-sm text-gray-500">{clinic.address}</p>
                    )}
                  </div>
                </div>

                {clinic._count && (
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span>👥 {clinic._count.users} kullanıcı</span>
                    <span>👤 {clinic._count.patients} hasta</span>
                  </div>
                )}

                <div className="mt-4 text-indigo-600 font-medium">
                  Seç →
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
