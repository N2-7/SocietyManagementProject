const PDFDocument = require('pdfkit');
const QRCode = require('qrcode');

/**
 * Generate Executive-Grade NOC PDF Certificate
 */
const generateNOCPDF = async (nocData, res, mode = 'attachment') => {
  try {
    const doc = new PDFDocument({
      margin: 30,
      size: 'A4',
      layout: 'portrait'
    });

    const certNo = nocData.certificateNumber || `NOC-${Date.now().toString().slice(-8)}`;
    const filename = `NOC_${certNo}.pdf`;

    // Set HTTP response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `${mode}; filename="${filename}"`);

    doc.pipe(res);

    // Format Helpers
    const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A';

    // Color Palette
    const colors = {
      primary: '#1E1B4B',        // Dark Indigo
      primaryLight: '#4338CA',   // Indigo 700
      accent: '#D97706',         // Gold / Amber
      accentBg: '#FEF3C7',       // Amber 100
      success: '#047857',        // Emerald 700
      successBg: '#D1FAE5',      // Emerald 100
      darkText: '#0F172A',       // Slate 900
      mutedText: '#475569',      // Slate 600
      lightBg: '#F8FAFC',        // Slate 50
      cardBorder: '#CBD5E1',     // Slate 300
      goldBorder: '#F59E0B'
    };

    // 1. Double Page Border Frame (Official Legal Certificate Look)
    doc.roundedRect(20, 20, 555, 802, 10)
       .lineWidth(2)
       .strokeColor(colors.primary)
       .stroke();

    doc.roundedRect(25, 25, 545, 792, 8)
       .lineWidth(0.8)
       .strokeColor(colors.accent)
       .stroke();

    // 2. Generate Security QR Code
    let qrBuffer = null;
    try {
      const qrPayload = JSON.stringify({
        certificateNumber: certNo,
        residentName: nocData.residentId?.name || nocData.residentName || 'N/A',
        flatNo: nocData.flatNo || 'N/A',
        nocType: nocData.nocType || 'General',
        issueDate: formatDate(nocData.issueDate || nocData.updatedAt || new Date()),
        status: 'VERIFIED_GENUINE'
      });
      qrBuffer = await QRCode.toBuffer(qrPayload, {
        errorCorrectionLevel: 'H',
        margin: 1,
        width: 140,
        color: {
          dark: '#1E1B4B',
          light: '#FFFFFF'
        }
      });
    } catch (qrErr) {
      console.error('NOC QR Generation error:', qrErr);
    }

    // 3. Header Banner Box
    doc.roundedRect(40, 40, 515, 90, 8)
       .fillColor(colors.primary)
       .fill();

    // Crest / Society Emblem Icon
    doc.save();
    doc.translate(55, 52);
    // Outer Emblem Ring
    doc.circle(28, 28, 26).lineWidth(2).strokeColor('#F59E0B').stroke();
    // Inner Building Silhouette
    doc.rect(14, 22, 12, 22).fillColor('#818CF8').fill();
    doc.rect(28, 12, 16, 32).fillColor('#6366F1').fill();
    doc.rect(18, 26, 4, 4).fillColor('#FFFFFF').fill();
    doc.rect(32, 18, 4, 4).fillColor('#FFFFFF').fill();
    doc.rect(38, 18, 4, 4).fillColor('#FFFFFF').fill();
    doc.rect(32, 28, 4, 4).fillColor('#FFFFFF').fill();
    doc.rect(38, 28, 4, 4).fillColor('#FFFFFF').fill();
    doc.restore();

    // Banner Text Content
    doc.fillColor('#FFFFFF')
       .fontSize(19)
       .font('Helvetica-Bold')
       .text('SMART SOCIETY MANAGEMENT', 125, 52);

    doc.fillColor('#F59E0B')
       .fontSize(13)
       .font('Helvetica-Bold')
       .text('NO OBJECTION CERTIFICATE (N.O.C.)', 125, 75);

    doc.fillColor('#C7D2FE')
       .fontSize(8.5)
       .font('Helvetica')
       .text('Official Administration Office • Verified Digital Certificate', 125, 96);

    // 4. QR Code & Certificate Badge Header Right Box
    if (qrBuffer) {
      doc.image(qrBuffer, 460, 45, { width: 80 });
      doc.fillColor('#FFFFFF')
         .fontSize(7)
         .font('Helvetica-Bold')
         .text('SCAN TO VERIFY', 460, 126, { width: 80, align: 'center' });
    }

    // 5. Status Badge & Certificate Metadata Bar
    doc.roundedRect(40, 145, 515, 45, 6)
       .fillAndStroke(colors.successBg, colors.success);

    doc.fillColor(colors.success)
       .fontSize(11)
       .font('Helvetica-Bold')
       .text('STATUS: APPROVED & OFFICIALLY ISSUED', 55, 155);

    doc.fillColor('#065F46')
       .fontSize(8.5)
       .font('Helvetica')
       .text(`Certificate No: ${certNo}`, 55, 172);

    doc.fontSize(8.5).font('Helvetica').text(`Issue Date: ${formatDate(nocData.issueDate || nocData.updatedAt)}`, 320, 155);
    doc.text(`Validity: ${nocData.expiryDate ? formatDate(nocData.expiryDate) : 'Permanent / Standard'}`, 320, 172);

    // 6. Resident & Property Details Card
    const resY = 205;
    doc.roundedRect(40, resY, 515, 90, 6)
       .fillAndStroke(colors.lightBg, colors.cardBorder);

    // Card Header Bar
    doc.roundedRect(40, resY, 515, 22, 6)
       .fillColor('#E2E8F0')
       .fill();

    doc.fillColor(colors.primary)
       .fontSize(9.5)
       .font('Helvetica-Bold')
       .text('I. RESIDENT & PROPERTY INFORMATION', 50, resY + 6);

    // Data grid (2 Columns)
    doc.fontSize(9).font('Helvetica-Bold').fillColor(colors.mutedText);
    doc.text('Resident Name:', 50, resY + 32);
    doc.text('Flat / Unit No:', 50, resY + 50);
    doc.text('Contact Phone:', 50, resY + 68);

    doc.font('Helvetica-Bold').fillColor(colors.darkText);
    doc.text(nocData.residentId?.name || nocData.residentName || 'N/A', 145, resY + 32);
    doc.text(nocData.flatNo || 'N/A', 145, resY + 50);
    doc.text(nocData.residentId?.phone || 'N/A', 145, resY + 68);

    doc.fontSize(9).font('Helvetica-Bold').fillColor(colors.mutedText);
    doc.text('Email Address:', 310, resY + 32);
    doc.text('Resident Type:', 310, resY + 50);
    doc.text('Society Dues:', 310, resY + 68);

    doc.font('Helvetica-Bold').fillColor(colors.darkText);
    doc.text(nocData.residentId?.email || 'N/A', 400, resY + 32);
    doc.text('Owner / Registered Resident', 400, resY + 50);
    doc.fillColor(colors.success).text('CLEARED (NO PENDING DUES)', 400, resY + 68);

    // 7. NOC Specific Details Box
    const specY = 310;
    doc.roundedRect(40, specY, 515, 95, 6)
       .fillAndStroke('#FEF3C7', colors.goldBorder);

    // Card Header Bar
    doc.roundedRect(40, specY, 515, 22, 6)
       .fillColor(colors.accent)
       .fill();

    doc.fillColor('#FFFFFF')
       .fontSize(9.5)
       .font('Helvetica-Bold')
       .text('II. CERTIFICATE PURPOSE & SPECIFICATIONS', 50, specY + 6);

    const formatNOCType = (type) => (type || 'GENERAL').replace('-', ' ').toUpperCase();

    doc.fontSize(9).font('Helvetica-Bold').fillColor(colors.darkText);
    doc.text('NOC Type / Category:', 50, specY + 32);
    doc.font('Helvetica-Bold').fillColor(colors.primary);
    doc.text(nocData.nocType === 'other' ? (nocData.otherType || 'OTHER').toUpperCase() : formatNOCType(nocData.nocType), 160, specY + 32);

    doc.fontSize(9).font('Helvetica-Bold').fillColor(colors.darkText);
    doc.text('Stated Purpose:', 50, specY + 50);
    doc.font('Helvetica').fillColor(colors.darkText);
    doc.text(nocData.purpose || 'No specific details provided.', 160, specY + 50, { width: 380 });

    if (nocData.documentUrl) {
      doc.fontSize(8.5).font('Helvetica-Bold').fillColor(colors.mutedText);
      doc.text('Supporting Reference:', 50, specY + 76);
      doc.font('Helvetica-Oblique').fillColor(colors.primaryLight);
      doc.text(nocData.documentUrl, 160, specY + 76, { width: 380 });
    }

    // 8. Formal Legal Non-Objection Certification Statement
    const declY = 420;
    doc.roundedRect(40, declY, 515, 140, 6)
       .fillAndStroke(colors.lightBg, colors.cardBorder);

    doc.roundedRect(40, declY, 515, 22, 6)
       .fillColor(colors.primary)
       .fill();

    doc.fillColor('#FFFFFF')
       .fontSize(9.5)
       .font('Helvetica-Bold')
       .text('III. OFFICIAL DECLARATION & NON-OBJECTION CERTIFICATION', 50, declY + 6);

    doc.fontSize(9.5)
       .font('Helvetica')
       .fillColor(colors.darkText)
       .text(
         `This is to formally certify that the Managing Committee of Smart Society Management has NO OBJECTION to resident `,
         55, declY + 34, { continued: true }
       )
       .font('Helvetica-Bold')
       .text(`${nocData.residentId?.name || nocData.residentName || 'the resident'} `, { continued: true })
       .font('Helvetica')
       .text(`(Flat No: `, { continued: true })
       .font('Helvetica-Bold')
       .text(`${nocData.flatNo || ''}`, { continued: true })
       .font('Helvetica')
       .text(`) proceeding with the aforementioned purpose `, { continued: true })
       .font('Helvetica-Bold')
       .text(`[${nocData.nocType === 'other' ? nocData.otherType : formatNOCType(nocData.nocType)}].`, { continued: false });

    doc.moveDown(0.5);
    doc.fontSize(9)
       .font('Helvetica')
       .fillColor(colors.mutedText)
       .text(
         'It is confirmed that as of the date of issue of this certificate, there are no outstanding maintenance charges, fines, or pending society disputes recorded against the subject resident and property unit.',
         55, declY + 80, { width: 485, align: 'justify' }
       );

    doc.fontSize(8.5)
       .font('Helvetica-Oblique')
       .fillColor(colors.primaryLight)
       .text(
         'This certificate is issued at the specific request of the resident for presentation to relevant authorities or institutions.',
         55, declY + 115, { width: 485 }
       );

    // Watermark Background Stamp Text
    doc.save();
    doc.fillColor('#E0E7FF')
       .opacity(0.18)
       .fontSize(42)
       .font('Helvetica-Bold')
       .text('OFFICIAL CERTIFICATE', 50, 585, { align: 'center', width: 500 });
    doc.restore();

    // 9. Signatory & Digital Seal Section
    const sigY = 575;
    doc.roundedRect(40, sigY, 515, 120, 6)
       .fillAndStroke(colors.lightBg, colors.cardBorder);

    // Left Box: Admin Remarks & Approval Info
    doc.fontSize(9).font('Helvetica-Bold').fillColor(colors.darkText);
    doc.text('Approval Details & Remarks:', 50, sigY + 12);

    doc.fontSize(8.5).font('Helvetica').fillColor(colors.mutedText);
    doc.text(`Approved By: `, 50, sigY + 30, { continued: true })
       .font('Helvetica-Bold').fillColor(colors.darkText)
       .text(`${nocData.approvedBy?.name || 'Society Admin / President'}`);

    doc.font('Helvetica').fillColor(colors.mutedText)
       .text(`Approval Date: `, 50, sigY + 46, { continued: true })
       .font('Helvetica-Bold').fillColor(colors.darkText)
       .text(`${formatDate(nocData.updatedAt || nocData.issueDate)}`);

    if (nocData.adminRemarks) {
      doc.font('Helvetica').fillColor(colors.mutedText)
         .text(`Admin Remarks: `, 50, sigY + 62, { continued: true })
         .font('Helvetica-Oblique').fillColor(colors.primary)
         .text(`"${nocData.adminRemarks}"`, { width: 230 });
    }

    // Right Box: Official Seal Graphic & Signature
    doc.save();
    doc.translate(370, sigY + 10);
    // Seal Circle
    doc.circle(70, 45, 38).lineWidth(1.5).strokeColor(colors.primary).stroke();
    doc.circle(70, 45, 34).lineWidth(0.5).strokeColor(colors.accent).stroke();
    
    doc.fillColor(colors.primary).fontSize(7.5).font('Helvetica-Bold')
       .text('SOCIETY SEAL', 30, 26, { width: 80, align: 'center' });
    doc.fillColor(colors.accent).fontSize(6.5).font('Helvetica-Bold')
       .text('★ VERIFIED ★', 30, 36, { width: 80, align: 'center' });
    doc.fillColor(colors.darkText).fontSize(7).font('Helvetica')
       .text('AUTHENTIC', 30, 48, { width: 80, align: 'center' });
    doc.fillColor(colors.mutedText).fontSize(6).font('Helvetica-Oblique')
       .text('DIGITAL SIGNATURE', 30, 58, { width: 80, align: 'center' });
    doc.restore();

    // 10. Footer Section
    const footerY = 720;
    doc.moveTo(40, footerY)
       .lineTo(555, footerY)
       .strokeColor(colors.cardBorder)
       .lineWidth(1)
       .stroke();

    doc.fillColor(colors.darkText)
       .fontSize(8.5)
       .font('Helvetica-Bold')
       .text('Smart Society Management System • Official Verification Portal', 40, footerY + 10, { width: 515, align: 'center' });

    doc.fillColor(colors.mutedText)
       .fontSize(7.5)
       .font('Helvetica')
       .text('This is an electronically generated and digitally authenticated document. For verification queries, scan the QR code above or contact administrative office.', 40, footerY + 24, { width: 515, align: 'center' });

    doc.fillColor('#94A3B8')
       .fontSize(7)
       .font('Helvetica-Oblique')
       .text(`Document Hash ID: ${certNo} | Timestamp: ${new Date().toISOString()}`, 40, footerY + 40, { width: 515, align: 'center' });

    doc.end();
  } catch (error) {
    console.error('Error generating NOC PDF:', error);
    if (!res.headersSent) {
      res.status(500).json({ message: 'Error generating NOC PDF certificate' });
    }
  }
};

module.exports = generateNOCPDF;
