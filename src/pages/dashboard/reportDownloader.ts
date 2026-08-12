import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, HeadingLevel, BorderStyle, WidthType, AlignmentType } from 'docx';

interface UserItem {
  _id: string;
  name: string;
  email: string;
  role: 'student' | 'trainer' | 'admin';
  createdAt: string;
}

interface Stat {
  simulationName: string;
  totalTimeSeconds: number;
  userCount: number;
}

const sceneLabels: Record<string, string> = {
  reception: 'Hospital Reception',
  ward: 'Patient Ward',
  cpr: 'CPR Training Room',
  or: 'Operating Room',
  er: 'Emergency Room',
  radiology: 'Radiology (CT-Scan)',
  ambulance: 'Ambulance Unit',
};

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

function slug() {
  return new Date().toISOString().slice(0, 10);
}

// ─── CSV ───────────────────────────────────────────────────
export function downloadCSV(users: UserItem[], stats: Stat[]) {
  const rows: string[] = [];
  rows.push('VR HEALTHED - SYSTEM REPORT');
  rows.push(`Generated: ${new Date().toLocaleString()}`);
  rows.push('');
  rows.push('USERS');
  rows.push('Name,Email,Role,Joined');
  users.forEach(u => rows.push(`"${u.name}","${u.email}","${u.role}","${new Date(u.createdAt).toLocaleDateString()}"`));
  rows.push('');
  rows.push('SIMULATION ENGAGEMENT');
  rows.push('Simulation,Unique Users,Total Time,Avg Time Per User');
  stats.forEach(s => {
    const label = sceneLabels[s.simulationName] || s.simulationName;
    const avg = s.userCount > 0 ? formatTime(Math.round(s.totalTimeSeconds / s.userCount)) : 'N/A';
    rows.push(`"${label}","${s.userCount}","${formatTime(s.totalTimeSeconds)}","${avg}"`);
  });

  const blob = new Blob([rows.join('\n')], { type: 'text/csv' });
  triggerDownload(blob, `VRHealthEd-Report-${slug()}.csv`);
}

// ─── EXCEL ─────────────────────────────────────────────────
export function downloadExcel(users: UserItem[], stats: Stat[]) {
  const wb = XLSX.utils.book_new();

  // Users Sheet
  const usersData = [
    ['Name', 'Email', 'Role', 'Joined'],
    ...users.map(u => [u.name, u.email, u.role, new Date(u.createdAt).toLocaleDateString()])
  ];
  const ws1 = XLSX.utils.aoa_to_sheet(usersData);
  ws1['!cols'] = [{ wch: 24 }, { wch: 32 }, { wch: 12 }, { wch: 16 }];
  XLSX.utils.book_append_sheet(wb, ws1, 'Users');

  // Stats Sheet
  const statsData = [
    ['Simulation', 'Unique Users', 'Total Time', 'Avg Time Per User'],
    ...stats.map(s => {
      const avg = s.userCount > 0 ? formatTime(Math.round(s.totalTimeSeconds / s.userCount)) : 'N/A';
      return [sceneLabels[s.simulationName] || s.simulationName, s.userCount, formatTime(s.totalTimeSeconds), avg];
    })
  ];
  const ws2 = XLSX.utils.aoa_to_sheet(statsData);
  ws2['!cols'] = [{ wch: 28 }, { wch: 16 }, { wch: 16 }, { wch: 20 }];
  XLSX.utils.book_append_sheet(wb, ws2, 'Simulation Engagement');

  XLSX.writeFile(wb, `VRHealthEd-Report-${slug()}.xlsx`);
}

