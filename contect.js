chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'fillForm') {
        fillForm(message.formData);
    }
});

function fillForm(formData) {
    const inputFields = document.querySelectorAll('input[type="text"], input[type="email"], input[type="password"], textarea');
    const selectElements = document.querySelectorAll('select');
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    const radioButtons = document.querySelectorAll('input[type="radio"]');
    const questions = document.querySelectorAll('label');

    let allFieldsFilled = true; // Flag to track if all relevant fields are filled

    // Fill form fields based on extracted information or hypothetical answers
    questions.forEach(question => {
        const questionText = question.textContent.trim().toLowerCase();
        const correspondingField = findCorrespondingField(question, inputFields, selectElements, checkboxes, radioButtons);
        if (correspondingField) {
            let answer = getAnswerForQuestion(questionText, formData);
            if (!answer) {
                answer = getHypotheticalAnswer(questionText);
            }
            if (answer) {
                fillField(correspondingField, answer);
            } else {
                allFieldsFilled = false; // Set flag to false if any relevant field is not filled
            }
        }
    });

    // Display notification if all relevant fields are filled
    if (allFieldsFilled) {
        alert('Form filling completed!');
    }
}

function findCorrespondingField(question, inputFields, selectElements, checkboxes, radioButtons) {
    const htmlFor = question.getAttribute('for');
    if (htmlFor) {
        return inputFields.find(field => field.id === htmlFor) ||
            selectElements.find(field => field.id === htmlFor) ||
            checkboxes.find(field => field.id === htmlFor) ||
            radioButtons.find(field => field.id === htmlFor);
    } else {
        const questionText = question.textContent.trim().toLowerCase();
        return inputFields.find(field => field.placeholder.toLowerCase() === questionText) ||
            selectElements.find(field => field.name.toLowerCase() === questionText) ||
            checkboxes.find(field => field.name.toLowerCase() === questionText) ||
            radioButtons.find(field => field.name.toLowerCase() === questionText);
    }
}

function getAnswerForQuestion(questionText, formData) {
    // Look for relevant answer in extracted form data
    // You may need to adjust this logic based on how your form data is structured
    return formData[questionText];
}

function getHypotheticalAnswer(questionText) {
    // Provide hypothetical answers for questions that don't require information extraction
    if (questionText.includes('hear about us')) {
        return 'From a friend';
    }
    // Add more hypothetical answers for other questions as needed
    return null;
}

function fillField(field, value) {
    if (field.tagName === 'INPUT' && (field.type === 'text' || field.type === 'email' || field.type === 'password')) {
        field.value = value;
    } else if (field.tagName === 'TEXTAREA') {
        field.value = value;
    } else if (field.tagName === 'SELECT') {
        const option = Array.from(field.options).find(option => option.value.toLowerCase() === value.toLowerCase());
        if (option) {
            option.selected = true;
        }
    } else if (field.tagName === 'INPUT' && field.type === 'checkbox') {
        field.checked = true;
    }
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'fillForm') {
        const formData = message.formData;
        const formUrl = message.formUrl;

        // Send message to background script to initiate form filling with extracted data
        chrome.runtime.sendMessage({
            action: 'extractFormData',
            formData: formData
        }, function(response) {
            if (response.success) {
                // Background script successfully extracted form data
                // Now send a message to content script to fill the form
                chrome.tabs.sendMessage(sender.tab.id, {
                    action: 'fillForm',
                    formData: response.formData,
                    formUrl: formUrl
                }, function(response) {
                    sendResponse({ success: response.success });
                });
            } else {
                console.error('Failed to extract form data from the uploaded file');
                sendResponse({ success: false });
            }
        });

        // Return true to indicate that sendResponse will be called asynchronously
        return true;
    }
});