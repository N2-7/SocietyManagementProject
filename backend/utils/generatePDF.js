const PDFDocument = require('pdfkit');
const QRCode = require('qrcode');

/**
 * Generate highly attractive, executive-ready PDF receipt
 */
const generatePDF = async (data, res) => {
  try {
    const doc = new PDFDocument({ 
      margin: 30,
      size: 'A4',
      layout: 'portrait'
    });
    
    // Set response headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=maintenance_receipt_${data.flatNo || 'flat'}_${data.month || 'bill'}_${data.year || ''}.pdf`);
    
    doc.pipe(res);

    // Format helpers
    const formatCurrency = (val) => `₹ ${(val || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A';
    const formatDateTime = (d) => d ? new Date(d).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'N/A';

    const baseAmt = data.baseAmount || data.amount || 0;
    const latePen = data.latePenalty || 0;
    const otherChg = data.otherCharges || 0;
    const totalAmt = data.totalAmount || (baseAmt + latePen + otherChg);
    const receiptNo = data.receiptId || `RCP-${Date.now().toString().slice(-8)}`;

    // Generate QR Code Buffer
    let qrBuffer = null;
    try {
      const qrPayload = JSON.stringify({
        receiptNo: receiptNo,
        flatNo: data.flatNo,
        amount: totalAmt,
        txnId: data.transactionId,
        date: formatDate(data.paymentDate || new Date())
      });
      qrBuffer = await QRCode.toBuffer(qrPayload, {
        errorCorrectionLevel: 'M',
        margin: 1,
        width: 150,
        color: {
          dark: '#1E1B4B',
          light: '#FFFFFF'
        }
      });
    } catch (qrErr) {
      console.error('QR Generation failed:', qrErr);
    }

    // Colors Palette
    const colors = {
      primary: '#312E81',      // Deep Indigo
      primaryLight: '#4F46E5', // Bright Indigo
      primaryBg: '#EEF2FF',    // Indigo Tint
      success: '#059669',      // Emerald Green
      successBg: '#D1FAE5',    // Emerald Light
      successText: '#065F46',  // Emerald Dark
      darkText: '#1E293B',     // Slate 800
      mutedText: '#64748B',    // Slate 500
      lightBg: '#F8FAFC',      // Slate 50
      cardBorder: '#CBD5E1',   // Slate 300
      tableHeaderBg: '#1E1B4B'// Navy Blue
    };

    // 1. Page Border (Outer Frame)
    doc.roundedRect(25, 25, 545, 790, 8)
       .lineWidth(1)
       .strokeColor(colors.cardBorder)
       .stroke();

    // 2. Header Banner Box
    doc.roundedRect(40, 40, 515, 80, 8)
       .fillColor(colors.primary)
       .fill();

    // Decorative Icon / Emblem in Banner (Building Silhouette)
    doc.save();
    doc.translate(55, 52);
    // Draw Building Shapes
    doc.rect(0, 15, 22, 35).fillColor('#818CF8').fill();
    doc.rect(26, 5, 26, 45).fillColor('#6366F1').fill();
    doc.rect(56, 22, 18, 28).fillColor('#A5B4FC').fill();
    // Windows
    doc.rect(6, 20, 4, 5).fillColor('#EEF2FF').fill();
    doc.rect(14, 20, 4, 5).fillColor('#EEF2FF').fill();
    doc.rect(6, 30, 4, 5).fillColor('#EEF2FF').fill();
    doc.rect(14, 30, 4, 5).fillColor('#EEF2FF').fill();

    doc.rect(32, 10, 5, 6).fillColor('#EEF2FF').fill();
    doc.rect(41, 10, 5, 6).fillColor('#EEF2FF').fill();
    doc.rect(32, 22, 5, 6).fillColor('#EEF2FF').fill();
    doc.rect(41, 22, 5, 6).fillColor('#EEF2FF').fill();
    doc.rect(32, 34, 5, 6).fillColor('#EEF2FF').fill();
    doc.rect(41, 34, 5, 6).fillColor('#EEF2FF').fill();
    doc.restore();

    // Banner Text
    doc.fillColor('#FFFFFF')
       .fontSize(18)
       .font('Helvetica-Bold')
       .text('SMART SOCIETY MANAGEMENT', 140, 54);

    doc.fillColor('#C7D2FE')
       .fontSize(10)
       .font('Helvetica')
       .text('Official Maintenance & Facility Payment Receipt', 140, 77);

    doc.fillColor('#A5B4FC')
       .fontSize(8)
       .font('Helvetica-Oblique')
       .text('Automated Resident Billing Portal • Verified Document', 140, 93);

    // 3. Status Badge (PAID Stamp Box) & Receipt Info
    doc.roundedRect(385, 135, 170, 45, 6)
       .fillAndStroke(colors.successBg, colors.success);

    doc.fillColor(colors.success)
       .fontSize(12)
       .font('Helvetica-Bold')
       .text('✓ PAID & VERIFIED', 385, 144, { width: 170, align: 'center' });

    doc.fillColor(colors.successText)
       .fontSize(8)
       .font('Helvetica')
       .text('Official Receipt Copy', 385, 162, { width: 170, align: 'center' });

    // 4. Information Cards

    // Left Card: Resident & Bill Info
    doc.roundedRect(40, 135, 330, 105, 6)
       .fillAndStroke(colors.lightBg, colors.cardBorder);

    // Card Header Bar
    doc.roundedRect(40, 135, 330, 24, 6)
       .fillColor('#E2E8F0')
       .fill();
    doc.fillColor(colors.darkText)
       .fontSize(9)
       .font('Helvetica-Bold')
       .text('RESIDENT & PROPERTY DETAILS', 50, 142);

    // Card Content Grid
    doc.fontSize(9).font('Helvetica-Bold').fillColor(colors.mutedText);
    doc.text('Flat Number:', 50, 168);
    doc.text('Resident Type:', 50, 186);
    doc.text('Billing Period:', 50, 204);
    doc.text('Due Date:', 50, 222);

    doc.font('Helvetica-Bold').fillColor(colors.darkText);
    doc.text(data.flatNo || 'N/A', 140, 168);
    doc.text((data.residentType || 'Resident').toUpperCase(), 140, 186);
    doc.text(`${data.month || ''} ${data.year || ''}`, 140, 204);
    doc.text(formatDate(data.dueDate), 140, 222);

    // Transaction Info Card
    doc.roundedRect(40, 250, 515, 70, 6)
       .fillAndStroke(colors.primaryBg, colors.primaryLight);

    // Card Header Bar
    doc.roundedRect(40, 250, 515, 22, 6)
       .fillColor(colors.primaryLight)
       .fill();
    doc.fillColor('#FFFFFF')
       .fontSize(9)
       .font('Helvetica-Bold')
       .text('TRANSACTION & PAYMENT INFORMATION', 50, 256);

    // Content inside Transaction Card (2 Columns)
    doc.fontSize(8.5).font('Helvetica').fillColor(colors.mutedText).text('Receipt No:', 50, 280);
    doc.font('Helvetica-Bold').fillColor(colors.darkText).text(receiptNo, 120, 280);

    doc.font('Helvetica').fillColor(colors.mutedText).text('Transaction ID:', 50, 298);
    doc.font('Helvetica-Bold').fillColor(colors.darkText).text(data.transactionId || 'N/A', 120, 298);

    doc.font('Helvetica').fillColor(colors.mutedText).text('Payment Date:', 310, 280);
    doc.font('Helvetica-Bold').fillColor(colors.darkText).text(formatDateTime(data.paymentDate || new Date()), 385, 280);

    doc.font('Helvetica').fillColor(colors.mutedText).text('Payment Mode:', 310, 298);
    doc.font('Helvetica-Bold').fillColor(colors.darkText).text(data.paymentMethod || 'Online Payment', 385, 298);

    // 5. Itemized Breakdown Table
    const tableTop = 340;
    
    // Table Header Bar
    doc.roundedRect(40, tableTop, 515, 26, 4)
       .fillColor(colors.tableHeaderBg)
       .fill();

    doc.fillColor('#FFFFFF')
       .fontSize(9)
       .font('Helvetica-Bold');
    doc.text('SR', 50, tableTop + 8);
    doc.text('ITEM DESCRIPTION', 80, tableTop + 8);
    doc.text('CATEGORY / NOTES', 270, tableTop + 8);
    doc.text('STATUS', 410, tableTop + 8);
    doc.text('AMOUNT', 480, tableTop + 8, { width: 65, align: 'right' });

    // Rows Data
    const tableRows = [
      {
        sr: '1',
        desc: `Base Maintenance (${data.month || ''} ${data.year || ''})`,
        category: 'Regular Monthly Maintenance',
        status: 'Included',
        amount: baseAmt
      }
    ];

    if (latePen > 0) {
      tableRows.push({
        sr: (tableRows.length + 1).toString(),
        desc: 'Late Penalty Charge',
        category: 'Overdue Fee',
        status: 'Applied',
        amount: latePen,
        isPenalty: true
      });
    }

    if (otherChg > 0) {
      tableRows.push({
        sr: (tableRows.length + 1).toString(),
        desc: data.otherChargesDescription || 'Utility / Extra Charges',
        category: 'Additional Charges',
        status: 'Included',
        amount: otherChg
      });
    }

    let currentY = tableTop + 26;
    tableRows.forEach((row, idx) => {
      const rowHeight = 28;
      // Alternate row background
      if (idx % 2 === 1) {
        doc.rect(40, currentY, 515, rowHeight)
           .fillColor(colors.lightBg)
           .fill();
      }

      // Bottom stroke line
      doc.moveTo(40, currentY + rowHeight)
         .lineTo(555, currentY + rowHeight)
         .strokeColor(colors.cardBorder)
         .lineWidth(0.5)
         .stroke();

      doc.fontSize(8.5).font('Helvetica').fillColor(colors.darkText);
      doc.text(row.sr, 50, currentY + 8);
      doc.text(row.desc, 80, currentY + 8, { width: 180 });
      doc.text(row.category, 270, currentY + 8, { width: 130 });

      // Status pill tag
      if (row.isPenalty) {
        doc.fillColor('#DC2626').font('Helvetica-Bold').text(row.status, 410, currentY + 8);
      } else {
        doc.fillColor(colors.success).font('Helvetica-Bold').text(row.status, 410, currentY + 8);
      }

      doc.fillColor(colors.darkText).font('Helvetica-Bold');
      doc.text(formatCurrency(row.amount), 470, currentY + 8, { width: 75, align: 'right' });

      currentY += rowHeight;
    });

    // 6. Grand Total Summary Box
    const totalBoxY = currentY + 15;
    doc.roundedRect(40, totalBoxY, 515, 55, 6)
       .fillAndStroke(colors.primaryBg, colors.primaryLight);

    doc.fillColor(colors.primary)
       .fontSize(12)
       .font('Helvetica-Bold')
       .text('TOTAL AMOUNT PAID', 55, totalBoxY + 14);

    doc.fillColor(colors.mutedText)
       .fontSize(8)
       .font('Helvetica')
       .text('Net payment received in full (inclusive of all applicable charges)', 55, totalBoxY + 32);

    doc.fillColor(colors.primary)
       .fontSize(18)
       .font('Helvetica-Bold')
       .text(formatCurrency(totalAmt), 350, totalBoxY + 16, { width: 190, align: 'right' });

    // 7. Footer Section
    const footerY = 740;
    doc.moveTo(40, footerY)
       .lineTo(555, footerY)
       .strokeColor(colors.cardBorder)
       .lineWidth(1)
       .stroke();

    doc.fillColor(colors.darkText)
       .fontSize(9)
       .font('Helvetica-Bold')
       .text('Thank you for your prompt payment!', 40, footerY + 12, { width: 515, align: 'center' });

    doc.fillColor(colors.mutedText)
       .fontSize(8)
       .font('Helvetica')
       .text('For queries or support, contact the Society Accounts Office or email support@smartsociety.com', 40, footerY + 27, { width: 515, align: 'center' });

    doc.fillColor('#94A3B8')
       .fontSize(7.5)
       .font('Helvetica-Oblique')
       .text('This is an electronically generated receipt and requires no physical signature.', 40, footerY + 40, { width: 515, align: 'center' });

    doc.end();
  } catch (error) {
    console.error('Error generating receipt PDF:', error);
    if (!res.headersSent) {
      res.status(500).json({ message: 'Error generating PDF receipt' });
    }
  }
};

module.exports = generatePDF;

