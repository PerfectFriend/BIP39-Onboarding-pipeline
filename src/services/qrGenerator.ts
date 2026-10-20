/**
 * QR Code Generator utility using qrcode for high-contrast data URLs and SVG.
 */

import QRCode from 'qrcode';

export async function generateQrDataUrl(text: string): Promise<string> {
  try {
    return await QRCode.toDataURL(text, {
      errorCorrectionLevel: 'M',
      margin: 2,
      width: 320,
      color: {
        dark: '#080914',
        light: '#FFFFFF'
      }
    });
  } catch (err) {
    console.error('Failed to generate QR data URL:', err);
    return '';
  }
}

export async function generateQrSvg(text: string): Promise<string> {
  try {
    return await QRCode.toString(text, {
      type: 'svg',
      errorCorrectionLevel: 'M',
      margin: 1,
      color: {
        dark: '#38BDF8',
        light: '#00000000'
      }
    });
  } catch (err) {
    console.error('Failed to generate QR SVG:', err);
    return '';
  }
}
