// MAT Document Upload Portal JavaScript

// Global state management
let formData = {
    personal: {},
    technical: {},
    files: []
};

let currentStep = 1;

// Default values from MAT configuration
const DEFAULT_VALUES = {
    name: "MAT",
    email: "atozclientmail@gmail.com"
};

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    setupFileUpload();
    setupFormValidation();
    setDefaultValues();
    updateProgressBar();
}

function setDefaultValues() {
    // Set default values for name and email fields
    const nameField = document.getElementById('name');
    const emailField = document.getElementById('email');
    
    if (nameField && !nameField.value) {
        nameField.value = DEFAULT_VALUES.name;
    }
    if (emailField && !emailField.value) {
        emailField.value = DEFAULT_VALUES.email;
    }
}

// Page Navigation
function startProcess() {
    showPage('form-container');
    showStep(1);
    setDefaultValues(); // Ensure defaults are set when starting
}

function goToHomepage() {
    showPage('homepage');
    resetForm();
}

function showPage(pageId) {
    // Hide all pages
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    
    // Show target page
    document.getElementById(pageId).classList.add('active');
}

function showStep(stepNumber) {
    currentStep = stepNumber;
    
    // Hide all steps
    document.querySelectorAll('.form-step').forEach(step => {
        step.classList.remove('active');
    });
    
    // Show target step
    document.getElementById(`step${stepNumber}`).classList.add('active');
    
    // Update progress indicators
    updateProgressIndicators();
    updateProgressBar();
}

function updateProgressIndicators() {
    document.querySelectorAll('.step').forEach((step, index) => {
        const stepNumber = index + 1;
        step.classList.remove('active', 'completed');
        
        if (stepNumber === currentStep) {
            step.classList.add('active');
        } else if (stepNumber < currentStep) {
            step.classList.add('completed');
        }
    });
}

function updateProgressBar() {
    const progressFill = document.querySelector('.progress-fill');
    const progressPercentage = ((currentStep - 1) / 2) * 100;
    progressFill.style.width = `${progressPercentage}%`;
}

// Step Navigation
function nextStep(fromStep) {
    if (validateStep(fromStep)) {
        saveStepData(fromStep);
        if (fromStep < 3) {
            showStep(fromStep + 1);
        }
    }
}

function prevStep(toStep) {
    showStep(toStep - 1);
}

// Form Validation
function setupFormValidation() {
    // Add real-time validation
    const inputs = document.querySelectorAll('input[required], select[required], textarea[required]');
    inputs.forEach(input => {
        input.addEventListener('blur', () => validateField(input));
        input.addEventListener('input', () => clearFieldError(input));
    });
}

function validateStep(stepNumber) {
    let isValid = true;
    const step = document.getElementById(`step${stepNumber}`);
    const requiredFields = step.querySelectorAll('input[required], select[required], textarea[required]');
    
    requiredFields.forEach(field => {
        if (!validateField(field)) {
            isValid = false;
        }
    });
    
    return isValid;
}

function validateField(field) {
    const value = field.value.trim();
    const fieldName = field.name;
    let isValid = true;
    let errorMessage = '';
    
    // Required field validation
    if (field.hasAttribute('required') && !value) {
        isValid = false;
        errorMessage = 'This field is required';
    }
    
    // Email validation
    if (field.type === 'email' && value && !isValidEmail(value)) {
        isValid = false;
        errorMessage = 'Please enter a valid email address';
    }
    
    // Phone validation
    if (field.type === 'tel' && value && !isValidPhone(value)) {
        isValid = false;
        errorMessage = 'Please enter a valid phone number';
    }
    
    // Display error
    showFieldError(field, errorMessage, !isValid);
    
    return isValid;
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function isValidPhone(phone) {
    const phoneRegex = /^[\+]?[\d\s\-\(\)]{10,}$/;
    return phoneRegex.test(phone);
}

function showFieldError(field, message, show) {
    const errorElement = document.getElementById(`${field.name}-error`);
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.classList.toggle('show', show);
    }
    
    field.classList.toggle('error', show);
}

function clearFieldError(field) {
    showFieldError(field, '', false);
}

// Data Management
function saveStepData(stepNumber) {
    if (stepNumber === 1) {
        // Save personal details
        const personalForm = document.getElementById('personal-form');
        const formDataObj = new FormData(personalForm);
        formData.personal = {};
        
        for (let [key, value] of formDataObj.entries()) {
            formData.personal[key] = value;
        }
    } else if (stepNumber === 2) {
        // Save technical details
        const technicalForm = document.getElementById('technical-form');
        const formDataObj = new FormData(technicalForm);
        formData.technical = {};
        
        for (let [key, value] of formDataObj.entries()) {
            formData.technical[key] = value;
        }
    }
}

