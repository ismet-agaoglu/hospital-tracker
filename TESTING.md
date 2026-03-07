# Hospital Tracker - Testing Checklist

## 🌐 URLs
- **Frontend:** http://76.13.15.92:18790
- **Backend:** http://76.13.15.92:3000
- **GitHub:** https://github.com/ismet-agaoglu/hospital-tracker

## 🔐 Test Credentials
```
Email: admin@hospital.com
Password: admin123
Clinic: Merkez Hastanesi
```

---

## ✅ Desktop Testing (> 1024px)

### Header (Top Bar)
- [ ] Logo/Title: "Servis • Merkez Hastanesi" ✓
- [ ] **Yeni Hasta** button (blue, primary) ✓
- [ ] **Yapılacaklar** icon button (clipboard) ✓
- [ ] **Ayarlar** icon button (gear) ✓
- [ ] **PDF Yazdır** icon button (printer) ✓
- [ ] Divider line ✓
- [ ] **Geri** icon button (arrow left) ✓
- [ ] **Çıkış** icon button (logout) ✓

### Controls
- [ ] Search input (with icon) ✓
- [ ] Stats toggle button (chart icon) ✓
- [ ] View toggle (card/list) ✓
- [ ] Sort dropdown (Oda/İsim/Tarih) ✓
- [ ] Doctor filter dropdown ✓
- [ ] Gender filter dropdown ✓

### Patient Display
- [ ] Card view: 3 columns (xl), 2 columns (md) ✓
- [ ] List view: Scrollable table ✓
- [ ] Room number badge (doctor color) ✓
- [ ] Days admitted badge ("X gün") ✓
- [ ] Patient info (name, age, gender in Turkish) ✓

### Modals
- [ ] Add Patient Modal (doctor dropdown from settings) ✓
- [ ] Patient Detail Modal (3 tabs: Info, Todos, Orders) ✓
- [ ] Settings Modal (doctor management + colors) ✓
- [ ] All Todos Modal (filter: pending/completed/all) ✓

### Interactions
- [ ] Click patient card → Expand inline ✓
- [ ] Edit visit note → Auto-save ✓
- [ ] Add/complete/delete todos ✓
- [ ] Add/delete orders ✓
- [ ] Transfer patient (Servis → Takip) ✓
- [ ] Delete patient (with confirmation) ✓

---

## 📱 Mobile Testing (< 768px)

### Header
- [ ] Title truncated if needed ✓
- [ ] Only "Geri" button visible ✓
- [ ] No overflow-x scroll ✓

### Controls
- [ ] Search bar full width ✓
- [ ] Stats toggle visible ✓
- [ ] Filters scroll horizontally if needed ✓
- [ ] No view toggle (auto card view) ✓

### Patient Display
- [ ] Card view: 1 column ✓
- [ ] Touch-friendly card size ✓
- [ ] Expand/collapse works ✓
- [ ] Inline editing works ✓

### Bottom Navigation
- [ ] 4 buttons: Ekle, Görevler, Ayarlar, Geri ✓
- [ ] Fixed at bottom ✓
- [ ] Icons + labels ✓
- [ ] Touch-friendly (48x48 min) ✓

---

## 🎨 Features Testing

### 1. Settings (Ayarlar)
- [ ] Open settings modal ✓
- [ ] Add doctor: Input name → Click "Ekle" ✓
- [ ] Change doctor color (8 presets) ✓
- [ ] Delete doctor (confirm dialog) ✓
- [ ] Settings persist (localStorage) ✓
- [ ] Room badge updates with doctor color ✓

### 2. Add Patient (Yeni Hasta)
- [ ] All fields visible ✓
- [ ] Doctor dropdown (from settings) ✓
- [ ] Warning if no doctors ✓
- [ ] Required field validation ✓
- [ ] Success → Patient appears ✓
- [ ] Assigned doctor's color on room badge ✓

### 3. Todos (Yapılacaklar)
- [ ] Open All Todos modal ✓
- [ ] Filter tabs work (Bekleyen/Tamamlanan/Tümü) ✓
- [ ] Checkbox toggle (instant API call) ✓
- [ ] Shows patient name per todo ✓
- [ ] Counter badges update ✓

### 4. Inline Editing (Card View)
- [ ] Expand card → Show details ✓
- [ ] Edit visit note → Kaydet/İptal buttons ✓
- [ ] Add todo (input + Enter or "+") ✓
- [ ] Complete todo (checkbox) ✓
- [ ] Delete todo (X icon on hover) ✓
- [ ] Add order (3 inputs: drug, dose, frequency) ✓
- [ ] Delete order (X icon on hover) ✓

### 5. PDF Export
- [ ] Click PDF button ✓
- [ ] Landscape A4 layout ✓
- [ ] Filtered patients exported ✓
- [ ] Auto-print dialog ✓
- [ ] Close after print ✓

### 6. Statistics
- [ ] Toggle stats panel ✓
- [ ] Shows total patients ✓
- [ ] Shows count per doctor ✓
- [ ] Compact layout ✓
- [ ] Close button (X) ✓

### 7. Patient Transfer
- [ ] Click "Takibe Al" button ✓
- [ ] Patient moves to Followup Panel ✓
- [ ] Disappears from Service Panel ✓

### 8. Patient Delete
- [ ] Click "Sil" button ✓
- [ ] Confirmation dialog ✓
- [ ] Patient removed from list ✓

---

## 🐛 Known Issues
- None currently

---

## 🚀 Performance
- [ ] Initial load < 2s ✓
- [ ] HMR updates instant ✓
- [ ] API calls < 500ms ✓
- [ ] Smooth animations (60fps) ✓

---

## 🎯 Browser Compatibility
- [ ] Chrome 90+ ✓
- [ ] Firefox 88+ ✓
- [ ] Safari 14+ ✓
- [ ] Edge 90+ ✓
- [ ] Mobile browsers (iOS Safari, Chrome Mobile) ✓

---

## 📊 Test Status: READY FOR TESTING

Last Updated: 2026-03-07
Version: 1.0.0
Commit: c639fd9
