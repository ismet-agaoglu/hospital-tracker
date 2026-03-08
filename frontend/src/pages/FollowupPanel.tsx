import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import PatientDetailModal from '../components/PatientDetailModal';
import { formatGender } from '../utils/helpers';

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

export default function FollowupPanel() {
  const navigate = useNavigate();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

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
        `${API_URL}/patients/clinic/${selectedClinic.id}?panelType=TAKIP&clinicId=${selectedClinic.id}`,
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
    p.diagnosis.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-16 h-16 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-slate-600 dark:text-slate-300 font-medium">Hastalar yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      {/* Navbar */}
      <nav className="sticky top-0 z-40 backdrop-blur-md bg-white/80 dark:bg-slate-900/80 border-b border-slate-200/50 dark:border-slate-700/60 shadow-sm">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm">
                <button
                  onClick={() => navigate('/panels')}
                  className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  {selectedClinic.name}
                </button>
                <span className="text-slate-300 dark:text-slate-600">/</span>
                <span className="font-semibold text-emerald-700 dark:text-emerald-400">Hasta Takip</span>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => navigate('/panels')}
                className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all"
              >
                ← Geri
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all"
              >
                Çıkış
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
              Takip Hastalarım
            </h1>
            <p className="text-slate-600 dark:text-slate-300">
              Size atanan {patients.length} hasta
            </p>
          </div>

          {/* Search */}
          <div className="max-w-md relative">
            <input
              type="text"
              placeholder="Hasta adı veya tanı ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
            />
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Patient List */}
        {filteredPatients.length === 0 ? (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full mb-4">
              <svg className="w-10 h-10 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <p className="text-slate-600 dark:text-slate-300 text-lg mb-2">
              {patients.length === 0 ? 'Size henüz hasta atanmamış' : 'Hasta bulunamadı'}
            </p>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Arama kriterlerinizi değiştirerek tekrar deneyin</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredPatients.map((patient) => (
              <button
                key={patient.id}
                onClick={() => setSelectedPatient(patient)}
                className="group bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-md border border-slate-200/50 dark:border-slate-700/60 hover:shadow-xl transition-all hover:-translate-y-1 text-left"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center">
                      <span className="text-lg font-bold text-emerald-700">
                        {patient.firstName.charAt(0)}{patient.lastName.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-slate-100 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                        {patient.firstName} {patient.lastName}
                      </h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400">{patient.age} yaş • {formatGender(patient.gender)}</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium">
                    Takipte
                  </span>
                </div>

                {/* Info */}
                <div className="space-y-2 mb-4">
                  <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Tanı</div>
                    <div className="font-semibold text-slate-900 dark:text-slate-100 text-sm">{patient.diagnosis}</div>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Doktor</div>
                    <div className="font-semibold text-slate-900 dark:text-slate-100 text-sm">{patient.attendingDoctor}</div>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-700">
                  <div className="flex items-center space-x-4 text-sm">
                    <div className="flex items-center text-slate-600 dark:text-slate-300">
                      <svg className="w-4 h-4 mr-1 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      {patient.todos.filter(t => !t.completed).length} todo
                    </div>
                    <div className="flex items-center text-slate-600 dark:text-slate-300">
                      <svg className="w-4 h-4 mr-1 text-sky-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                      </svg>
                      {patient.orders.length} order
                    </div>
                  </div>
                  <svg className="w-5 h-5 text-emerald-600 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Patient Detail Modal */}
      {selectedPatient && (
        <PatientDetailModal
          patient={selectedPatient}
          onClose={() => setSelectedPatient(null)}
          onUpdate={() => {
            fetchPatients();
            const updatedPatient = patients.find(p => p.id === selectedPatient.id);
            if (updatedPatient) {
              setSelectedPatient(updatedPatient);
            }
          }}
        />
      )}
    </div>
  );
}
