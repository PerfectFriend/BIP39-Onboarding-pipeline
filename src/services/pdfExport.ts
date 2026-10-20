/**
 * Cold Storage Paper Passport PDF generator using jsPDF and QR Code embedding.
 */

import { jsPDF } from 'jspdf';
import { generateQrDataUrl } from './qrGenerator';

export interface PdfExportOptions {
  mnemonicWords: string[];
  fingerprint: string;
  createdAt: number;
  appName?: string;
}

export async function exportPaperPassportPdf(options: PdfExportOptions): Promise<void> {
  const { mnemonicWords, fingerprint, createdAt, appName = 'BIP-39 Vault' } = options;
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Dark slate background with cyber-accent frame
  doc.setFillColor(8, 9, 20); // #080914
  doc.rect(0, 0, pageWidth, pageHeight, 'F');

  // Decorative border in Van Gogh gold & cyan
  doc.setDrawColor(245, 158, 11); // Gold
  doc.setLineWidth(0.8);
  doc.roundedRect(8, 8, pageWidth - 16, pageHeight - 16, 4, 4, 'S');

  doc.setDrawColor(56, 189, 248); // Cyan
  doc.setLineWidth(0.3);
  doc.roundedRect(10, 10, pageWidth - 20, pageHeight - 20, 3, 3, 'S');

  // Header banner box
  doc.setFillColor(15, 23, 42); // Slate 900
  doc.roundedRect(14, 14, pageWidth - 28, 28, 2, 2, 'F');

  // Title
  doc.setTextColor(248, 250, 252); // White
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text(`${appName.toUpperCase()} · COLD STORAGE PASSPORT`, 20, 26);

  // Subtitle & Metadata
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(148, 163, 184); // Slate 400
  const dateStr = new Date(createdAt).toUTCString();
  doc.text(`Protocol: BIP-39 Standard · Fingerprint: ${fingerprint} · Created: ${dateStr}`, 20, 34);

  // Warning Banner
  doc.setFillColor(245, 158, 11); // Amber
  doc.roundedRect(14, 46, pageWidth - 28, 14, 1.5, 1.5, 'F');
  doc.setTextColor(15, 23, 42); // Dark text
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('CRITICAL SECURITY NOTICE / ПРЕДУПРЕЖДЕНИЕ БЕЗОПАСНОСТИ', 20, 52);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text('Do NOT photograph or save to cloud. Keep in fireproof storage. Never disclose to anyone.', 20, 57);

  // Section 1: Numbered Seed Words Grid
  const gridStartY = 66;
  const is24 = mnemonicWords.length === 24;
  const cols = is24 ? 3 : 2;
  const colWidth = (pageWidth - 28 - (cols - 1) * 6) / cols;
  const wordsPerCol = Math.ceil(mnemonicWords.length / cols);
  const rowHeight = 7.5;

  doc.setTextColor(248, 250, 252);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text(`SECRET RECOVERY PHRASE (${mnemonicWords.length} WORDS)`, 14, gridStartY);

  let currentY = gridStartY + 5;
  mnemonicWords.forEach((word, index) => {
    const colIndex = Math.floor(index / wordsPerCol);
    const rowIndex = index % wordsPerCol;
    const x = 14 + colIndex * (colWidth + 6);
    const y = currentY + rowIndex * rowHeight;

    // Word item card background
    doc.setFillColor(20, 29, 47);
    doc.roundedRect(x, y - 5, colWidth, 6.5, 1, 1, 'F');
    doc.setDrawColor(51, 65, 85);
    doc.setLineWidth(0.2);
    doc.roundedRect(x, y - 5, colWidth, 6.5, 1, 1, 'S');

    // Index number
    doc.setFont('courier', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(56, 189, 248); // Cyan
    doc.text(`${(index + 1).toString().padStart(2, '0')}.`, x + 2.5, y - 0.7);

    // Word
    doc.setFont('courier', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(241, 245, 249);
    doc.text(word, x + 12, y - 0.7);
  });

  // Section 2: QR Code for rapid backup restore
  const qrSectionY = gridStartY + 5 + wordsPerCol * rowHeight + 10;
  const qrDataUrl = await generateQrDataUrl(mnemonicWords.join(' '));

  if (qrDataUrl) {
    const qrSize = 54;
    const qrX = 20;

    // QR Container card
    doc.setFillColor(15, 23, 42);
    doc.roundedRect(14, qrSectionY, pageWidth - 28, qrSize + 16, 2, 2, 'F');
    doc.setDrawColor(56, 189, 248);
    doc.setLineWidth(0.3);
    doc.roundedRect(14, qrSectionY, pageWidth - 28, qrSize + 16, 2, 2, 'S');

    // White backing for QR clarity
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(qrX, qrSectionY + 8, qrSize, qrSize, 1.5, 1.5, 'F');
    doc.addImage(qrDataUrl, 'PNG', qrX + 2, qrSectionY + 10, qrSize - 4, qrSize - 4);

    // QR Description
    const textX = qrX + qrSize + 8;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(248, 250, 252);
    doc.text('Instant Recovery QR Code', textX, qrSectionY + 18);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(148, 163, 184);
    const instructions = [
      'This QR code contains your encrypted BIP-39 mnemonic phrase.',
      'To restore your wallet on any supported device:',
      '1. Open the restore view and select "QR Scanner".',
      '2. Scan this code or import this document directly.',
      '3. Re-enter your security PIN to finalize access.'
    ];

    instructions.forEach((line, i) => {
      doc.text(line, textX, qrSectionY + 26 + i * 5);
    });
  }

  // Footer instructions & Watermark
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text(
    `BIP-39 Standard Cryptographic Archive · Fingerprint: ${fingerprint} · Keep strictly confidential`,
    pageWidth / 2,
    pageHeight - 14,
    { align: 'center' }
  );

  // Trigger download
  const filename = `vault-passport-${fingerprint.toLowerCase()}.pdf`;
  doc.save(filename);
}
