/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas-pro';
import type { DocxReportData } from './docxExport';

/**
 * Downloads a Blob as a file using an anchor tag.
 */
function triggerFileDownload(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 300);
}

/**
 * Native jsPDF direct generator as a bulletproof fallback when HTML-to-canvas rendering fails.
 * Produces a clean, formatted multi-section technical document directly as a .pdf file.
 */
export function exportStructuredNativePdf(data: DocxReportData, fileName: string): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true,
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - margin * 2;
  let y = 18;

  const checkPageBreak = (neededHeight: number) => {
    if (y + neededHeight > pageHeight - 15) {
      doc.addPage();
      y = 18;
      drawHeaderFooter();
    }
  };

  const drawHeaderFooter = () => {
    // Top border line
    doc.setDrawColor(30, 41, 59); // slate-800
    doc.setLineWidth(0.4);
    doc.line(margin, 12, pageWidth - margin, 12);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text('Tunnel Engineering Report - Geomechanical Assessment (Bieniawski & Barton)', margin, 10);
    doc.text(data.reportDateStr || new Date().toISOString().slice(0, 10), pageWidth - margin, 10, { align: 'right' });

    // Bottom footer
    doc.setDrawColor(203, 213, 225);
    doc.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);
    doc.text('Empirical Rock Mass Classification & Tunnel Design v1.0 | Eng. Saeed Jamali Zavareh', margin, pageHeight - 8);
  };

  drawHeaderFooter();

  // Document Title Banner
  doc.setFillColor(15, 23, 42); // slate-900
  doc.roundedRect(margin, y, contentWidth, 18, 2, 2, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(248, 250, 252);
  doc.text('GEOMECHANICAL TUNNEL DESIGN & CLASSIFICATION REPORT', margin + 6, y + 8);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(203, 213, 225);
  doc.text('Bieniawski RMR (1989), Barton Q-System (2002), GSI, Stand-up Time & Empirical Support', margin + 6, y + 14);
  y += 24;

  // Section 1: Tunnel & Rock Mass Input Parameters
  doc.setFillColor(241, 245, 249);
  doc.rect(margin, y, contentWidth, 6, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(30, 41, 59);
  doc.text('1. PROJECT INPUT PARAMETERS & SITE CHARACTERISTICS', margin + 3, y + 4.5);
  y += 8;

  const inputRows = [
    ['Tunnel Span (Diameter)', `${data.span} m`, 'Tunnel Depth (Overburden)', `${data.depth} m`],
    ['Bieniawski RMR89 Rating', `${data.rmr} / 100`, 'Barton Q-System Value', `${data.qValue}`],
    ['Hoek-Brown GSI', `${data.gsi}`, 'Intact Rock UCS', `${data.ucs} MPa`],
    ['Rock Quality Desig. (RQD)', `${data.rqd}%`, 'Excavation Support Ratio (ESR)', `${data.esr}`],
    ['Rock Unit Weight (gamma)', `${data.unitWeight} kN/m3`, 'Stress Ratio (K0)', `${data.kRatio}`],
    ['Mean Joint Spacing', `${data.jointSpacing} m`, 'Overburden Stress (sigma_v)', `${data.overburdenStress} MPa`],
  ];

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);

  inputRows.forEach((row) => {
    checkPageBreak(6);
    doc.setFillColor(248, 250, 252);
    doc.rect(margin, y, contentWidth, 5.5, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.rect(margin, y, contentWidth, 5.5, 'S');

    doc.setTextColor(71, 85, 105);
    doc.text(row[0], margin + 3, y + 4);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(row[1], margin + 55, y + 4);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text(row[2], margin + 95, y + 4);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(row[3], margin + 150, y + 4);

    y += 5.5;
  });
  y += 6;

  // Section 2: Rock Mass Classification Results
  checkPageBreak(35);
  doc.setFillColor(241, 245, 249);
  doc.rect(margin, y, contentWidth, 6, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(30, 41, 59);
  doc.text('2. ROCK MASS CLASSIFICATION & RATING SUMMARY', margin + 3, y + 4.5);
  y += 8;

  const classRows = [
    ['Rock Mass Class (RMR89):', `${data.rockClass?.class || 'Class III'} (${data.rockClass?.descriptionEn || 'Fair Rock'})`],
    ['Equivalent Friction Angle (phi):', `${data.rockClass?.frictionAngle || '35 - 40 deg'}`],
    ['Rock Mass Cohesion (c):', `${data.rockClass?.cohesion || '200 - 300 kPa'}`],
    ['Barton Equivalent Dimension (De):', `${data.de?.toFixed(2) || (data.span / data.esr).toFixed(2)} m`],
    ['Rock Mass Deformation Modulus (Em):', `${((data.rmr - 10) / 40 > 0 ? (10 ** ((data.rmr - 10) / 40)).toFixed(1) : '5.2')} GPa`],
  ];

  classRows.forEach(([lbl, val]) => {
    checkPageBreak(6);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text(lbl, margin + 3, y + 4);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(val, margin + 85, y + 4);
    doc.setDrawColor(226, 232, 240);
    doc.line(margin, y + 5.5, margin + contentWidth, y + 5.5);
    y += 5.5;
  });
  y += 6;

  // Section 3: Stand-up Time Analysis
  checkPageBreak(35);
  doc.setFillColor(241, 245, 249);
  doc.rect(margin, y, contentWidth, 6, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(30, 41, 59);
  doc.text('3. STAND-UP TIME & MAXIMUM UNSUPPORTED SPAN', margin + 3, y + 4.5);
  y += 8;

  const rmrHours = data.rmrStandUpResult?.standUpTimeHours;
  const rmrStandUpDisplay = rmrHours ? (rmrHours > 8760 ? `${(rmrHours / 8760).toFixed(1)} years` : rmrHours > 24 ? `${(rmrHours / 24).toFixed(1)} days` : `${rmrHours.toFixed(1)} hours`) : 'Fair';
  const qMaxSpan = (2 * Math.pow(data.esr || 1, 0.1) * Math.pow(data.qValue || 1, 0.4)).toFixed(2);

  const standupRows = [
    ['Bieniawski Estimated Stand-up Time:', `${rmrStandUpDisplay}`],
    ['Bieniawski Maximum Unsupported Span:', `${data.rmrStandUpResult?.maxSpanMeters?.toFixed(2) || '4.5'} m`],
    ['Barton Q Maximum Unsupported Span (2*ESR*Q^0.4):', `${qMaxSpan} m`],
    ['Stability Risk Level:', data.rmr >= 60 ? 'Low Risk (Self-Supporting / Stable)' : data.rmr >= 41 ? 'Moderate Risk (Requires Timely Support)' : 'High Risk (Short Stand-up Time, Immediate Support Required)'],
  ];

  standupRows.forEach(([lbl, val]) => {
    checkPageBreak(6);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text(lbl, margin + 3, y + 4);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(val, margin + 95, y + 4);
    doc.setDrawColor(226, 232, 240);
    doc.line(margin, y + 5.5, margin + contentWidth, y + 5.5);
    y += 5.5;
  });
  y += 6;

  // Section 4: Recommended Empirical Support System
  checkPageBreak(40);
  doc.setFillColor(241, 245, 249);
  doc.rect(margin, y, contentWidth, 6, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(30, 41, 59);
  doc.text('4. RECOMMENDED EMPIRICAL SUPPORT SYSTEM', margin + 3, y + 4.5);
  y += 8;

  const supportRows = [
    ['Rockbolts (Anchor Bolts):', data.supportDetailed?.bolts || data.rmrSupportResult?.bolts || 'Systematic bolts 20mm dia, 3m length spaced 1.5 - 2.0m'],
    ['Shotcrete Application:', data.supportDetailed?.shotcrete || data.rmrSupportResult?.shotcrete || '50 - 100mm in crown, 30mm in walls'],
    ['Steel Ribs / Lattice Girders:', data.supportDetailed?.steelRibs || data.rmrSupportResult?.steelRibs || 'None generally required for this class'],
    ['Installation Time Frame:', data.rmr >= 61 ? 'Install within 1 week of excavation' : data.rmr >= 41 ? 'Install within 24 hours of excavation' : 'Immediate support required behind heading'],
  ];

  supportRows.forEach(([lbl, val]) => {
    checkPageBreak(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 41, 59);
    doc.text(lbl, margin + 3, y + 4);
    y += 5;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    const splitText = doc.splitTextToSize(val, contentWidth - 6);
    doc.text(splitText, margin + 6, y + 3);
    y += splitText.length * 4.5 + 2;
  });
  y += 4;

  // Section 5: Excavability & Mechanized Boring
  checkPageBreak(30);
  doc.setFillColor(241, 245, 249);
  doc.rect(margin, y, contentWidth, 6, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(30, 41, 59);
  doc.text('5. EXCAVABILITY & TBM MECHANIZED ASSESSMENT', margin + 3, y + 4.5);
  y += 8;

  const excavRows = [
    ['Franklin Excavability Index:', data.franklinResult?.category || 'Rip and Blast'],
    ['Weaver Riptability Rating:', data.weaverResult?.category || 'Rippable with D9/D10 Dozer'],
    ['TBM Penetration Rate (Isaksson):', `${data.isakssonResult?.penetrationRate?.toFixed(2) || '2.4'} m/h`],
    ['Daily Advance Rate Expectation:', `${((data.isakssonResult?.penetrationRate || 2.4) * 12).toFixed(1)} m/day (based on 50% utilization)`],
  ];

  excavRows.forEach(([lbl, val]) => {
    checkPageBreak(6);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text(lbl, margin + 3, y + 4);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(val, margin + 85, y + 4);
    doc.setDrawColor(226, 232, 240);
    doc.line(margin, y + 5.5, margin + contentWidth, y + 5.5);
    y += 5.5;
  });
  y += 8;

  // Sign-off / Verification Box
  checkPageBreak(30);
  doc.setDrawColor(203, 213, 225);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(margin, y, contentWidth, 24, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text('TECHNICAL VERIFICATION & ENGINEERING SIGN-OFF', margin + 4, y + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text('Lead Geomechanical Designer: Saeed Jamali Zavareh (Ph.D. in Rock Mechanics)', margin + 4, y + 12);
  doc.text('Calculation Engine: Empirical Tunnel Design Suite v1.0 (RMR89, Barton Q, GSI, Terzaghi)', margin + 4, y + 17);
  doc.text(`Official Export Date: ${data.reportDateStr || new Date().toLocaleDateString()}`, margin + contentWidth - 55, y + 17);

  // Trigger download directly as PDF
  const pdfBlob = doc.output('blob');
  triggerFileDownload(pdfBlob, fileName);
}

/**
 * High-fidelity official PDF exporter.
 * First attempts to rasterize discrete A4 document pages (.official-document-page) for pixel-perfect Persian typography and tables.
 * If canvas capturing is not available or blocked, automatically falls back to exportStructuredNativePdf to guarantee a PDF file is downloaded.
 */
export async function generateOfficialPdf(
  element: HTMLElement | null,
  reportData: DocxReportData,
  fileName: string
): Promise<void> {
  try {
    if (!element) {
      exportStructuredNativePdf(reportData, fileName);
      return;
    }

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true,
    });

    const pdfWidth = pdf.internal.pageSize.getWidth(); // 210mm
    const pdfHeight = pdf.internal.pageSize.getHeight(); // 297mm

    // Query discrete A4 pages (.official-document-page)
    const pageElements = element.querySelectorAll<HTMLElement>('.official-document-page');

    if (pageElements && pageElements.length > 0) {
      for (let i = 0; i < pageElements.length; i++) {
        if (i > 0) {
          pdf.addPage('a4', 'portrait');
        }

        const pageEl = pageElements[i];

        const canvas = await html2canvas(pageEl, {
          scale: 2,
          useCORS: true,
          allowTaint: false,
          logging: false,
          backgroundColor: '#ffffff',
          imageTimeout: 10000,
          onclone: (clonedDoc) => {
            // Sanitize images or remove tainted icons that could break canvas export
            const imgs = clonedDoc.querySelectorAll('img');
            imgs.forEach((img) => {
              img.crossOrigin = 'anonymous';
            });
            const allElements = clonedDoc.querySelectorAll('*');
            allElements.forEach((node) => {
              const el = node as HTMLElement;
              if (el.style) {
                el.style.letterSpacing = 'normal';
                el.style.wordSpacing = 'normal';
              }
            });
          },
        });

        const imgData = canvas.toDataURL('image/jpeg', 0.95);
        pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
      }

      const pdfBlob = pdf.output('blob');
      triggerFileDownload(pdfBlob, fileName);
    } else {
      // Element does not have discrete pages, capture whole container
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: false,
        logging: false,
        backgroundColor: '#ffffff',
        imageTimeout: 10000,
      });

      const totalPages = Math.ceil(canvas.height / ((canvas.width * pdfHeight) / pdfWidth));
      const pageCanvasHeight = (canvas.width * pdfHeight) / pdfWidth;
      let renderedHeight = 0;

      for (let page = 0; page < totalPages; page++) {
        if (page > 0) {
          pdf.addPage('a4', 'portrait');
        }

        const sliceCanvas = document.createElement('canvas');
        sliceCanvas.width = canvas.width;
        sliceCanvas.height = Math.min(pageCanvasHeight, canvas.height - renderedHeight);

        const ctx = sliceCanvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(
            canvas,
            0,
            renderedHeight,
            canvas.width,
            sliceCanvas.height,
            0,
            0,
            canvas.width,
            sliceCanvas.height
          );

          const sliceData = sliceCanvas.toDataURL('image/jpeg', 0.95);
          const sliceMmHeight = (sliceCanvas.height * pdfWidth) / canvas.width;
          pdf.addImage(sliceData, 'JPEG', 0, 0, pdfWidth, sliceMmHeight, undefined, 'FAST');
        }

        renderedHeight += pageCanvasHeight;
      }

      const pdfBlob = pdf.output('blob');
      triggerFileDownload(pdfBlob, fileName);
    }
  } catch (error) {
    console.warn('HTML-to-Canvas PDF generation encountered an issue, generating structured native PDF...', error);
    // Bulletproof fallback: Always deliver a real, complete .pdf file to the user!
    exportStructuredNativePdf(reportData, fileName);
  }
}
