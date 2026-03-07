import { useNavigate } from 'react-router-dom';

export default function PanelSelect() {
  const navigate = useNavigate();

  const selectedClinic = JSON.parse(localStorage.getItem('selectedClinic') || '{}');

  if (!selectedClinic.id) {
    navigate('/clinics');
    return null;
  }

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <span className="text-2xl">🏥</span>
              <span className="ml-2 text-xl font-bold text-gray-900">
                {selectedClinic.name}
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/clinics')}
                className="text-gray-600 hover:text-gray-900 font-medium"
              >
                ← Klinik Değiştir
              </button>
              <button
                onClick={handleLogout}
                className="text-gray-600 hover:text-gray-900 font-medium"
              >
                Çıkış Yap
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Panel Selection */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h1 className="text-3xl font-bold text-gray-900 mb-4 text-center">
          Panel Seçin
        </h1>
        <p className="text-gray-600 text-center mb-12">
          Hangi panele gitmek istiyorsunuz?
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Servis Paneli */}
          <button
            onClick={() => navigate('/service-panel')}
            className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition text-center group"
          >
            <div className="text-6xl mb-6 group-hover:scale-110 transition">📊</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Servis Paneli</h3>
            <p className="text-gray-600 mb-6">
              Servis hastalarını takip edin. Vizit notları, todo listesi, ilaç orderları.
              Ortak kullanım, klinik bazlı görünüm.
            </p>
            <div className="inline-flex items-center text-indigo-600 font-semibold">
              Panele Git →
            </div>
          </button>

          {/* Hasta Takip Paneli */}
          <button
            onClick={() => navigate('/followup-panel')}
            className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition text-center group"
          >
            <div className="text-6xl mb-6 group-hover:scale-110 transition">👤</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Hasta Takip Paneli</h3>
            <p className="text-gray-600 mb-6">
              Kişisel hasta takibi. Sadece size atanan hastalar. Todo ve order yönetimi.
              Kullanıcı bazlı, özel görünüm.
            </p>
            <div className="inline-flex items-center text-indigo-600 font-semibold">
              Panele Git →
            </div>
          </button>
        </div>

        {/* Coming Soon */}
        <div className="mt-12 text-center">
          <p className="text-gray-500 text-sm">
            <strong>Yakında:</strong> Ameliyat Paneli, Acil Paneli, Laboratuvar Paneli
          </p>
        </div>
      </div>
    </div>
  );
}
