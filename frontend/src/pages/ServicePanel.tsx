import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import PatientDetailModal from '../components/PatientDetailModal';
import AddPatientModal from '../components/AddPatientModal';
import { useTheme } from '../contexts/ThemeContext';
import { exportPatientsToPDF } from '../utils/exportPDF';

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
  clinicId: string;
  panelType: string;
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
  const { isDark, toggleTheme } = useTheme();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'list' | 'cards'>('cards');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  const [sortBy, setSortBy] = useState<'room' | 'name' | 'date'>('room');
  const [filterDoctor, setFilterDoctor] = useState<string>('all');
  const [filterGender, setFilterGender] = useState<string>('all');
  const [showStats, setShowStats] = useState(true);

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

  const deletePatient = async (patientId: string) => {
    if (!confirm('Bu hastayı silmek istediğinizden emin misiniz?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/patients/${patientId}?clinicId=${selectedClinic.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchPatients();
    } catch (error) {
      console.error('Failed to delete patient:', error);
    }
  };

  const transferPatient = async (patientId: string, newPanelType: string) => {
    try {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      await axios.post(
        `${API_URL}/patients/${patientId}/transfer?clinicId=${selectedClinic.id}`,
        {
          panelType: newPanelType,
          assignedUserId: newPanelType === 'TAKIP' ? user.id : null,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchPatients();
    } catch (error) {
      console.error('Failed to transfer patient:', error);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const toggleCard = (patientId: string) => {
    const newExpanded = new Set(expandedCards);
    if (newExpanded.has(patientId)) {
      newExpanded.delete(patientId);
    } else {
      newExpanded.add(patientId);
    }
    setExpandedCards(newExpanded);
  };

  const getDaysAdmitted = (admissionDate: string) => {
    const days = Math.floor((Date.now() - new Date(admissionDate).getTime()) / (1000 * 60 * 60 * 24));
    return days;
  };

  // Filtering
  let filteredPatients = patients.filter(p =>
    (`${p.firstName} ${p.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.diagnosis.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.roomNumber?.toLowerCase().includes(searchQuery.toLowerCase())) &&
    (filterDoctor === 'all' || p.attendingDoctor === filterDoctor) &&
    (filterGender === 'all' || p.gender === filterGender)
  );

  // Sorting
  filteredPatients.sort((a, b) => {
    if (sortBy === 'room') {
      return (a.roomNumber || '').localeCompare(b.roomNumber || '');
    } else if (sortBy === 'name') {
      return `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`);
    } else {
      return new Date(b.admissionDate).getTime() - new Date(a.admissionDate).getTime();
    }
  });

  // Stats
  const doctors = [...new Set(patients.map(p => p.attendingDoctor))];
  const stats = {
    total: patients.length,
    byDoctor: doctors.map(doc => ({
      name: doc,
      count: patients.filter(p => p.attendingDoctor === doc).length,
    })),
    avgDays: patients.length ? Math.round(patients.reduce((sum, p) => sum + getDaysAdmitted(p.admissionDate), 0) / patients.length) : 0,
  };

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 pb-24 md:pb-8">
      {/* Desktop Navbar */}
      <nav className="hidden md:block sticky top-0 z-40 backdrop-blur-md bg-white/80 border-b border-slate-200/50 shadow-sm">
        <div className="max-w-[1600px] mx-auto px-6">
          <div className="flex items-center justify-between h-16">
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

            <div className="flex items-center space-x-3">
              <button
                onClick={() => exportPatientsToPDF(filteredPatients, selectedClinic.name)}
                className="px-4 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all flex items-center space-x-2"
                title="PDF Yazdır"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                <span className="hidden lg:inline">Yazdır</span>
              </button>
              <button
                onClick={toggleTheme}
                className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all"
                title="Dark Mode"
              >
                {isDark ? (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                )}
              </button>
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

      {/* Mobile Header */}
      <div className="md:hidden sticky top-0 z-40 backdrop-blur-md bg-white/90 border-b border-slate-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-bold text-slate-900">Servis Paneli</h1>
          <button
            onClick={() => setShowStats(!showStats)}
            className="p-2 hover:bg-slate-100 rounded-lg"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1600px] mx-auto px-4 md:px-6 py-6 md:py-8">
        {/* Stats Section */}
        {showStats && (
          <div className="mb-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
              <div className="text-sm text-slate-500 mb-1">Toplam Hasta</div>
              <div className="text-2xl font-bold text-sky-700">{stats.total}</div>
            </div>
            <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
              <div className="text-sm text-slate-500 mb-1">Ort. Yatış Süresi</div>
              <div className="text-2xl font-bold text-emerald-700">{stats.avgDays} gün</div>
            </div>
            <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm col-span-2">
              <div className="text-sm text-slate-500 mb-2">Doktorlara Göre</div>
              <div className="space-y-1">
                {stats.byDoctor.slice(0, 2).map((doc, i) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span className="text-slate-700 truncate mr-2">{doc.name}</span>
                    <span className="font-semibold text-slate-900">{doc.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Header Actions */}
        <div className="mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900">
              Servis Hastaları ({filteredPatients.length})
            </h2>

            <button
              onClick={() => setShowAddModal(true)}
              className="px-6 py-3 bg-gradient-to-r from-sky-600 to-sky-700 text-white rounded-xl font-semibold hover:from-sky-700 hover:to-sky-800 transition-all shadow-lg shadow-sky-600/30 active:scale-95 flex items-center justify-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>Yeni Hasta</span>
            </button>
          </div>

          {/* Filters & View Toggle */}
          <div className="space-y-3">
            {/* Search */}
            <div className="relative">
              <input
                type="text"
                placeholder="Hasta adı, tanı veya oda ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
              />
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            {/* Filters Row */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                <option value="room">Oda Sıralı</option>
                <option value="name">İsim Sıralı</option>
                <option value="date">Tarih Sıralı</option>
              </select>

              {/* Filter by Doctor */}
              <select
                value={filterDoctor}
                onChange={(e) => setFilterDoctor(e.target.value)}
                className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                <option value="all">Tüm Doktorlar</option>
                {doctors.map((doc) => (
                  <option key={doc} value={doc}>{doc}</option>
                ))}
              </select>

              {/* Filter by Gender */}
              <select
                value={filterGender}
                onChange={(e) => setFilterGender(e.target.value)}
                className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                <option value="all">Tüm Cinsiyetler</option>
                <option value="MALE">Erkek</option>
                <option value="FEMALE">Kadın</option>
                <option value="OTHER">Diğer</option>
              </select>

              {/* View Toggle */}
              <div className="ml-auto flex items-center space-x-2 bg-white rounded-xl border border-slate-200 p-1">
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
            <p className="text-slate-500 text-sm">Filtreleri temizleyin veya yeni hasta ekleyin</p>
          </div>
        ) : viewMode === 'cards' ? (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
            {filteredPatients.map((patient) => (
              <PatientCard
                key={patient.id}
                patient={patient}
                isExpanded={expandedCards.has(patient.id)}
                onToggle={() => toggleCard(patient.id)}
                onDelete={deletePatient}
                onTransfer={transferPatient}
                onUpdate={fetchPatients}
              />
            ))}
          </div>
        ) : (
          <PatientTable
            patients={filteredPatients}
            onSelect={setSelectedPatient}
          />
        )}
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 shadow-lg">
        <div className="grid grid-cols-5 gap-1 p-2">
          <button
            onClick={() => navigate('/panels')}
            className="flex flex-col items-center py-2 text-slate-600 hover:text-sky-700"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className="text-[10px] mt-1">Ana Sayfa</span>
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex flex-col items-center py-2 text-sky-700"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span className="text-[10px] mt-1 font-semibold">Ekle</span>
          </button>
          <button
            onClick={() => exportPatientsToPDF(filteredPatients, selectedClinic.name)}
            className="flex flex-col items-center py-2 text-slate-600 hover:text-purple-700"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            <span className="text-[10px] mt-1">Yazdır</span>
          </button>
          <button
            onClick={toggleTheme}
            className="flex flex-col items-center py-2 text-slate-600 hover:text-amber-700"
          >
            {isDark ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
            <span className="text-[10px] mt-1">Tema</span>
          </button>
          <button
            onClick={handleLogout}
            className="flex flex-col items-center py-2 text-slate-600 hover:text-red-700"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span className="text-[10px] mt-1">Çıkış</span>
          </button>
        </div>
      </div>

      {/* Patient Detail Modal (List View Only) */}
      {selectedPatient && (
        <PatientDetailModal
          patient={selectedPatient}
          onClose={() => setSelectedPatient(null)}
          onUpdate={fetchPatients}
        />
      )}

      {/* Add Patient Modal */}
      {showAddModal && (
        <AddPatientModal
          clinicId={selectedClinic.id}
          onClose={() => setShowAddModal(false)}
          onSuccess={fetchPatients}
        />
      )}
    </div>
  );
}

// Patient Card Component with Expandable Details
function PatientCard({ patient, isExpanded, onToggle, onDelete, onTransfer, onUpdate }: {
  patient: Patient;
  isExpanded: boolean;
  onToggle: () => void;
  onDelete: (id: string) => void;
  onTransfer: (id: string, panelType: string) => void;
  onUpdate: () => void;
}) {
  const days = Math.floor((Date.now() - new Date(patient.admissionDate).getTime()) / (1000 * 60 * 60 * 24));

  return (
    <div className="bg-white rounded-2xl border border-slate-200/50 shadow-md overflow-hidden transition-all">
      {/* Card Header - Always Visible */}
      <button
        onClick={onToggle}
        className="w-full p-4 md:p-6 text-left hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-3">
            {/* Room Number Badge */}
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-sky-600 to-sky-700 flex items-center justify-center text-white font-bold shadow-lg">
              {patient.roomNumber || '?'}
            </div>
            <div>
              <h3 className="font-bold text-slate-900">
                {patient.firstName} {patient.lastName}
              </h3>
              <p className="text-sm text-slate-500">{patient.age} yaş • {patient.gender}</p>
            </div>
          </div>
          <div className="flex flex-col items-end space-y-1">
            <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium">
              {days} gün
            </span>
            <svg
              className={`w-5 h-5 text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        {/* Quick Info */}
        <div className="grid grid-cols-2 gap-2">
          <div className="p-2 bg-slate-50 rounded-lg">
            <div className="text-xs text-slate-500">Tanı</div>
            <div className="font-semibold text-slate-900 text-sm truncate">{patient.diagnosis}</div>
          </div>
          <div className="p-2 bg-slate-50 rounded-lg">
            <div className="text-xs text-slate-500">Yatak</div>
            <div className="font-semibold text-slate-900 text-sm">{patient.bedNumber || '-'}</div>
          </div>
        </div>
      </button>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="border-t border-slate-200 p-4 md:p-6 space-y-4 bg-slate-50/50">
          {/* Doctor & Admission */}
          <div className="space-y-2">
            <div className="flex items-center text-sm">
              <span className="text-slate-500 w-24">Doktor:</span>
              <span className="font-semibold text-slate-900">{patient.attendingDoctor}</span>
            </div>
            <div className="flex items-center text-sm">
              <span className="text-slate-500 w-24">Yatış:</span>
              <span className="text-slate-700">{new Date(patient.admissionDate).toLocaleDateString('tr-TR')}</span>
            </div>
          </div>

          {/* Visit Note */}
          {patient.visitNote && (
            <div>
              <div className="text-xs text-slate-500 mb-1">Vizit Notu</div>
              <div className="p-3 bg-white rounded-lg text-sm text-slate-700 max-h-20 overflow-y-auto">
                {patient.visitNote}
              </div>
            </div>
          )}

          {/* Todos */}
          <div>
            <div className="text-xs text-slate-500 mb-2">Yapılacaklar ({patient.todos.filter(t => !t.completed).length}/{patient.todos.length})</div>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {patient.todos.slice(0, 3).map((todo) => (
                <div key={todo.id} className="flex items-center space-x-2 text-sm">
                  <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${todo.completed ? 'bg-emerald-500 border-emerald-500' : 'border-slate-300'}`}>
                    {todo.completed && (
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <span className={todo.completed ? 'line-through text-slate-400' : 'text-slate-700'}>
                    {todo.description}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Orders */}
          {patient.orders.length > 0 && (
            <div>
              <div className="text-xs text-slate-500 mb-2">İlaç Orderları ({patient.orders.length})</div>
              <div className="space-y-1 max-h-24 overflow-y-auto">
                {patient.orders.slice(0, 2).map((order) => (
                  <div key={order.id} className="text-sm text-slate-700">
                    💊 {order.medication} {order.dosage && `• ${order.dosage}`}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-wrap gap-2 pt-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onTransfer(patient.id, 'TAKIP');
              }}
              className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors"
            >
              Takibe Al
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(patient.id);
              }}
              className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
            >
              Sil
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Patient Table Component
function PatientTable({ patients, onSelect }: { patients: Patient[]; onSelect: (p: Patient) => void }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden overflow-x-auto">
      <table className="w-full">
        <thead className="bg-slate-50 border-b border-slate-200">
          <tr>
            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Oda</th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Hasta</th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Yaş</th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Tanı</th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Doktor</th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Yatış Süresi</th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Durum</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {patients.map((patient) => {
            const days = Math.floor((Date.now() - new Date(patient.admissionDate).getTime()) / (1000 * 60 * 60 * 24));
            return (
              <tr
                key={patient.id}
                onClick={() => onSelect(patient)}
                className="hover:bg-slate-50 cursor-pointer transition-colors"
              >
                <td className="px-6 py-4">
                  <span className="inline-flex items-center justify-center w-10 h-10 bg-sky-600 text-white font-bold rounded-lg">
                    {patient.roomNumber || '?'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="font-semibold text-slate-900">
                    {patient.firstName} {patient.lastName}
                  </div>
                  <div className="text-sm text-slate-500">Yatak {patient.bedNumber || '-'}</div>
                </td>
                <td className="px-6 py-4 text-slate-600">{patient.age}</td>
                <td className="px-6 py-4 text-slate-600">{patient.diagnosis}</td>
                <td className="px-6 py-4 text-slate-600">{patient.attendingDoctor}</td>
                <td className="px-6 py-4">
                  <span className="inline-flex px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium">
                    {days} gün
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex px-3 py-1 bg-sky-100 text-sky-700 rounded-full text-xs font-medium">
                    Aktif
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
