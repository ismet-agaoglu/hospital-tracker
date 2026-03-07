interface Patient {
  firstName: string;
  lastName: string;
  age: number;
  gender: string;
  diagnosis: string;
  attendingDoctor: string;
  roomNumber?: string;
  bedNumber?: string;
  admissionDate: string;
}

export const exportPatientsToPDF = (patients: Patient[], clinicName: string) => {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const days = (admissionDate: string) => 
    Math.floor((Date.now() - new Date(admissionDate).getTime()) / (1000 * 60 * 60 * 24));

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Servis Listesi - ${clinicName}</title>
      <style>
        @media print {
          @page { size: landscape; margin: 1cm; }
        }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: 'Segoe UI', Arial, sans-serif;
          padding: 20px;
          font-size: 12px;
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
          border-bottom: 2px solid #0369a1;
          padding-bottom: 15px;
        }
        .header h1 {
          color: #0369a1;
          font-size: 24px;
          margin-bottom: 5px;
        }
        .header p {
          color: #64748b;
          font-size: 14px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 20px;
        }
        th {
          background: #0369a1;
          color: white;
          padding: 12px 8px;
          text-align: left;
          font-weight: 600;
        }
        td {
          padding: 10px 8px;
          border-bottom: 1px solid #e2e8f0;
        }
        tr:hover { background: #f8fafc; }
        .room { font-weight: bold; color: #0369a1; }
        .name { font-weight: 600; }
        .footer {
          margin-top: 30px;
          text-align: center;
          color: #64748b;
          font-size: 11px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>🏥 ${clinicName}</h1>
        <p>Servis Hasta Listesi - ${new Date().toLocaleDateString('tr-TR', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })}</p>
      </div>

      <table>
        <thead>
          <tr>
            <th>Oda</th>
            <th>Yatak</th>
            <th>Hasta Adı</th>
            <th>Yaş</th>
            <th>Cinsiyet</th>
            <th>Tanı</th>
            <th>Doktor</th>
            <th>Yatış Süresi</th>
          </tr>
        </thead>
        <tbody>
          ${patients.map(p => `
            <tr>
              <td class="room">${p.roomNumber || '-'}</td>
              <td>${p.bedNumber || '-'}</td>
              <td class="name">${p.firstName} ${p.lastName}</td>
              <td>${p.age}</td>
              <td>${p.gender}</td>
              <td>${p.diagnosis}</td>
              <td>${p.attendingDoctor}</td>
              <td>${days(p.admissionDate)} gün</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <div class="footer">
        <p>Toplam ${patients.length} hasta • Hospital Tracker © 2026</p>
      </div>

      <script>
        window.onload = () => {
          window.print();
          window.onafterprint = () => window.close();
        };
      </script>
    </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
};
