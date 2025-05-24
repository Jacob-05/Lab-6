import { login } from "../services/AuthService";

class LoginForm extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        this.render();
        this.setupEventListeners();
    }

    private setupEventListeners() {
        const form = this.shadowRoot?.querySelector('form');
        if (form) {
            form.addEventListener('submit', this.handleSubmit.bind(this));
        }

        const registerLink = this.shadowRoot?.querySelector('.register-link');
        if (registerLink) {
            registerLink.addEventListener('click', this.handleRegisterClick.bind(this));
        }
    }

    private async handleSubmit(event: Event) {
        event.preventDefault();
        const form = event.target as HTMLFormElement;
        const email = (form.querySelector('#email') as HTMLInputElement).value;
        const password = (form.querySelector('#password') as HTMLInputElement).value;

        try {
            await login(email, password);
        } catch (error: any) {
            alert(error.message);
        }
    }

    private handleRegisterClick(event: Event) {
        event.preventDefault();
        window.dispatchEvent(new CustomEvent("switch-auth-form", { 
            detail: { form: "register" } 
        }));
    }

    render() {
        if (!this.shadowRoot) return;

        this.shadowRoot.innerHTML = `
            <style>
                .login-container {
                    background: white;
                    padding: 30px;
                    border-radius: 8px;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                    max-width: 400px;
                    margin: 0 auto;
                }

                h2 {
                    text-align: center;
                    color: #333;
                    margin-bottom: 20px;
                }

                .form-group {
                    margin-bottom: 15px;
                }

                label {
                    display: block;
                    margin-bottom: 5px;
                    color: #666;
                }

                input {
                    width: 100%;
                    padding: 8px;
                    border: 1px solid #ddd;
                    border-radius: 4px;
                    box-sizing: border-box;
                }

                button {
                    width: 100%;
                    padding: 10px;
                    background-color: #4a90e2;
                    color: white;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 16px;
                }

                button:hover {
                    background-color: #357abd;
                }

                .register-link {
                    display: block;
                    text-align: center;
                    margin-top: 15px;
                    color: #4a90e2;
                    text-decoration: none;
                }

                .register-link:hover {
                    text-decoration: underline;
                }
            </style>

            <div class="login-container">
                <h2>Iniciar Sesión</h2>
                <form>
                    <div class="form-group">
                        <label for="email">Email</label>
                        <input type="email" id="email" required>
                    </div>
                    <div class="form-group">
                        <label for="password">Contraseña</label>
                        <input type="password" id="password" required>
                    </div>
                    <button type="submit">Iniciar Sesión</button>
                </form>
                <a href="#" class="register-link">¿No tienes cuenta? Regístrate</a>
            </div>
        `;
    }
}

export default LoginForm; 