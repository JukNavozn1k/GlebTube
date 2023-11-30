const passwordInput = document.getElementById('id_password');
const showPasswordCheckbox = document.getElementById('flexCheckDefault');


showPasswordCheckbox.addEventListener('change', function () {
    if (this.checked) {
        passwordInput.type = 'text';
    } else {
        passwordInput.type = 'password';
    }
});
