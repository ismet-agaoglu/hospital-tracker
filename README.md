# 🏥 Hospital Tracker - Hasta Takip Sistemi

Multi-platform (Web + Android) hastane hasta takip ve servis yönetim sistemi. OOP prensipleri ve modern web teknolojileri ile geliştirilmiştir.

## 📋 Proje Özeti

### Amaç
Hastanelerde servis ve poliklinik bazlı hasta takibini kolaylaştıran, rol bazlı yetkilendirme sistemi ile güvenli bir web uygulaması.

### Özellikler
- 🔐 Rol bazlı yetkilendirme (Global Admin, Clinic Admin, Staff)
- 🏥 Çoklu klinik desteği
- 📊 Servis Paneli (ortak kullanım)
- 👤 Hasta Takip Paneli (kullanıcı bazlı)
- 📝 Vizit notları, yapılacaklar listesi, ilaç orderları
- 🔄 Paneller arası hasta transfer sistemi
- 📱 Responsive tasarım (Mobile-first)

---

## 🏗️ Teknik Mimari

### Tech Stack

**Frontend:**
- React 18 + TypeScript
- Vite (Build Tool)
- TailwindCSS (Styling)
- Zustand / Context API (State Management)
- React Router v6

**Backend:**
- Node.js + Express (TypeScript)
- Prisma ORM (PostgreSQL / SQLite)
- JWT Authentication
- bcrypt (Password hashing)
- zod (Validation)

**Database:**
- PostgreSQL (Production)
- SQLite (Development)

---

## 📊 Database Schema

### Temel Tablolar

#### User (Kullanıcı)
- Global Admin: Tüm kliniklere erişim
- Clinic Admin: Tek klinik üzerinde tam yetki
- Staff: Sınırlı yetkiler

#### Clinic (Klinik)
- Çoklu klinik desteği
- Her kliniğin kendi servis paneli

#### Patient (Hasta)
```
- Kişisel bilgiler (Ad, Soyad, Yaş, Cinsiyet)
- Medikal bilgiler (Tanı, Doktor, Yatış tarihi)
- Servis bilgileri (Oda, Yatak numarası)
- Vizit notu
- Panel tipi (Servis / Takip)
```

#### Todo (Yapılacaklar)
- Checkbox listesi
- Hasta bazlı

#### Order (İlaç Orderları)
- Satır satır order girişi
- Doz, frekans, notlar

---

## 🎨 UI/UX Akışı

### 1. Landing Page
Modern hero section ve login butonu

### 2. Authentication
JWT tabanlı güvenli giriş

### 3. Klinik Seçimi
Kullanıcının erişimi olan klinikler

### 4. Panel Seçimi
- **Servis Paneli**: Ortak kullanım
- **Hasta Takip Paneli**: Kişisel takip

### 5. Servis Paneli
```
Görünüm Seçenekleri:
├── Liste Görünümü (Tablo)
└── Kart Görünümü (Grid)

Hasta Kartı:
├── Temel Bilgiler (Ad, Yaş, Cinsiyet)
├── Medikal Bilgiler (Tanı, Doktor)
├── Vizit Notu (Expandable)
├── Yapılacaklar (Checkbox)
├── İlaç Orderları
└── Aksiyonlar (Düzenle, Transfer, Sil)
```

### 6. Hasta Takip Paneli
Kullanıcıya atanan hastalar, aynı kart yapısı

---

## 🔐 Permission Sistemi

### Rol Tabanlı Yetkiler

| Rol | Yetkiler |
|-----|----------|
| **Global Admin** | Tüm yetkiler, tüm klinikler |
| **Clinic Admin** | Kendi kliniğinde tüm yetkiler |
| **Staff** | Hasta görüntüleme, ekleme, düzenleme |

### Permission Tipleri
```typescript
enum Permission {
  VIEW_PATIENTS = "view_patients",
  ADD_PATIENTS = "add_patients",
  EDIT_PATIENTS = "edit_patients",
  DELETE_PATIENTS = "delete_patients",
  TRANSFER_PATIENTS = "transfer_patients",
  VIEW_SERVICE_PANEL = "view_service_panel",
  EDIT_SERVICE_PANEL = "edit_service_panel",
  VIEW_FOLLOWUP_PANEL = "view_followup_panel",
  EDIT_FOLLOWUP_PANEL = "edit_followup_panel",
  MANAGE_ORDERS = "manage_orders",
  MANAGE_TODOS = "manage_todos",
  MANAGE_USERS = "manage_users",
  MANAGE_CLINIC = "manage_clinic",
}
```

---

## 📁 Proje Yapısı

```
hospital-tracker/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── auth/
│   │   │   ├── clinic/
│   │   │   ├── patients/
│   │   │   ├── panels/
│   │   │   └── common/
│   │   ├── pages/
│   │   │   ├── Landing.tsx
│   │   │   ├── Login.tsx
│   │   │   ├── ClinicSelect.tsx
│   │   │   ├── PanelSelect.tsx
│   │   │   ├── ServicePanel.tsx
│   │   │   └── FollowupPanel.tsx
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── contexts/
│   │   ├── types/
│   │   └── utils/
│   ├── package.json
│   └── vite.config.ts
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── middlewares/
│   │   ├── routes/
│   │   ├── models/
│   │   ├── types/
│   │   └── utils/
│   ├── prisma/
│   │   └── schema.prisma
│   ├── package.json
│   └── tsconfig.json
└── README.md
```

---

## ⚡ Development Roadmap

### Phase 1: Foundation ✅
- [x] Proje planlaması
- [ ] Database schema (Prisma)
- [ ] Backend auth sistemi (JWT)
- [ ] Frontend routing + layout
- [ ] Landing + Login sayfası

### Phase 2: Core Features
- [ ] Klinik seçim ekranı
- [ ] Panel seçim ekranı
- [ ] Servis paneli (liste + kart)
- [ ] Hasta CRUD operasyonları
- [ ] Vizit notu, Todo, Order sistemleri

### Phase 3: Advanced
- [ ] Hasta transfer fonksiyonu
- [ ] Takip paneli
- [ ] Permission middleware
- [ ] Admin paneli

### Phase 4: Polish
- [ ] Responsive design
- [ ] Dark mode
- [ ] Search, Filter, Sort
- [ ] Export (PDF/Excel)
- [ ] Real-time updates (WebSocket)

---

## 🚀 Installation

### Prerequisites
- Node.js 18+
- PostgreSQL 14+ (or SQLite for dev)
- npm/yarn/pnpm

### Setup

```bash
# Clone repository
git clone https://github.com/ismet-agaoglu/hospital-tracker.git
cd hospital-tracker

# Backend setup
cd backend
npm install
npx prisma generate
npx prisma migrate dev
npm run dev

# Frontend setup (yeni terminal)
cd frontend
npm install
npm run dev
```

---

## 📝 License

MIT License - See LICENSE file for details

---

## 👥 Contributors

- **Aga** - Project Lead & Development
- **Agayev** - AI Assistant & Code Architect

---

## 📞 Contact

For questions or collaboration: [GitHub Issues](https://github.com/ismet-agaoglu/hospital-tracker/issues)

---

**Status:** 🚧 In Active Development
