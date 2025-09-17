const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const error = document.getElementById('error');
const registerError = document.getElementById('registerError');
const showRegister = document.getElementById('showRegister');
const showLogin = document.getElementById('showLogin');
const loginContainer = document.querySelector('.login-container');
const registerContainer = document.querySelector('.register-container');

let users = JSON.parse(localStorage.getItem('users')) || [];

showRegister.addEventListener('click', () => {
    loginContainer.style.display = 'none';
    registerContainer.style.display = 'block';
});

showLogin.addEventListener('click', () => {
    registerContainer.style.display = 'none';
    loginContainer.style.display = 'block';
});

registerForm.addEventListener('submit', function(e){
    e.preventDefault();
    const name = document.getElementById('name').value;
    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPassword').value;

    if(users.find(u => u.email === email)){
        registerError.textContent = 'E-mail já cadastrado!';
        return;
    }

    users.push({name, email, password, appliances: []});
    localStorage.setItem('users', JSON.stringify(users));
    registerError.textContent = '';
    alert('Conta criada com sucesso!');
    registerForm.reset();
    registerContainer.style.display = 'none';
    loginContainer.style.display = 'block';
});

loginForm.addEventListener('submit', function(e){
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    const user = users.find(u => u.email === email && u.password === password);
    if(user){
        localStorage.setItem('loggedUser', JSON.stringify(user));
        window.location.href = 'dashboard.html';
    } else {
        error.textContent = 'E-mail ou senha incorretos!';
    }
});

document.addEventListener("DOMContentLoaded", () => {
    const elements = document.querySelectorAll(".landing-section, .solution-container");
    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("show");
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.2 });
    elements.forEach(el => observer.observe(el));
});
