// Function to extract text from a PDF file
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

// Event listener for clicking the 'Fill Form' button
document.getElementById('fillFormButton').addEventListener('click', async function(event) {
    event.preventDefault();

    // Your code to extract data from the uploaded file and prepare formData goes here

    const formData = {}; // Replace this with your actual formData

    // URL of the form to be filled
    const formUrls = [
        "https://thecowrksfoundry.typeform.com/to/UKFEkn?typeform-source=incubatorlist.com",
        "https://jsf.co/apply/",
        "https://www.pareto20.com/",
        "https://www.beondeck.com/",
        "https://www.dreamit.com/getstarted",
        "https://www.seedchecks.com/"
    ];

    // Send a message to the background script for each form URL to initiate form filling
    formUrls.forEach(formUrl => {
        chrome.runtime.sendMessage({ action: 'fillForm', formData, formUrl });
    });
});