// ─── PDF ───────────────────────────────────────────────────
export async function downloadPDF(iframeEl: HTMLIFrameElement | null) {
  if (!iframeEl?.contentDocument?.body) return;

  const canvas = await html2canvas(iframeEl.contentDocument.body, {
    scale: 2,
    useCORS: true,
    backgroundColor: '#ffffff',
    scrollY: 0,
    windowHeight: iframeEl.contentDocument.body.scrollHeight,
  });

  const imgData = canvas.toDataURL('image/jpeg', 0.95);
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pdfW = pdf.internal.pageSize.getWidth();
  const pdfH = (canvas.height * pdfW) / canvas.width;
  const pageH = pdf.internal.pageSize.getHeight();

  let y = 0;
  while (y < pdfH) {
    if (y > 0) pdf.addPage();
    pdf.addImage(imgData, 'JPEG', 0, -y, pdfW, pdfH);
    y += pageH;
  }
  pdf.save(`VRHealthEd-Report-${slug()}.pdf`);
}

// ─── DOCX ──────────────────────────────────────────────────
export async function downloadDOCX(users: UserItem[], stats: Stat[], adminName: string) {
  const border = {
    top: { style: BorderStyle.SINGLE, size: 1 },
    bottom: { style: BorderStyle.SINGLE, size: 1 },
    left: { style: BorderStyle.SINGLE, size: 1 },
    right: { style: BorderStyle.SINGLE, size: 1 },
  };

  const makeCell = (text: string, bold = false) => new TableCell({
    borders: border,
    children: [new Paragraph({ children: [new TextRun({ text, bold, size: 20 })] })],
  });

  const usersTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({ children: ['Name', 'Email', 'Role', 'Joined'].map(h => makeCell(h, true)) }),
      ...users.map(u => new TableRow({
        children: [u.name, u.email, u.role, new Date(u.createdAt).toLocaleDateString()].map(v => makeCell(v))
      }))
    ]
  });

  const statsTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({ children: ['Simulation', 'Unique Users', 'Total Time', 'Avg Time/User'].map(h => makeCell(h, true)) }),
      ...stats.map(s => {
        const avg = s.userCount > 0 ? formatTime(Math.round(s.totalTimeSeconds / s.userCount)) : 'N/A';
        return new TableRow({
          children: [sceneLabels[s.simulationName] || s.simulationName, String(s.userCount), formatTime(s.totalTimeSeconds), avg].map(v => makeCell(v))
        });
      })
    ]
  });

  const doc = new Document({
    sections: [{
      children: [
        new Paragraph({ text: 'VR HEALTHED – SYSTEM REPORT', heading: HeadingLevel.HEADING_1, alignment: AlignmentType.CENTER }),
        new Paragraph({ children: [new TextRun({ text: `Generated by: ${adminName}  |  Date: ${new Date().toLocaleString()}`, size: 20, color: '6b7280' })] }),
        new Paragraph(''),
        new Paragraph({ text: 'REGISTERED USERS', heading: HeadingLevel.HEADING_2 }),
        usersTable,
        new Paragraph(''),
        new Paragraph({ text: 'SIMULATION ENGAGEMENT', heading: HeadingLevel.HEADING_2 }),
        statsTable,
      ]
    }]
  });

  const buf = await Packer.toBlob(doc);
  triggerDownload(buf, `VRHealthEd-Report-${slug()}.docx`);
}

// ─── PNG / JPG ─────────────────────────────────────────────
export async function downloadImage(iframeEl: HTMLIFrameElement | null, format: 'png' | 'jpg') {
  if (!iframeEl?.contentDocument?.body) return;

  const canvas = await html2canvas(iframeEl.contentDocument.body, {
    scale: 2,
    useCORS: true,
    backgroundColor: '#ffffff',
    scrollY: 0,
    windowHeight: iframeEl.contentDocument.body.scrollHeight,
  });

  const mime = format === 'png' ? 'image/png' : 'image/jpeg';
  canvas.toBlob(blob => {
    if (blob) triggerDownload(blob, `VRHealthEd-Report-${slug()}.${format}`);
  }, mime, 0.95);
}

// ─── Helper ────────────────────────────────────────────────
function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
