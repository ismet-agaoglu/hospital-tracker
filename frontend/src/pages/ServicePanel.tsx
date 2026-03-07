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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-sky-50 to-emerald-50 pb-24 md:pb-8">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Servis Paneli</h1>
              <p className="text-sm text-slate-500">{selectedClinic.name}</p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowAllTodosModal(true)}
                className="px-4 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all flex items-center space-x-2"
                title="Tüm Yapılacaklar"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
                <span className="hidden lg:inline">Yapılacaklar</span>
              </button>
              <button
                onClick={() => setShowSettingsModal(true)}
                className="px-4 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all flex items-center space-x-2"
                title="Ayarlar"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="hidden lg:inline">Ayarlar</span>
              </button>
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
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Section */}
        {showStats && (
          <div className="mb-6 space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
                <div className="text-sm text-slate-500 mb-1">Toplam Hasta</div>
                <div className="text-3xl font-bold text-sky-700">{stats.total}</div>
              </div>
              <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm col-span-2">
                <div className="text-sm text-slate-500 mb-3">Doktorlara Göre</div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 max-h-32 overflow-y-auto">
                  {stats.byDoctor.map((doc, i) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span className="text-slate-700 truncate mr-2">{doc.name}</span>
                      <span className="font-bold text-sky-700">{doc.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            {/* Search */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Hasta ara (isim, tanı, oda)..."
                  className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white shadow-sm"
                />
                <svg className="absolute left-3 top-3.5 w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowStats(!showStats)}
                className="p-3 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all shadow-sm"
                title="İstatistikler"
              >
                <svg className="w-5 h-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode('card')}
                className={`p-3 border rounded-xl transition-all shadow-sm ${
                  viewMode === 'card'
                    ? 'bg-sky-600 text-white border-sky-600'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-3 border rounded-xl transition-all shadow-sm ${
                  viewMode === 'list'
                    ? 'bg-sky-600 text-white border-sky-600'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <button
                onClick={() => setShowAddModal(true)}
                className="px-6 py-3 bg-sky-600 text-white rounded-xl hover:bg-sky-700 transition-all font-semibold shadow-sm flex items-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span className="hidden md:inline">Yeni Hasta</span>
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-4 py-2 border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm shadow-sm"
            >
              <option value="room">Oda Numarasına Göre</option>
              <option value="name">İsme Göre</option>
              <option value="date">Tarihe Göre</option>
            </select>
            <select
              value={filterDoctor}
              onChange={(e) => setFilterDoctor(e.target.value)}
              className="px-4 py-2 border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm shadow-sm"
            >
              <option value="all">Tüm Doktorlar</option>
              {uniqueDoctors.map((doc) => (
                <option key={doc} value={doc}>{doc}</option>
              ))}
            </select>
            <select
              value={filterGender}
              onChange={(e) => setFilterGender(e.target.value)}
              className="px-4 py-2 border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm shadow-sm"
            >
              <option value="all">Tüm Cinsiyetler</option>
              <option value="Erkek">Erkek</option>
              <option value="Kadın">Kadın</option>
            </select>
          </div>
        </div>

        {/* Patient List/Cards */}
        {filteredPatients.length === 0 ? (
          <div className="text-center py-12 text-slate-500">Hasta bulunamadı</div>
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

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 shadow-lg">
        <div className="grid grid-cols-6 gap-1 p-2">
          <button
            onClick={() => navigate('/panels')}
            className="flex flex-col items-center py-2 text-slate-600"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className="text-[10px] mt-1">Geri</span>
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
            onClick={() => setShowAllTodosModal(true)}
            className="flex flex-col items-center py-2 text-emerald-700"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
            <span className="text-[10px] mt-1">Todo</span>
          </button>
          <button
            onClick={() => setShowSettingsModal(true)}
            className="flex flex-col items-center py-2 text-slate-600"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="text-[10px] mt-1">Ayarlar</span>
          </button>
          <button
            onClick={toggleTheme}
            className="flex flex-col items-center py-2 text-slate-600"
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
            className="flex flex-col items-center py-2 text-slate-600"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span className="text-[10px] mt-1">Çıkış</span>
          </button>
        </div>
      </div>
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
            const days = Math.floor((Date.now() - new Date(patient.admissionDate).getTime()) / (1000 * 60 * 60 * 24)) + 1;
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
