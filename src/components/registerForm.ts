import { register } from "../services/AuthService";

class RegisterForm extends HTMLElement {
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

        const loginLink = this.shadowRoot?.querySelector('.login-link');
        if (loginLink) {
            loginLink.addEventListener('click', this.handleLoginClick.bind(this));
        }
    }

    private async handleSubmit(event: Event) {
        event.preventDefault();
        const form = event.target as HTMLFormElement;
        const email = (form.querySelector('#email') as HTMLInputElement).value;
        const password = (form.querySelector('#password') as HTMLInputElement).value;
        const confirmPassword = (form.querySelector('#confirmPassword') as HTMLInputElement).value;

        if (password !== confirmPassword) {
            alert('Las contraseñas no coinciden');
            return;
        }

        try {
            await register(email, password);
        } catch (error: any) {
            alert(error.message);
        }
    }

    private handleLoginClick(event: Event) {
        event.preventDefault();
        window.dispatchEvent(new CustomEvent("switch-auth-form", { 
            detail: { form: "login" } 
        }));
    }

    render() {
        if (!this.shadowRoot) return;

        this.shadowRoot.innerHTML = `
            <style>
                .register-container {
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

                .login-link {
                    display: block;
                    text-align: center;
                    margin-top: 15px;
                    color: #4a90e2;
                    text-decoration: none;
                }

                .login-link:hover {
                    text-decoration: underline;
                }
            </style>

            <div class="register-container">
                <h2>Registro</h2>
                <form>
                    <div class="form-group">
                        <label for="email">Email</label>
                        <input type="email" id="email" required>
                    </div>
                    <div class="form-group">
                        <label for="password">Contraseña</label>
                        <input type="password" id="password" required>
                    </div>
                    <div class="form-group">
                        <label for="confirmPassword">Confirmar Contraseña</label>
                        <input type="password" id="confirmPassword" required>
                    </div>
                    <button type="submit">Registrarse</button>
                </form>
                <a href="#" class="login-link">¿Ya tienes cuenta? Inicia sesión</a>
            </div>
        `;
    }
}

export default RegisterForm; 