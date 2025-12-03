
// ...existing code...
document.addEventListener('DOMContentLoaded', () => {

    const registerForm = document.getElementById('registerForm');
    const loginForm = document.getElementById('loginForm');

    const showRegisterBtn = document.getElementById('showRegister');
    const showLoginBtn = document.getElementById('showLogin');
    const loginContainer = document.querySelector('.login-container');
    const registerContainer = document.querySelector('.register-container');

    const getField = (form, name) => {
        return form.querySelector([name="${name}"]) || form.querySelector(#${name});
    };

    const handleJsonResponse = async (res) => {
        const text = await res.text();
        try {
            return JSON.parse(text);
        } catch (e) {
            return { success: false, error: 'Resposta inválida do servidor', raw: text, status: res.status };
        }
    };

    // Toggle entre telas
    if (showRegisterBtn && registerContainer && loginContainer) {
        showRegisterBtn.addEventListener('click', (e) => {
            e.preventDefault();
            loginContainer.style.display = 'none';
            registerContainer.style.display = 'block';
        });
    }
    if (showLoginBtn && registerContainer && loginContainer) {
        showLoginBtn.addEventListener('click', (e) => {
            e.preventDefault();
            registerContainer.style.display = 'none';
            loginContainer.style.display = 'block';
        });
    }

    // Faz POST JSON tentando múltiplos endpoints (fallbacks)
    const postJsonWithFallback = async (urls, body) => {
        for (const url of urls) {
            try {
                const res = await fetch(url, {
                    method: 'POST',
                    credentials: 'same-origin',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(body)
                });
                // se 404/500, vamos registrar e tentar o próximo
                if (!res.ok) {
                    const txt = await res.text();
                    console.warn(Request to ${url} returned status ${res.status}, txt);
                    continue;
                }
                return { res, url };
            } catch (err) {
                console.warn(Network error when calling ${url}, err);
                // tenta próximo
            }
        }
        return null;
    };

    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const nameEl = getField(registerForm, 'name');
            const emailEl = getField(registerForm, 'email');
            const passEl = getField(registerForm, 'password');

            const name = (nameEl && nameEl.value || '').trim();
            const email = (emailEl && emailEl.value || '').trim();
            const password = (passEl && passEl.value || '').trim();

            if (!name || !email || !password) {
                alert('Preencha nome, email e senha.');
                return;
            }

            // Lista de caminhos a tentar (ordem: pasta banco_de_dados, raiz, caminho absoluto)
            const tryUrls = [
                'banco_de_dados/register.php',
                '/ezsite/banco_de_dados/register.php',
                'register.php',
                '/ezsite/register.php'
            ];

            const attempt = await postJsonWithFallback(tryUrls, { name, email, password });

            if (!attempt) {
                alert('Erro: não foi possível alcançar o endpoint de cadastro (ver console).');
                console.error('register error: nenhum endpoint respondeu com sucesso. Tentados:', tryUrls);
                return;
            }

            const { res, url } = attempt;
            const data = await handleJsonResponse(res);

            if (data.success) {
                alert('Cadastro realizado com sucesso.');
                registerForm.reset();
                registerContainer.style.display = 'none';
                loginContainer.style.display = 'block';
            } else {
                // mostra erro detalhado no console
                console.error('register error:', { attemptedUrl: url, response: data });
                const msg = data.error ? data.error : Resposta inválida do servidor (status ${data.status || res.status});
                alert('Erro no cadastro: ' + msg);
            }
        });
    }

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const emailEl = getField(loginForm, 'email');
            const passEl = getField(loginForm, 'password');

            const email = (emailEl && emailEl.value || '').trim();
            const password = (passEl && passEl.value || '').trim();

            if (!email || !password) {
                alert('Preencha email e senha.');
                return;
            }

            try {
                const res = await fetch('login.php', {
                    method: 'POST',
                    credentials: 'same-origin',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });

                const data = await handleJsonResponse(res);
                console.log('login response:', data);

                if (data.success) {
                    const params = new URLSearchParams(window.location.search);
                    const redirectTo = params.get('redirect') || '/ezsite/dashboard.php';
                    window.location.href = redirectTo;
                } else {
                    alert('Erro no login: ' + (data.error || JSON.stringify(data)));
                    console.error('login error:', data);
                }
            } catch (err) {
                console.error('Network/login error:', err);
                alert('Erro de rede ao logar. Veja o console para detalhes.');
            }
        });
    }

});
// ...existing code...