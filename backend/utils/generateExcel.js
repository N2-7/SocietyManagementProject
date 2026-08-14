const ExcelJS = require('exceljs');

/**
 * Generate Excel report
 */
const generateExcel = async (data, filename, res) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Report');
  
  // Add headers based on data
  if (data.length > 0) {
    const headers = Object.keys(data[0]);
    worksheet.addRow(headers);
    
    // Add data rows
    data.forEach(item => {
      const row = headers.map(header => item[header]);
      worksheet.addRow(row);
    });
  }
  
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename=${filename}.xlsx`);
  
  await workbook.xlsx.write(res);
  res.end();
};

module.exports = generateExcel;
