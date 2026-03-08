import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-sky-50 to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-sky-200/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-emerald-200/20 rounded-full blur-3xl" />
      </div>

      {/* Navbar */}
      <nav className="relative z-10 backdrop-blur-sm bg-white/70 dark:bg-slate-900/70 border-b border-slate-200/50 dark:border-slate-700/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 sm:h-20">
            <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-sky-600 to-sky-700 rounded-xl flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <span className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-sky-700 to-sky-900 dark:from-sky-400 dark:to-sky-200 bg-clip-text text-transparent truncate">
                Hospital Tracker
              </span>
            </div>
            <button
              onClick={() => navigate('/login')}
              className="px-5 sm:px-6 py-2.5 bg-sky-700 text-white rounded-xl font-medium hover:bg-sky-800 transition-all hover:shadow-lg hover:shadow-sky-700/30 active:scale-95"
            >
              Giriş Yap
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section - Asymmetric Layout */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-16 lg:pt-20 pb-16 sm:pb-24 lg:pb-32">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-block mb-4 px-4 py-2 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium">
              ✨ Yeni Nesil Hasta Takip Sistemi
            </div>
            <h1 className="text-5xl sm:text-6xl lg:text-6xl font-extrabold text-slate-900 dark:text-slate-100 mb-5 sm:mb-6 leading-tight break-words">
              Hasta Yönetiminde
              <span className="block bg-gradient-to-r from-sky-600 to-emerald-500 bg-clip-text text-transparent">
                Yeni Çağ
              </span>
            </h1>
            <p className="text-base sm:text-lg lg:text-xl text-slate-600 dark:text-slate-300 mb-6 sm:mb-8 leading-relaxed max-w-xl">
              Servis takibi, vizit notları, ilaç orderları ve hasta transfer işlemlerini tek platformda yönetin.
              Hızlı, güvenli ve kolay.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <button
                onClick={() => navigate('/login')}
                className="w-full sm:w-auto px-8 py-3.5 sm:py-4 bg-gradient-to-r from-sky-600 to-sky-700 text-white rounded-xl font-semibold hover:from-sky-700 hover:to-sky-800 transition-all shadow-lg shadow-sky-600/30 hover:shadow-xl hover:shadow-sky-600/40 active:scale-95"
              >
                Hemen Başla →
              </button>
              <button className="w-full sm:w-auto px-8 py-3.5 sm:py-4 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 rounded-xl font-semibold hover:bg-slate-50 dark:bg-slate-800 transition-all border border-slate-200 hover:border-slate-300">
                Demo İzle
              </button>
            </div>

            {/* Stats Row */}
            <div className="mt-12 grid grid-cols-3 gap-6">
              {[
                { value: '99.9%', label: 'Uptime' },
                { value: '500+', label: 'Kullanıcı' },
                { value: '24/7', label: 'Destek' },
              ].map((stat, i) => (
                <div key={i} className="text-center">
                  <div className="text-3xl font-bold text-sky-700">{stat.value}</div>
                  <div className="text-sm text-slate-500 dark:text-slate-400 mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right Visual - Dashboard Preview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <div className="relative bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200/50 dark:border-slate-700/60 p-4 sm:p-6 lg:p-8 backdrop-blur-sm">
              {/* Mock Dashboard */}
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white font-bold text-lg">
                      A
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900 dark:text-slate-100">Ahmet Yılmaz</div>
                      <div className="text-sm text-slate-500 dark:text-slate-400">Oda 302 • Yatak 2</div>
                    </div>
                  </div>
                  <div className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium">
                    Aktif
                  </div>
                </div>

                {/* Info Cards */}
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Tanı', value: 'Akut Apandisit', icon: '🩺' },
                    { label: 'Doktor', value: 'Dr. Mehmet K.', icon: '👨‍⚕️' },
                  ].map((item, i) => (
                    <div key={i} className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                      <div className="text-2xl mb-2">{item.icon}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">{item.label}</div>
                      <div className="font-semibold text-slate-900 dark:text-slate-100 text-sm">{item.value}</div>
                    </div>
                  ))}
                </div>

                {/* Progress Bar */}
                <div className="pt-4">
                  <div className="flex justify-between text-xs text-slate-600 dark:text-slate-300 mb-2">
                    <span>Tedavi İlerlemesi</span>
                    <span>75%</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full w-3/4 bg-gradient-to-r from-sky-600 to-emerald-500 rounded-full" />
                  </div>
                </div>
              </div>

              {/* Floating Badge */}
              <div className="absolute top-3 right-3 sm:-top-4 sm:-right-4 px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-sky-600 to-emerald-500 text-white rounded-lg sm:rounded-xl shadow-lg text-xs sm:text-sm font-medium">
                ⚡ Real-time
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Features Section */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 sm:pb-24 lg:pb-32">
        <div className="text-center mb-10 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-slate-100 mb-4">
            Tam Özellikli Hasta Yönetimi
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-300">
            Modern hastaneler için tasarlandı
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-5 sm:gap-8">
          {[
            {
              icon: '📊',
              title: 'Servis Paneli',
              desc: 'Liste ve kart görünümünde hasta takibi. Oda, yatak, vizit notları.',
              color: 'from-sky-500 to-sky-600',
            },
            {
              icon: '👤',
              title: 'Hasta Takip',
              desc: 'Kullanıcı bazlı kişisel hasta takibi. Todo listesi ve ilaç orderları.',
              color: 'from-emerald-500 to-emerald-600',
            },
            {
              icon: '🔐',
              title: 'Güvenli Erişim',
              desc: 'Rol tabanlı yetkilendirme. Global Admin, Clinic Admin ve Staff rolleri.',
              color: 'from-purple-500 to-purple-600',
            },
          ].map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 + i * 0.1 }}
              className="group relative bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 shadow-lg border border-slate-200/50 dark:border-slate-700/60 hover:shadow-xl transition-all hover:-translate-y-1"
            >
              <div className={`text-5xl mb-4 group-hover:scale-110 transition-transform`}>
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-3">
                {feature.title}
              </h3>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                {feature.desc}
              </p>

              {/* Gradient Border on Hover */}
              <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${feature.color} opacity-0 group-hover:opacity-10 transition-opacity -z-10`} />
            </motion.div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-200 bg-white dark:bg-slate-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
          <p className="text-center text-slate-500 dark:text-slate-400">
            © 2026 Hospital Tracker. Tüm hakları saklıdır.
          </p>
        </div>
      </footer>
    </div>
  );
}