// File Upload Functionality
function setupFileUpload() {
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');
    const chooseFilesBtn = document.getElementById('chooseFilesBtn');
    
    if (dropZone && fileInput && chooseFilesBtn) {
        // Drag and drop events
        dropZone.addEventListener('dragover', handleDragOver);
        dropZone.addEventListener('dragleave', handleDragLeave);
        dropZone.addEventListener('drop', handleDrop);
        
        // Click to upload events
        chooseFilesBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            fileInput.click();
        });
        
        dropZone.addEventListener('click', function(e) {
            // Only trigger if not clicking the button
            if (e.target !== chooseFilesBtn && !chooseFilesBtn.contains(e.target)) {
                fileInput.click();
            }
        });
        
        // File input change
        fileInput.addEventListener('change', handleFileSelect);
    }
}

function handleDragOver(e) {
    e.preventDefault();
    e.stopPropagation();
    document.getElementById('dropZone').classList.add('dragover');
}

function handleDragLeave(e) {
    e.preventDefault();
    e.stopPropagation();
    // Only remove dragover if we're leaving the dropZone entirely
    if (!e.currentTarget.contains(e.relatedTarget)) {
        document.getElementById('dropZone').classList.remove('dragover');
    }
}

function handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    document.getElementById('dropZone').classList.remove('dragover');
    
    const files = Array.from(e.dataTransfer.files);
    processFiles(files);
}

function handleFileSelect(e) {
    const files = Array.from(e.target.files);
    processFiles(files);
}

function processFiles(files) {
    const supportedTypes = ['.pdf', '.doc', '.docx', '.txt', '.jpg', '.png', '.zip'];
    const maxSize = 10 * 1024 * 1024; // 10MB
    
    files.forEach(file => {
        // Validate file type
        const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
        if (!supportedTypes.includes(fileExtension)) {
            showAlert(`File type ${fileExtension} is not supported. Supported types: ${supportedTypes.join(', ')}`);
            return;
        }
        
        // Validate file size
        if (file.size > maxSize) {
            showAlert(`File ${file.name} is too large. Maximum size is 10MB.`);
            return;
        }
        
        // Check for duplicates
        const existingFile = formData.files.find(f => f.name === file.name && f.size === file.size);
        if (existingFile) {
            showAlert(`File ${file.name} has already been uploaded.`);
            return;
        }
        
        // Add to uploaded files
        const fileData = {
            id: Date.now() + Math.random(),
            name: file.name,
            size: file.size,
            type: fileExtension,
            file: file
        };
        
        formData.files.push(fileData);
        displayUploadedFile(fileData);
    });
    
    // Clear file input
    document.getElementById('fileInput').value = '';
}

function showAlert(message) {
    // Create a simple alert overlay
    const alertDiv = document.createElement('div');
    alertDiv.className = 'alert-overlay';
    alertDiv.innerHTML = `
        <div class="alert-content">
            <p>${message}</p>
            <button onclick="this.parentElement.parentElement.remove()">OK</button>
        </div>
    `;
    document.body.appendChild(alertDiv);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (alertDiv.parentElement) {
            alertDiv.remove();
        }
    }, 5000);
}

function displayUploadedFile(fileData) {
    const uploadedFilesContainer = document.getElementById('uploadedFiles');
    
    const fileItem = document.createElement('div');
    fileItem.className = 'file-item';
    fileItem.dataset.fileId = fileData.id;
    fileItem.innerHTML = `
        <div class="file-info-content">
            <div class="file-icon">${getFileIcon(fileData.type)}</div>
            <div class="file-details">
                <h4>${fileData.name}</h4>
                <p>${formatFileSize(fileData.size)}</p>
            </div>
        </div>
        <div class="file-actions">
            <button type="button" class="btn-remove" onclick="removeFile(${fileData.id})" title="Remove file">
                ✕
            </button>
        </div>
    `;
    
    uploadedFilesContainer.appendChild(fileItem);
}

