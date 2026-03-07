import { useNavigate } from 'react-router-dom';

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navbar */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <span className="text-2xl">🏥</span>
              <span className="ml-2 text-xl font-bold text-gray-900">Hospital Tracker</span>
            </div>
            <button
              onClick={() => navigate('/login')}
              className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition"
            >
              Giriş Yap
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-5xl font-extrabold text-gray-900 sm:text-6xl">
            Hasta Takip Sistemi
          </h1>
          <p className="mt-6 text-xl text-gray-600 max-w-3xl mx-auto">
            Modern ve güvenli hasta yönetimi. Servis takibi, vizit notları, ilaç orderları ve daha fazlası.
          </p>
          <div className="mt-10">
            <button
              onClick={() => navigate('/login')}
              className="bg-indigo-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-indigo-700 transition shadow-lg"
            >
              Hemen Başla →
            </button>
          </div>
        </div>

        {/* Features */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-xl font-bold mb-2">Servis Paneli</h3>
            <p className="text-gray-600">
              Hastalarınızı liste ve kart görünümünde takip edin. Oda, yatak, vizit notları.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="text-4xl mb-4">👤</div>
            <h3 className="text-xl font-bold mb-2">Hasta Takip</h3>
            <p className="text-gray-600">
              Kullanıcı bazlı kişisel hasta takibi. Todo listesi ve ilaç orderları.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="text-4xl mb-4">🔐</div>
            <h3 className="text-xl font-bold mb-2">Güvenli Erişim</h3>
            <p className="text-gray-600">
              Rol tabanlı yetkilendirme. Global Admin, Clinic Admin ve Staff rolleri.
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-center text-gray-500">
            © 2026 Hospital Tracker. Tüm hakları saklıdır.
          </p>
        </div>
      </footer>
    </div>
  );
}
