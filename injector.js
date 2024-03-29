var placeholder = document.querySelectorAll('.exportLabel');

placeholder[1].remove();
document.querySelector('input[aria-label="Name"]').value = 'Mark Winteringham';

placeholder[2].remove();
document.querySelector('input[aria-label="Email"]').value = 'test@email.com';

placeholder[3].remove();
document.querySelector('textarea[aria-label="Address"]').value = 'Lorem ipsum';

placeholder[4].remove();
document.querySelector('input[aria-label="Phone number"]').value = '07482394123';

placeholder[5].remove();
document.querySelector('textarea[aria-label="Comments"]').value = 'Lorem ipsum';