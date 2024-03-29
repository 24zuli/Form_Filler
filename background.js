chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'fillForm') {
        const formData = message.formData;
        const formUrl = message.formUrl;

        // Extract form data from the uploaded file
        extractFormData(formData).then(formDataObj => {
            // Send message to content script to fill the form with extracted data
            chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
                chrome.tabs.sendMessage(tabs[0].id, {
                    action: 'fillForm',
                    formData: formDataObj,
                    formUrl: formUrl
                }, function(response) {
                    sendResponse({ success: response.success });
                });
            });
        }).catch(error => {
            console.error('Failed to extract form data:', error);
            sendResponse({ success: false });
        });

        // Return true to indicate that sendResponse will be called asynchronously
        return true;
    }
});

// Function to extract form data from the uploaded file
function extractFormData(formData) {
    return new Promise((resolve, reject) => {
        // Your code for extracting form data goes here
        // This could involve parsing the uploaded PDF/DOC file and extracting relevant information
        // For demonstration purposes, let's assume formDataObj is the extracted form data
        const formDataObj = {
            name: 'John Doe',
            email: 'john@example.com'
                // Add more fields as necessary
        };
        resolve(formDataObj);
    });
}

// Event listener for form submission
document.getElementById('form').addEventListener('submit', async function(event) {
    event.preventDefault();

    const fileInput = document.getElementById('fileInput');
    const formUrl = document.getElementById('formUrl').value;

    if (!formUrl) {
        alert('Please enter the form URL');
        return;
    }

    if (!fileInput.files.length) {
        alert('Please upload a file');
        return;
    }

    const file = fileInput.files[0];

    // Extract text from uploaded PDF file
    const fileText = await extractTextFromPDF(file);

    // Send extracted text to background script for further processing
    chrome.runtime.sendMessage({ action: 'extractAnswers', fileText }, function(response) {
        if (response.success) {
            const formData = response.formData;
            // Send message to content script to fill the form with extracted data
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                const activeTab = tabs[0];
                chrome.tabs.sendMessage(activeTab.id, { action: 'fillForm', formData, formUrl }, function(response) {
                    if (response.success) {
                        alert('Form filling completed!');
                    } else {
                        alert('Failed to fill form');
                    }
                });
            });
        } else {
            alert('Failed to extract answers from the document');
        }
    });
});

// Function to extract text from PDF file
function extractTextFromPDF(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = function(event) {
            const typedarray = new Uint8Array(event.target.result);
            pdfjsLib.getDocument(typedarray).promise.then(function(pdf) {
                let text = '';
                const totalPages = pdf.numPages;
                const promises = [];
                for (let i = 1; i <= totalPages; i++) {
                    promises.push(pdf.getPage(i).then(function(page) {
                        return page.getTextContent().then(function(content) {
                            let pageText = '';
                            content.items.forEach(function(item) {
                                pageText += item.str + ' ';
                            });
                            text += pageText;
                        });
                    }));
                }
                Promise.all(promises).then(function() {
                    resolve(text);
                });
            });
        };
        reader.readAsArrayBuffer(file);
    });
}