const fs = require('fs');
const csv = require('csv-parser');

const parseCSV = (filePath) => {
  return new Promise((resolve, reject) => {
    const records = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('headers', (headers) => {
        console.log('CSV Headers:', headers.map((h) => h.trim())); // Debugging headers
      })
      .on('data', (row) => {
        // Trim and normalize column names
        const formattedRow = {};
        for (const key in row) {
          formattedRow[key.trim()] = row[key].trim(); // Trim keys and values
        }
        records.push(formattedRow);
      })
      .on('end', () => resolve(records))
      .on('error', (error) => reject(error));
  });
};

module.exports = parseCSV;
