// DATA

const fileInput = document.getElementById('file-input');
const fileInputMessageDisplay = document.getElementById('file-input-message');

fileInput.addEventListener('change', handleFileSelection);

let csvData = null;

function handleFileSelection(event) {
  const file = event.target.files[0];
  fileInputMessageDisplay.textContent = ''; // Clear previous messages

  // Validate file existence and type
  if (!file) {
    showMessage('No file selected. Please choose a file.', 'error');
    return;
  }

  if (!file.type.startsWith('text')) {
    showMessage('Unsupported file type. Please select a text file.', 'error');
    return;
  }

  // Read the file
  const reader = new FileReader();
  reader.onload = () => {
    // console.log('Validate:', validateCSV(reader.result));
    csvData = processCsvData(reader.result);
    console.log('Success:', csvData);
  };
  reader.onerror = () => {
    showMessage('Error reading the file. Please try again.', 'error');
  };
  reader.readAsText(file);
}

// Displays a message to the user
function showMessage(message, type) {
  fileInputMessageDisplay.textContent = message;
  fileInputMessageDisplay.style.color = type === 'error' ? 'red' : 'green';
}

function validateCSV(data) {
  const requiredHeaders = [
    'Time',
    'Match',
    'Red Team ID',
    'Red Team Name',
    'Red Team Number',
    'Blue Team ID',
    'Blue Team Name',
    'Blue Team Number',
  ];
  const headers = data[0];
  return requiredHeaders.every((header) => headers.includes(header));
}

function normalizeData(data) {
  return data.map((row) => ({
    name: row.Name.trim(),
    age: parseInt(row.Age, 10),
    email: row.Email.toLowerCase(),
  }));
}

function processCsvData(csvString) {
  const lines = csvString.split('\n');
  const headers = lines[0].split(','); // Assuming the first line contains headers
  const data = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',');
    if (values.length === headers.length) {
      // Ensure consistent number of columns
      const rowObject = {};
      for (let j = 0; j < headers.length; j++) {
        rowObject[headers[j].trim()] = values[j].trim();
      }
      data.push(rowObject);
    }
  }

  return data; // 'data' now contains an array of objects
}
