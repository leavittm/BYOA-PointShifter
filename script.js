let originalPoints = [];
let adjustedPoints = [];
let selectedBase = null;

// Function to initialize data
function initializeData() {
    // Start with default data
    originalPoints = [...surveyData];
    initializeDropdown();
    displayOriginalPoints();
}

// Function to display original points
function displayOriginalPoints() {
    const tbody = document.querySelector('#originalTable tbody');
    tbody.innerHTML = '';

    originalPoints.forEach(point => {
        const row = tbody.insertRow();
        row.onclick = () => selectBase(point);
        row.insertCell(0).textContent = point.name;
        row.insertCell(1).textContent = point.description;
        row.insertCell(2).textContent = point.easting.toFixed(3);
        row.insertCell(3).textContent = point.northing.toFixed(3);
        row.insertCell(4).textContent = point.elevation.toFixed(3);
    });
}

// Function to select base station
function selectBase(point) {
    selectedBase = point;
    document.getElementById('baseSelect').value = point.name;
    updateBaseInfo();
}

// Function to update base station info display
function updateBaseInfo() {
    const baseInfo = document.getElementById('baseInfo');
    if (selectedBase) {
        baseInfo.innerHTML = `
            <p>Selected Base: ${selectedBase.name} (${selectedBase.description})</p>
            <p>Easting: ${selectedBase.easting.toFixed(3)}</p>
            <p>Northing: ${selectedBase.northing.toFixed(3)}</p>
            <p>Elevation: ${selectedBase.elevation.toFixed(3)}</p>
        `;
    } else {
        baseInfo.innerHTML = '<p>No base station selected</p>';
    }
}

// Function to calculate adjustment
function calculateAdjustment() {
    if (!selectedBase) {
        alert('Please select a base station first');
        return;
    }

    const newEasting = parseFloat(document.getElementById('newEasting').value);
    const newNorthing = parseFloat(document.getElementById('newNorthing').value);
    const newElevation = parseFloat(document.getElementById('newElevation').value);

    if (isNaN(newEasting) || isNaN(newNorthing) || isNaN(newElevation)) {
        alert('Please enter valid coordinates');
        return;
    }

    // Calculate differences
    const dE = newEasting - selectedBase.easting;
    const dN = newNorthing - selectedBase.northing;
    const dH = newElevation - selectedBase.elevation;

    // Display differences
    document.getElementById('differences').innerHTML = `
        <p>ΔEasting: ${dE.toFixed(3)}</p>
        <p>ΔNorthing: ${dN.toFixed(3)}</p>
        <p>ΔElevation: ${dH.toFixed(3)}</p>
    `;

    // Calculate adjusted points
    adjustedPoints = originalPoints.map(point => ({
        name: point.name,
        description: point.description,
        easting: point.easting + dE,
        northing: point.northing + dN,
        elevation: point.elevation + dH
    }));

    // Display adjusted points
    displayAdjustedPoints();
}

// Function to display adjusted points
function displayAdjustedPoints() {
    const tbody = document.querySelector('#adjustedTable tbody');
    tbody.innerHTML = '';

    adjustedPoints.forEach(point => {
        const row = tbody.insertRow();
        row.insertCell(0).textContent = point.name;
        row.insertCell(1).textContent = point.description;
        row.insertCell(2).textContent = point.easting.toFixed(3);
        row.insertCell(3).textContent = point.northing.toFixed(3);
        row.insertCell(4).textContent = point.elevation.toFixed(3);
    });
}

// Event listener for base station selection
document.getElementById('baseSelect').addEventListener('change', (e) => {
    const selectedPoint = originalPoints.find(p => p.name === e.target.value);
    if (selectedPoint) {
        selectBase(selectedPoint);
    } else {
        selectedBase = null;
        updateBaseInfo();
    }
});

// Add this function to handle CSV parsing
function parseCSV(csvText) {
    const lines = csvText.split('\n');
    const headers = lines[0].split(',');
    const points = [];

    // Skip header row and parse data
    for (let i = 1; i < lines.length; i++) {
        if (lines[i].trim() === '') continue;
        
        const values = lines[i].split(',');
        const point = {
            name: values[0],
            description: values[5],
            easting: parseFloat(values[2]),
            northing: parseFloat(values[3]),
            elevation: parseFloat(values[4])
        };
        points.push(point);
    }
    return points;
}

// Add this function to handle file selection
function handleFileSelect(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                originalPoints = parseCSV(e.target.result);
                adjustedPoints = []; // Clear any existing adjustments
                selectedBase = null; // Clear selected base
                
                // Refresh the display
                initializeDropdown();
                displayOriginalPoints();
                updateBaseInfo();
            } catch (error) {
                console.error('Error processing file:', error);
                alert('Error processing file: ' + error.message);
            }
        };
        reader.onerror = function(e) {
            console.error('Error reading file:', e);
            alert('Error reading file: ' + e.target.error);
        };
        reader.readAsText(file);
    }
}

// Add this function to handle dropdown initialization
function initializeDropdown() {
    const baseSelect = document.getElementById('baseSelect');
    baseSelect.innerHTML = '<option value="">Select Base Station</option>';
    originalPoints.forEach(point => {
        const option = document.createElement('option');
        option.value = point.name;
        option.textContent = `${point.name} - ${point.description}`;
        baseSelect.appendChild(option);
    });
}

// Replace loadCSV() call with initializeData()
initializeData();

// Add file input event listener
document.getElementById('csvFile').addEventListener('change', handleFileSelect);

function downloadAdjustedPoints() {
    // Get desired decimal places (default to 3 if invalid)
    const decimalPlaces = parseInt(document.getElementById('decimalPlaces').value);
    const places = (!isNaN(decimalPlaces) && decimalPlaces >= 0) ? decimalPlaces : 3;

    // Create CSV content
    const headers = 'Name,Description,Easting,Northing,Elevation\n';
    const csvContent = adjustedPoints.map(point => 
        `${point.name},${point.description},${point.easting.toFixed(places)},${point.northing.toFixed(places)},${point.elevation.toFixed(places)}`
    ).join('\n');
    
    // Create a Blob with the CSV content
    const blob = new Blob([headers + csvContent], { type: 'text/csv' });
    
    // Create a temporary URL for the Blob
    const url = window.URL.createObjectURL(blob);
    
    // Create a temporary link element
    const link = document.createElement('a');
    link.href = url;
    link.download = 'adjusted_points.csv'; // Name of the download file
    
    // Append link to body, click it, and remove it
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up the temporary URL
    window.URL.revokeObjectURL(url);
} 