let originalPoints = [];
let adjustedPoints = [];
let selectedBase = null;

// Function to initialize data
function initializeData() {
    // Copy data from surveyData array
    originalPoints = [...surveyData];

    // Initialize the base station select dropdown
    const baseSelect = document.getElementById('baseSelect');
    originalPoints.forEach(point => {
        const option = document.createElement('option');
        option.value = point.name;
        option.textContent = `${point.name} - ${point.description}`;
        baseSelect.appendChild(option);
    });

    // Display original points
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

// Replace loadCSV() call with initializeData()
initializeData(); 