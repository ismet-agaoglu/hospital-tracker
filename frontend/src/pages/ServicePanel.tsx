import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import PatientDetailModal from '../components/PatientDetailModal';
import AddPatientModal from '../components/AddPatientModal';
import PatientCard from '../components/PatientCard';
import SettingsModal from '../components/SettingsModal';
import AllTodosModal from '../components/AllTodosModal';
import { useTheme } from '../contexts/ThemeContext';
import { exportPatientsToPDF } from '../utils/exportPDF';

const API_URL = '/api';

interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  age: number;
  gender: string;
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
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'card' | 'list'>('card');
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  const [sortBy, setSortBy] = useState<'room' | 'name' | 'date'>('room');
  const [filterDoctor, setFilterDoctor] = useState<string>('all');
  const [filterGender, setFilterGender] = useState<string>('all');
  const [showStats, setShowStats] = useState(false); // Default kapalı
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showAllTodosModal, setShowAllTodosModal] = useState(false);
  const [doctors, setDoctors] = useState<Array<{name: string; color: string}>>([]);

  const token = localStorage.getItem('token');
  const selectedClinic = JSON.parse(localStorage.getItem('selectedClinic') || '{}');

  useEffect(() => {
    if (!selectedClinic.id) {
      navigate('/clinics');
      return;
    }
    fetchPatients();
    loadDoctors();
  }, []);


  const loadDoctors = () => {
    const saved = localStorage.getItem('doctors');
    if (saved) {
      setDoctors(JSON.parse(saved));
    }
  };

  const getDoctorColor = (doctorName: string) => {
    const doctor = doctors.find(d => d.name === doctorName);
    return doctor ? `bg-gradient-to-br ${doctor.color}` : 'bg-gradient-to-br from-slate-600 to-slate-700';
  };

  const fetchPatients = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/patients/clinic/${selectedClinic.id}?panelType=SERVIS&clinicId=${selectedClinic.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPatients(response.data);
      setFilteredPatients(response.data);
    } catch (error) {
      console.error('Failed to fetch patients:', error);
    }
  };

  useEffect(() => {
    let filtered = patients.filter(p => {
      const matchesSearch = 
        p.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.diagnosis.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.roomNumber?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesDoctor = filterDoctor === 'all' || p.attendingDoctor === filterDoctor;
      const matchesGender = filterGender === 'all' || p.gender === filterGender;

      return matchesSearch && matchesDoctor && matchesGender;
    });

    // Sorting
    filtered.sort((a, b) => {
      if (sortBy === 'room') {
        return (parseInt(a.roomNumber || '999') - parseInt(b.roomNumber || '999'));
      } else if (sortBy === 'name') {
        return `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`);
      } else {
        return new Date(b.admissionDate).getTime() - new Date(a.admissionDate).getTime();
      }
    });

    setFilteredPatients(filtered);
  }, [searchQuery, patients, sortBy, filterDoctor, filterGender]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('selectedClinic');
    navigate('/login');
  };

  const deletePatient = async (id: string) => {
    if (!confirm('Bu hastayı silmek istediğinizden emin misiniz?')) return;
    try {
      await axios.delete(`${API_URL}/patients/${id}?clinicId=${selectedClinic.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchPatients();
    } catch (error) {
      console.error('Failed to delete patient:', error);
    }
  };

  const transferPatient = async (id: string, panelType: string) => {
    try {
      await axios.put(
        `${API_URL}/patients/${id}?clinicId=${selectedClinic.id}`,
        { panelType },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchPatients();
    } catch (error) {
      console.error('Failed to transfer patient:', error);
    }
  };

  const toggleCard = (id: string) => {
    setExpandedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const getDaysAdmitted = (admissionDate: string) => {
    return Math.floor((Date.now() - new Date(admissionDate).getTime()) / (1000 * 60 * 60 * 24)) + 1;
  };

  // Stats
  const uniqueDoctors = [...new Set(patients.map(p => p.attendingDoctor))];
  const stats = {
    total: patients.length,
    byDoctor: uniqueDoctors.map(doc => ({
      name: doc,
      count: patients.filter(p => p.attendingDoctor === doc).length,
    })),
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20 md:pb-8 overflow-x-hidden">
      {/* Minimal Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-lg md:text-xl font-semibold text-slate-900 truncate">Servis • {selectedClinic.name}</h1>
            <div className="flex items-center space-x-1 md:space-x-2">
              {/* Desktop Actions */}
              <button
                onClick={() => setShowAddModal(true)}
                className="hidden lg:flex items-center space-x-2 px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 text-sm font-medium"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span>Yeni Hasta</span>
              </button>
              
              <button
                onClick={() => setShowAllTodosModal(true)}
                className="hidden md:block p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                title="Yapılacaklar"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </button>
              
              <button
                onClick={() => setShowSettingsModal(true)}
                className="hidden md:block p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                title="Ayarlar"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
              
              <button
                onClick={() => exportPatientsToPDF(filteredPatients, selectedClinic.name)}
                className="hidden md:block p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                title="PDF Yazdır"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
              </button>
              
              <div className="hidden md:block w-px h-6 bg-slate-300"></div>
              
              <button
                onClick={() => navigate('/panels')}
                className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                title="Geri"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
              
              <button
                onClick={handleLogout}
                className="hidden md:block p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                title="Çıkış"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8 mb-20 md:mb-0">
        {/* Compact Stats */}
        {showStats && (
          <div className="mb-4 bg-white rounded-lg border border-slate-200 p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-slate-700">Toplam: {stats.total}</span>
              <button
                onClick={() => setShowStats(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {stats.byDoctor.map((doc, i) => (
                <div key={i} className="flex items-center justify-between p-2 bg-slate-50 rounded text-xs">
                  <span className="text-slate-600 truncate mr-2">{doc.name}</span>
                  <span className="font-semibold text-sky-600">{doc.count}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Compact Controls */}
        <div className="mb-4 space-y-3">
          {/* Row 1: Search + Quick Actions */}
          <div className="flex items-center gap-2">
            {/* Search */}
            <div className="relative flex-1 min-w-0">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Ara..."
                className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm"
              />
              <svg className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            {/* Stats Toggle */}
            <button
              onClick={() => setShowStats(!showStats)}
              className={`flex-shrink-0 p-2 border rounded-lg ${showStats ? 'bg-sky-600 text-white border-sky-600' : 'border-slate-200 text-slate-600'}`}
              title="İstatistikler"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </button>

            {/* View Toggle */}
            <div className="flex flex-shrink-0 border border-slate-200 rounded-lg">
              <button
                onClick={() => setViewMode('card')}
                className={`p-2 ${viewMode === 'card' ? 'bg-sky-600 text-white' : 'text-slate-500'} rounded-l-lg transition-colors`}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 ${viewMode === 'list' ? 'bg-sky-600 text-white' : 'text-slate-500'} rounded-r-lg border-l transition-colors`}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>

          {/* Row 2: Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white text-sm focus:ring-2 focus:ring-sky-500"
            >
              <option value="room">Oda</option>
              <option value="name">İsim</option>
              <option value="date">Tarih</option>
            </select>
            <select
              value={filterDoctor}
              onChange={(e) => setFilterDoctor(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white text-sm focus:ring-2 focus:ring-sky-500"
            >
              <option value="all">Tüm Doktorlar</option>
              {uniqueDoctors.map((doc) => (
                <option key={doc} value={doc}>{doc}</option>
              ))}
            </select>
            <select
              value={filterGender}
              onChange={(e) => setFilterGender(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white text-sm focus:ring-2 focus:ring-sky-500"
            >
              <option value="all">Cinsiyet</option>
              <option value="Erkek">Erkek</option>
              <option value="Kadın">Kadın</option>
            </select>
          </div>
        </div>

        {/* Patient List/Cards */}
        {filteredPatients.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl p-8 text-center">
            <div className="mx-auto w-14 h-14 rounded-full bg-sky-50 text-sky-600 flex items-center justify-center mb-4">
              <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V7a2 2 0 00-2-2h-3V3H9v2H6a2 2 0 00-2 2v6m16 0v6a2 2 0 01-2 2H6a2 2 0 01-2-2v-6m16 0h-5m-6 0H4m5 0v-2a1 1 0 011-1h4a1 1 0 011 1v2" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-1">Hasta bulunamadı</h3>
            <p className="text-slate-500 mb-5">Henüz kayıt yok veya filtreler sonucu boş döndü.</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
              <button
                onClick={() => setShowAddModal(true)}
                className="px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 text-sm font-medium"
              >
                + Yeni Hasta Ekle
              </button>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setFilterDoctor('all');
                  setFilterGender('all');
                }}
                className="px-4 py-2 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 text-sm"
              >
                Filtreleri Temizle
              </button>
            </div>
          </div>
        ) : viewMode === 'card' ? (
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
                doctorColor={getDoctorColor(patient.attendingDoctor)}
              />
            ))}
          </div>
        ) : (
          <PatientTable patients={filteredPatients} onSelect={setSelectedPatient} />
        )}
      </div>

      {/* Modals */}
      {selectedPatient && (
        <PatientDetailModal
          patient={selectedPatient}
          onClose={() => setSelectedPatient(null)}
          onUpdate={fetchPatients}
        />
      )}

      {showAddModal && (
        <AddPatientModal
          clinicId={selectedClinic.id}
          panelType="SERVIS"
          onClose={() => setShowAddModal(false)}
          onSuccess={fetchPatients}
        />
      )}

      {/* Settings Modal */}
      {showSettingsModal && (
        <SettingsModal
          onClose={() => setShowSettingsModal(false)}
          onUpdate={() => {
            loadDoctors();
            fetchPatients();
          }}
        />
      )}

      {/* All Todos Modal */}
      {showAllTodosModal && (
        <AllTodosModal
          patients={patients}
          onClose={() => setShowAllTodosModal(false)}
          onUpdate={fetchPatients}
        />
      )}

      {/* Clean Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200">
        <div className="grid grid-cols-4 p-3 gap-2">
          <button
            onClick={() => setShowAddModal(true)}
            className="flex flex-col items-center py-2 text-sky-600"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span className="text-xs mt-1">Ekle</span>
          </button>
          <button
            onClick={() => setShowAllTodosModal(true)}
            className="flex flex-col items-center py-2 text-slate-600"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
            <span className="text-xs mt-1">Görevler</span>
          </button>
          <button
            onClick={() => setShowSettingsModal(true)}
            className="flex flex-col items-center py-2 text-slate-600"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="text-xs mt-1">Ayarlar</span>
          </button>
          <button
            onClick={() => navigate('/panels')}
            className="flex flex-col items-center py-2 text-slate-600"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span className="text-xs mt-1">Geri</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// Patient Table Component
function PatientTable({ patients, onSelect }: { patients: Patient[]; onSelect: (p: Patient) => void }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-x-auto">
      <table className="w-full min-w-[800px]">
        <thead className="bg-slate-50 border-b border-slate-200">
          <tr>
            <th className="px-4 md:px-6 py-3 md:py-4 text-left text-xs md:text-sm font-semibold text-slate-700 whitespace-nowrap">Oda</th>
            <th className="px-4 md:px-6 py-3 md:py-4 text-left text-xs md:text-sm font-semibold text-slate-700 whitespace-nowrap">Hasta</th>
            <th className="px-4 md:px-6 py-3 md:py-4 text-left text-xs md:text-sm font-semibold text-slate-700 whitespace-nowrap">Yaş</th>
            <th className="px-4 md:px-6 py-3 md:py-4 text-left text-xs md:text-sm font-semibold text-slate-700 whitespace-nowrap">Tanı</th>
            <th className="px-4 md:px-6 py-3 md:py-4 text-left text-xs md:text-sm font-semibold text-slate-700 whitespace-nowrap">Doktor</th>
            <th className="px-4 md:px-6 py-3 md:py-4 text-left text-xs md:text-sm font-semibold text-slate-700 whitespace-nowrap">Yatış Süresi</th>
            <th className="px-4 md:px-6 py-3 md:py-4 text-left text-xs md:text-sm font-semibold text-slate-700 whitespace-nowrap">Durum</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {patients.map((patient) => {
            const days = Math.floor((Date.now() - new Date(patient.admissionDate).getTime()) / (1000 * 60 * 60 * 24)) + 1;
            return (
              <tr
                key={patient.id}
                onClick={() => onSelect(patient)}
                className="hover:bg-slate-50 cursor-pointer transition-colors"
              >
                <td className="px-4 md:px-6 py-3 md:py-4">
                  <span className="inline-flex items-center justify-center w-8 h-8 md:w-10 md:h-10 bg-sky-600 text-white font-bold rounded-lg text-sm">
                    {patient.roomNumber || '?'}
                  </span>
                </td>
                <td className="px-4 md:px-6 py-3 md:py-4">
                  <div className="font-semibold text-slate-900 text-sm md:text-base whitespace-nowrap">
                    {patient.firstName} {patient.lastName}
                  </div>
                  <div className="text-xs md:text-sm text-slate-500">Yatak {patient.bedNumber || '-'}</div>
                </td>
                <td className="px-4 md:px-6 py-3 md:py-4 text-slate-600 text-sm">{patient.age}</td>
                <td className="px-4 md:px-6 py-3 md:py-4 text-slate-600 text-sm max-w-[200px] truncate">{patient.diagnosis}</td>
                <td className="px-4 md:px-6 py-3 md:py-4 text-slate-600 text-sm whitespace-nowrap">{patient.attendingDoctor}</td>
                <td className="px-4 md:px-6 py-3 md:py-4">
                  <span className="inline-flex px-2 md:px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs md:text-sm font-medium whitespace-nowrap">
                    {days} gün
                  </span>
                </td>
                <td className="px-4 md:px-6 py-3 md:py-4">
                  <span className="inline-flex px-2 md:px-3 py-1 bg-sky-100 text-sky-700 rounded-full text-xs font-medium whitespace-nowrap">
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
