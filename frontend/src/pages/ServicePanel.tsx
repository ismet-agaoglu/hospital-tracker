import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = '/api';

interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  age: number;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  diagnosis: string;
  attendingDoctor: string;
  admissionDate: string;
  roomNumber?: string;
  bedNumber?: string;
  visitNote?: string;
  todos: Todo[];
  orders: Order[];
}

interface Todo {
  id: string;
  description: string;
  completed: boolean;
}

interface Order {
  id: string;
  medication: string;
  dosage?: string;
  frequency?: string;
  notes?: string;
}

export default function ServicePanel() {
  const navigate = useNavigate();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'list' | 'cards'>('cards');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const selectedClinic = JSON.parse(localStorage.getItem('selectedClinic') || '{}');

  useEffect(() => {
    if (!selectedClinic.id) {
      navigate('/clinics');
      return;
    }
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${API_URL}/patients/clinic/${selectedClinic.id}?panelType=SERVIS&clinicId=${selectedClinic.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPatients(response.data);
    } catch (error) {
      console.error('Failed to fetch patients:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const filteredPatients = patients.filter(p =>
    `${p.firstName} ${p.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.diagnosis.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.roomNumber?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-16 h-16 border-4 border-sky-600 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-slate-600 font-medium">Hastalar yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Navbar */}
      <nav className="sticky top-0 z-40 backdrop-blur-md bg-white/80 border-b border-slate-200/50 shadow-sm">
        <div className="max-w-[1600px] mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            {/* Left: Breadcrumb */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm">
                <button
                  onClick={() => navigate('/panels')}
                  className="text-slate-500 hover:text-slate-900 transition-colors"
                >
                  {selectedClinic.name}
                </button>
                <span className="text-slate-300">/</span>
                <span className="font-semibold text-sky-700">Servis Paneli</span>
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center space-x-3">
              <button
                onClick={() => navigate('/panels')}
                className="px-4 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all"
              >
                ← Geri
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all"
              >
                Çıkış
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-[1600px] mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">
                Servis Hastaları
              </h1>
              <p className="text-slate-600">
                Toplam {patients.length} hasta
              </p>
            </div>

            <button
              onClick={() => setShowAddModal(true)}
              className="px-6 py-3 bg-gradient-to-r from-sky-600 to-sky-700 text-white rounded-xl font-semibold hover:from-sky-700 hover:to-sky-800 transition-all shadow-lg shadow-sky-600/30 hover:shadow-xl active:scale-95 flex items-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>Yeni Hasta</span>
            </button>
          </div>

          {/* Filters & View Toggle */}
          <div className="flex items-center justify-between gap-4">
            {/* Search */}
            <div className="flex-1 max-w-md relative">
              <input
                type="text"
                placeholder="Hasta adı, tanı veya oda numarası ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
              />
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            {/* View Toggle */}
            <div className="flex items-center space-x-2 bg-white rounded-xl border border-slate-200 p-1">
              <button
                onClick={() => setViewMode('cards')}
                className={`px-4 py-2 rounded-lg transition-all ${
                  viewMode === 'cards'
                    ? 'bg-sky-600 text-white shadow-md'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-4 py-2 rounded-lg transition-all ${
                  viewMode === 'list'
                    ? 'bg-sky-600 text-white shadow-md'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Patient List */}
        {filteredPatients.length === 0 ? (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-slate-100 rounded-full mb-4">
              <svg className="w-10 h-10 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <p className="text-slate-600 text-lg mb-2">Hasta bulunamadı</p>
            <p className="text-slate-500 text-sm">Yeni hasta eklemek için yukarıdaki butonu kullanın</p>
          </div>
        ) : viewMode === 'cards' ? (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredPatients.map((patient) => (
              <PatientCard
                key={patient.id}
                patient={patient}
                onClick={() => setSelectedPatient(patient)}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Hasta</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Yaş</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Tanı</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Doktor</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Oda/Yatak</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Durum</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPatients.map((patient) => (
                  <tr
                    key={patient.id}
                    onClick={() => setSelectedPatient(patient)}
                    className="hover:bg-slate-50 cursor-pointer transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900">
                        {patient.firstName} {patient.lastName}
                      </div>
                      <div className="text-sm text-slate-500">{patient.gender}</div>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{patient.age}</td>
                    <td className="px-6 py-4 text-slate-600">{patient.diagnosis}</td>
                    <td className="px-6 py-4 text-slate-600">{patient.attendingDoctor}</td>
                    <td className="px-6 py-4 text-slate-600">
                      {patient.roomNumber || '-'} / {patient.bedNumber || '-'}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium">
                        Aktif
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Patient Detail Modal - Will implement next */}
      {selectedPatient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-slate-900">
                  {selectedPatient.firstName} {selectedPatient.lastName}
                </h2>
                <button
                  onClick={() => setSelectedPatient(null)}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <p className="text-slate-600">Detay modal yakında eklenecek...</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Patient Card Component
function PatientCard({ patient, onClick }: { patient: Patient; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="group bg-white rounded-2xl p-6 shadow-md border border-slate-200/50 hover:shadow-xl transition-all hover:-translate-y-1 text-left"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-sky-100 to-emerald-100 flex items-center justify-center">
            <span className="text-lg font-bold text-sky-700">
              {patient.firstName.charAt(0)}{patient.lastName.charAt(0)}
            </span>
          </div>
          <div>
            <h3 className="font-bold text-slate-900 group-hover:text-sky-700 transition-colors">
              {patient.firstName} {patient.lastName}
            </h3>
            <p className="text-sm text-slate-500">{patient.age} yaş • {patient.gender}</p>
          </div>
        </div>
        <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium">
          Aktif
        </span>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="p-3 bg-slate-50 rounded-lg">
          <div className="text-xs text-slate-500 mb-1">Tanı</div>
          <div className="font-semibold text-slate-900 text-sm">{patient.diagnosis}</div>
        </div>
        <div className="p-3 bg-slate-50 rounded-lg">
          <div className="text-xs text-slate-500 mb-1">Doktor</div>
          <div className="font-semibold text-slate-900 text-sm">{patient.attendingDoctor}</div>
        </div>
        <div className="p-3 bg-slate-50 rounded-lg">
          <div className="text-xs text-slate-500 mb-1">Oda</div>
          <div className="font-semibold text-slate-900 text-sm">{patient.roomNumber || '-'}</div>
        </div>
        <div className="p-3 bg-slate-50 rounded-lg">
          <div className="text-xs text-slate-500 mb-1">Yatak</div>
          <div className="font-semibold text-slate-900 text-sm">{patient.bedNumber || '-'}</div>
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-100">
        <div className="flex items-center space-x-4 text-sm">
          <div className="flex items-center text-slate-600">
            <svg className="w-4 h-4 mr-1 text-sky-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            {patient.todos.length} todo
          </div>
          <div className="flex items-center text-slate-600">
            <svg className="w-4 h-4 mr-1 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
            {patient.orders.length} order
          </div>
        </div>
        <svg className="w-5 h-5 text-sky-600 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </button>
  );
}
