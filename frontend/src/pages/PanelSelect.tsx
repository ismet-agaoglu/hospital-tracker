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

  const panels = [
    {
      id: 'service',
      title: 'Servis Paneli',
      description: 'Hastane servisinde yatan hastaları takip edin. Vizit notları, yapılacaklar listesi, ilaç orderları ve oda/yatak yönetimi.',
      icon: (
        <svg className="w-full h-full" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
      ),
      gradient: 'from-sky-500 via-sky-600 to-blue-700',
      features: ['Liste & Kart Görünümü', 'Ortak Kullanım', 'Real-time Güncellemeler'],
      route: '/service-panel',
    },
    {
      id: 'followup',
      title: 'Hasta Takip Paneli',
      description: 'Size atanan hastaların takibini yapın. Kişisel hasta yönetimi, todo ve order takibi.',
      icon: (
        <svg className="w-full h-full" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      gradient: 'from-emerald-500 via-emerald-600 to-teal-700',
      features: ['Kullanıcı Bazlı', 'Kişisel Takip', 'Todo & Order Yönetimi'],
      route: '/followup-panel',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-sky-50 to-slate-100">
      {/* Decorative Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-sky-200/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-emerald-200/20 rounded-full blur-3xl" />
      </div>

      {/* Navbar */}
      <nav className="relative z-10 backdrop-blur-sm bg-white/70 border-b border-slate-200/50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-br from-sky-600 to-sky-700 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div>
                <div className="text-sm text-slate-500">Klinik</div>
                <div className="font-bold text-slate-900">{selectedClinic.name}</div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => navigate('/clinics')}
                className="px-4 py-2 text-slate-600 hover:text-slate-900 font-medium transition-colors hover:bg-slate-100 rounded-xl"
              >
                ← Klinik Değiştir
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-slate-600 hover:text-slate-900 font-medium transition-colors hover:bg-slate-100 rounded-xl"
              >
                Çıkış
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            Panel Seçin
          </h1>
          <p className="text-lg text-slate-600">
            Hangi modülde çalışmak istersiniz?
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {panels.map((panel) => (
            <button
              key={panel.id}
              onClick={() => navigate(panel.route)}
              className="group relative bg-white rounded-3xl p-8 shadow-xl border border-slate-200/50 hover:shadow-2xl transition-all hover:-translate-y-2 text-left overflow-hidden"
            >
              {/* Gradient Background on Hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${panel.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />

              {/* Icon */}
              <div className={`relative z-10 inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br ${panel.gradient} rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                <div className="w-10 h-10 text-white">
                  {panel.icon}
                </div>
              </div>

              {/* Content */}
              <div className="relative z-10">
                <h3 className="text-2xl font-bold text-slate-900 mb-3">
                  {panel.title}
                </h3>
                <p className="text-slate-600 leading-relaxed mb-6">
                  {panel.description}
                </p>

                {/* Features */}
                <div className="space-y-2 mb-6">
                  {panel.features.map((feature, i) => (
                    <div key={i} className="flex items-center text-sm text-slate-700">
                      <svg className="w-5 h-5 mr-2 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {feature}
                    </div>
                  ))}
                </div>

                {/* CTA */}
                <div className={`inline-flex items-center space-x-2 font-semibold bg-gradient-to-r ${panel.gradient} bg-clip-text text-transparent`}>
                  <span>Panele Git</span>
                  <svg className="w-5 h-5 text-slate-400 group-hover:text-slate-600 group-hover:translate-x-1 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>

              {/* Corner Decoration */}
              <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${panel.gradient} opacity-5 group-hover:opacity-10 transition-opacity rounded-bl-full`} />
            </button>
          ))}
        </div>

        {/* Coming Soon */}
        <div className="mt-16 text-center">
          <p className="text-slate-500 mb-4">
            <strong className="text-slate-700">Yakında:</strong> Ameliyat Paneli, Acil Paneli, Laboratuvar Paneli
          </p>
          <div className="inline-flex items-center space-x-2 px-4 py-2 bg-slate-100 rounded-full text-sm text-slate-600">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Yeni modüller geliştiriliyor</span>
          </div>
        </div>
      </div>
    </div>
  );
}
