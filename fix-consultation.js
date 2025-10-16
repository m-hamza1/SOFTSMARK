// This script will fix the consultation modal by adding the missing function call
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'index.html');

// Read the file
fs.readFile(filePath, 'utf8', (err, data) => {
  if (err) {
    console.error('Error reading file:', err);
    return;
  }

  // Add the setupConsultationModal() call after the DOMContentLoaded event
  const updatedContent = data.replace(
    '      document.addEventListener(\'DOMContentLoaded\', function() {\n\n        // Quote form submission handler',
    '      document.addEventListener(\'DOMContentLoaded\', function() {\n        // Initialize consultation modal\n        setupConsultationModal();\n\n        // Quote form submission handler'
  );

  // Write the updated content back to the file
  fs.writeFile(filePath, updatedContent, 'utf8', (err) => {
    if (err) {
      console.error('Error writing file:', err);
      return;
    }
    console.log('Successfully updated index.html to fix consultation modal');
  });
});
