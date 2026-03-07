import { useState, useEffect } from 'react';

interface Doctor {
  name: string;
  color: string;
}

interface Props {
  onClose: () => void;
  onUpdate: () => void;
}

const PRESET_COLORS = [
  { name: 'Mavi', value: 'from-blue-600 to-blue-700', hex: '#2563eb' },
  { name: 'Yeşil', value: 'from-emerald-600 to-emerald-700', hex: '#10b981' },
  { name: 'Mor', value: 'from-purple-600 to-purple-700', hex: '#9333ea' },
  { name: 'Kırmızı', value: 'from-red-600 to-red-700', hex: '#dc2626' },
  { name: 'Turuncu', value: 'from-orange-600 to-orange-700', hex: '#ea580c' },
  { name: 'Pembe', value: 'from-pink-600 to-pink-700', hex: '#db2777' },
  { name: 'İndigo', value: 'from-indigo-600 to-indigo-700', hex: '#4f46e5' },
  { name: 'Teal', value: 'from-teal-600 to-teal-700', hex: '#0d9488' },
];

export default function SettingsModal({ onClose, onUpdate }: Props) {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [newDoctorName, setNewDoctorName] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('doctors');
    if (saved) {
      setDoctors(JSON.parse(saved));
    }
  }, []);

  const saveDoctors = (updated: Doctor[]) => {
    localStorage.setItem('doctors', JSON.stringify(updated));
    setDoctors(updated);
    onUpdate();
  };

  const addDoctor = () => {
    if (!newDoctorName.trim()) return;
    const newDoctor = {
      name: newDoctorName.trim(),
      color: PRESET_COLORS[doctors.length % PRESET_COLORS.length].value,
    };
    saveDoctors([...doctors, newDoctor]);
    setNewDoctorName('');
  };

  const updateDoctorColor = (index: number, color: string) => {
    const updated = [...doctors];
    updated[index].color = color;
    saveDoctors(updated);
  };

  const deleteDoctor = (index: number) => {
    if (!confirm('Bu doktoru silmek istediğinizden emin misiniz?')) return;
    saveDoctors(doctors.filter((_, i) => i !== index));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pb-20 md:pb-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[calc(100vh-140px)] md:max-h-[90vh] overflow-hidden shadow-2xl my-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-sky-600 to-emerald-600 px-8 py-6 text-white">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Ayarlar</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 overflow-y-auto max-h-[calc(90vh-120px)]">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Doktor Yönetimi</h3>

          {/* Add Doctor */}
          <div className="flex space-x-2 mb-6">
            <input
              type="text"
              value={newDoctorName}
              onChange={(e) => setNewDoctorName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addDoctor()}
              placeholder="Doktor adı (örn: Dr. Mehmet Kaya)"
              className="flex-1 px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
            <button
              onClick={addDoctor}
              className="px-6 py-3 bg-sky-600 text-white rounded-xl hover:bg-sky-700 transition-colors font-semibold"
            >
              Ekle
            </button>
          </div>

          {/* Doctor List */}
          <div className="space-y-3">
            {doctors.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                Henüz doktor eklenmemiş
              </div>
            ) : (
              doctors.map((doctor, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-slate-50 rounded-xl"
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${doctor.color} flex items-center justify-center text-white font-bold shadow-lg`}>
                      {doctor.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)}
                    </div>
                    <span className="font-semibold text-slate-900">{doctor.name}</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    {/* Color Picker */}
                    <select
                      value={doctor.color}
                      onChange={(e) => updateDoctorColor(index, e.target.value)}
                      className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                    >
                      {PRESET_COLORS.map((color) => (
                        <option key={color.value} value={color.value}>
                          {color.name}
                        </option>
                      ))}
                    </select>

                    {/* Delete */}
                    <button
                      onClick={() => deleteDoctor(index)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="mt-6 p-4 bg-sky-50 rounded-xl text-sm text-sky-700">
            💡 <strong>İpucu:</strong> Doktor renkleri hasta kartlarında oda numarası badge'inde görünecektir.
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 px-8 py-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-3 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-colors font-semibold"
          >
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
}