function getFileIcon(fileType) {
    const iconMap = {
        '.pdf': '📄',
        '.doc': '📝',
        '.docx': '📝',
        '.txt': '📄',
        '.jpg': '🖼️',
        '.png': '🖼️',
        '.zip': '📦'
    };
    
    return iconMap[fileType] || '📄';
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function removeFile(fileId) {
    // Remove from formData
    formData.files = formData.files.filter(file => file.id !== fileId);
    
    // Remove from DOM
    const fileItem = document.querySelector(`[data-file-id="${fileId}"]`);
    if (fileItem) {
        fileItem.remove();
    }
}

// Summary and Review
function showSummary() {
    saveStepData(currentStep);
    generateSummary();
    showPage('summary-page');
}

function generateSummary() {
    // Personal details summary
    const personalSummary = document.getElementById('personal-summary');
    personalSummary.innerHTML = '';
    
    const personalLabels = {
        name: 'Full Name',
        email: 'Email Address',
        phone: 'Phone Number',
        organization: 'Organization/Company',
        department: 'Department/Position',
        address: 'Address'
    };
    
    Object.entries(formData.personal).forEach(([key, value]) => {
        if (value && personalLabels[key]) {
            const item = document.createElement('div');
            item.className = 'summary-item';
            item.innerHTML = `
                <span class="summary-label">${personalLabels[key]}:</span>
                <span class="summary-value">${value}</span>
            `;
            personalSummary.appendChild(item);
        }
    });
    
    // Technical details summary
    const technicalSummary = document.getElementById('technical-summary');
    technicalSummary.innerHTML = '';
    
    const technicalLabels = {
        projectType: 'Project Type/Category',
        priority: 'Priority Level',
        specifications: 'Technical Specifications',
        requirements: 'Requirements Description',
        deadline: 'Deadline/Timeline',
        notes: 'Additional Notes'
    };
    
    Object.entries(formData.technical).forEach(([key, value]) => {
        if (value && technicalLabels[key]) {
            const item = document.createElement('div');
            item.className = 'summary-item';
            item.innerHTML = `
                <span class="summary-label">${technicalLabels[key]}:</span>
                <span class="summary-value">${value}</span>
            `;
            technicalSummary.appendChild(item);
        }
    });
    
    // Files summary
    const filesSummary = document.getElementById('files-summary');
    filesSummary.innerHTML = '';
    
    if (formData.files.length === 0) {
        filesSummary.innerHTML = '<p>No files uploaded</p>';
    } else {
        formData.files.forEach(file => {
            const item = document.createElement('div');
            item.className = 'summary-item';
            item.innerHTML = `
                <span class="summary-label">${file.name}:</span>
                <span class="summary-value">${formatFileSize(file.size)}</span>
            `;
            filesSummary.appendChild(item);
        });
    }
}

function editSection(stepNumber) {
    showPage('form-container');
    showStep(stepNumber);
}

function backToUpload() {
    showPage('form-container');
    showStep(3);
}

// Confirmation and Submission
function showConfirmation() {
    document.getElementById('confirmModal').classList.remove('hidden');
}

function hideConfirmation() {
    document.getElementById('confirmModal').classList.add('hidden');
}

function submitForm() {
    hideConfirmation();
    showLoading();
    
    // Simulate submission delay
    setTimeout(() => {
        hideLoading();
        generateEmailPreview();
        showPage('success-page');
    }, 2000);
}

function showLoading() {
    document.getElementById('loadingOverlay').classList.remove('hidden');
}

function hideLoading() {
    document.getElementById('loadingOverlay').classList.add('hidden');
}

function generateEmailPreview() {
    const emailPreview = document.getElementById('emailPreview');
    const currentDate = new Date().toLocaleDateString();
    const submitTime = new Date().toLocaleTimeString();
    
    let emailContent = `From: MAT Document Portal <noreply@matportal.com>
To: atozclientmail@gmail.com
Subject: New Document Submission - MAT Portal - ${formData.personal.name || 'Unknown User'}

Dear MAT Team,

A new document upload submission has been received through the MAT Document Portal.

Submission Details:
------------------
Date: ${currentDate}
Time: ${submitTime}
Portal: MAT Document Upload Portal

PERSONAL DETAILS:
-----------------
`;
    
    const personalLabels = {
        name: 'Full Name',
        email: 'Email Address',
        phone: 'Phone Number',
        organization: 'Organization/Company',
        department: 'Department/Position',
        address: 'Address'
    };
    
    Object.entries(formData.personal).forEach(([key, value]) => {
        if (value && personalLabels[key]) {
            emailContent += `${personalLabels[key]}: ${value}\n`;
        }
    });
    
    emailContent += `\nTECHNICAL DETAILS:\n-----------------\n`;
    
    const technicalLabels = {
        projectType: 'Project Type/Category',
        priority: 'Priority Level',
        specifications: 'Technical Specifications',
        requirements: 'Requirements Description',
        deadline: 'Deadline/Timeline',
        notes: 'Additional Notes'
    };
    
    Object.entries(formData.technical).forEach(([key, value]) => {
        if (value && technicalLabels[key]) {
            emailContent += `${technicalLabels[key]}: ${value}\n`;
        }
    });
    
    emailContent += `\nUPLOADED FILES:\n--------------\n`;
    
    if (formData.files.length === 0) {
        emailContent += 'No files uploaded\n';
    } else {
        formData.files.forEach(file => {
            emailContent += `• ${file.name} (${formatFileSize(file.size)})\n`;
        });
    }
    
    emailContent += `\nSUMMARY:\n-------\n`;
    emailContent += `Total Files: ${formData.files.length}\n`;
    emailContent += `Priority Level: ${formData.technical.priority || 'Not specified'}\n`;
    emailContent += `Submitter Email: ${formData.personal.email || 'Not provided'}\n`;
    
    emailContent += `\n---\nThis email was automatically generated by the MAT Document Upload Portal.\nFor technical support, please contact your system administrator.\n\nMAT Document Portal System\nProcessed on: ${currentDate} at ${submitTime}`;
    
    emailPreview.textContent = emailContent;
}

// Reset and New Submission
function startNewSubmission() {
    resetForm();
    showPage('homepage');
}

function resetForm() {
    formData = {
        personal: {},
        technical: {},
        files: []
    };
    
    currentStep = 1;
    
    // Clear all form inputs except defaults
    document.querySelectorAll('input, select, textarea').forEach(field => {
        if (field.name === 'name') {
            field.value = DEFAULT_VALUES.name;
        } else if (field.name === 'email') {
            field.value = DEFAULT_VALUES.email;
        } else {
            field.value = '';
        }
        clearFieldError(field);
    });
    
    // Clear uploaded files display
    document.getElementById('uploadedFiles').innerHTML = '';
    
    // Reset progress
    updateProgressIndicators();
    updateProgressBar();
    
    // Set default values again to ensure they're maintained
    setDefaultValues();
}

function downloadSummary() {
    const summaryData = {
        submissionDate: new Date().toLocaleDateString(),
        submissionTime: new Date().toLocaleTimeString(),
        personalDetails: formData.personal,
        technicalDetails: formData.technical,
        files: formData.files.map(file => ({
            name: file.name,
            size: formatFileSize(file.size),
            type: file.type
        }))
    };
    
    const summaryText = `MAT DOCUMENT UPLOAD PORTAL - SUBMISSION SUMMARY
=================================================
Generated on: ${summaryData.submissionDate} at ${summaryData.submissionTime}
Portal: MAT Document Upload Portal
Recipient: atozclientmail@gmail.com

PERSONAL DETAILS:
-----------------
Name: ${summaryData.personalDetails.name || 'N/A'}
Email: ${summaryData.personalDetails.email || 'N/A'}
Phone: ${summaryData.personalDetails.phone || 'N/A'}
Organization: ${summaryData.personalDetails.organization || 'N/A'}
Department: ${summaryData.personalDetails.department || 'N/A'}
Address: ${summaryData.personalDetails.address || 'N/A'}

TECHNICAL DETAILS:
------------------
Project Type: ${summaryData.technicalDetails.projectType || 'N/A'}
Priority: ${summaryData.technicalDetails.priority || 'N/A'}
Specifications: ${summaryData.technicalDetails.specifications || 'N/A'}
Requirements: ${summaryData.technicalDetails.requirements || 'N/A'}
Deadline: ${summaryData.technicalDetails.deadline || 'N/A'}
Notes: ${summaryData.technicalDetails.notes || 'N/A'}

UPLOADED FILES:
---------------
${summaryData.files.length === 0 ? 'No files uploaded' : 
    summaryData.files.map(file => `• ${file.name} (${file.size})`).join('\n')}

SUMMARY:
--------
Total Files: ${summaryData.files.length}
Portal Owner: MAT
Notification Email: atozclientmail@gmail.com

---
This summary was generated by the MAT Document Upload Portal.
For questions or support, please contact the portal administrator.
`;
    
    // Create and download the file
    const blob = new Blob([summaryText], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = `MAT-submission-summary-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
}