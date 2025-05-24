import { auth } from '../config/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import '../styles/main.css';

class AuthComponent extends HTMLElement {
    private currentForm: 'login' | 'register' = 'login';

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

        const switchButton = this.shadowRoot?.querySelector('.switch-form');
        if (switchButton) {
            switchButton.addEventListener('click', this.switchForm.bind(this));
        }

        // Validación en tiempo real del email
        const emailInput = this.shadowRoot?.querySelector('#email') as HTMLInputElement;
        if (emailInput) {
            emailInput.addEventListener('input', this.validateEmail.bind(this));
        }

        // Validación en tiempo real de la contraseña
        const passwordInput = this.shadowRoot?.querySelector('#password') as HTMLInputElement;
        if (passwordInput) {
            passwordInput.addEventListener('input', this.validatePassword.bind(this));
        }
    }

    private validateEmail(event: Event) {
        const input = event.target as HTMLInputElement;
        const email = input.value;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const isValid = emailRegex.test(email);
        
        this.updateInputValidation(input, isValid, 'Por favor, ingresa un correo electrónico válido');
    }

    private validatePassword(event: Event) {
        const input = event.target as HTMLInputElement;
        const password = input.value;
        const isValid = password.length >= 6;
        
        this.updateInputValidation(input, isValid, 'La contraseña debe tener al menos 6 caracteres');
    }

    private updateInputValidation(input: HTMLInputElement, isValid: boolean, message: string) {
        const formGroup = input.closest('.form-group');
        const errorElement = formGroup?.querySelector('.input-error') as HTMLElement;

        if (!isValid && input.value) {
            input.classList.add('invalid');
            if (!errorElement) {
                const error = document.createElement('div');
                error.className = 'input-error';
                error.textContent = message;
                formGroup?.appendChild(error);
            }
        } else {
            input.classList.remove('invalid');
            errorElement?.remove();
        }
    }

    private async handleSubmit(event: Event) {
        event.preventDefault();
        const form = event.target as HTMLFormElement;
        const email = (form.querySelector('#email') as HTMLInputElement).value;
        const password = (form.querySelector('#password') as HTMLInputElement).value;
        const submitButton = form.querySelector('button[type="submit"]') as HTMLButtonElement;
        const errorMessage = this.shadowRoot?.querySelector('.error-message') as HTMLElement;

        // Validar antes de enviar
        if (!this.validateForm(email, password)) {
            return;
        }

        try {
            submitButton.disabled = true;
            submitButton.textContent = 'Procesando...';

            if (this.currentForm === 'login') {
                await signInWithEmailAndPassword(auth, email, password);
            } else {
                await createUserWithEmailAndPassword(auth, email, password);
            }
        } catch (error: any) {
            console.error('Error de autenticación:', error);
            let mensaje = 'Error al procesar la solicitud';
            
            switch (error.code) {
                case 'auth/network-request-failed':
                    mensaje = 'Error de conexión. Por favor, verifica tu conexión a internet.';
                    break;
                case 'auth/invalid-email':
                    mensaje = 'El correo electrónico no es válido.';
                    break;
                case 'auth/user-disabled':
                    mensaje = 'Esta cuenta ha sido deshabilitada.';
                    break;
                case 'auth/user-not-found':
                    mensaje = 'No existe una cuenta con este correo electrónico.';
                    break;
                case 'auth/wrong-password':
                    mensaje = 'Contraseña incorrecta.';
                    break;
                case 'auth/invalid-credential':
                    mensaje = 'Credenciales inválidas. Por favor, verifica tu correo y contraseña.';
                    break;
                case 'auth/email-already-in-use':
                    mensaje = 'Este correo electrónico ya está registrado.';
                    break;
                case 'auth/weak-password':
                    mensaje = 'La contraseña debe tener al menos 6 caracteres.';
                    break;
            }

            if (errorMessage) {
                errorMessage.textContent = mensaje;
                errorMessage.style.display = 'block';
            }
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = this.currentForm === 'login' ? 'Iniciar Sesión' : 'Registrarse';
        }
    }

    private validateForm(email: string, password: string): boolean {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const isEmailValid = emailRegex.test(email);
        const isPasswordValid = password.length >= 6;

        if (!isEmailValid) {
            this.showError('Por favor, ingresa un correo electrónico válido');
            return false;
        }

        if (!isPasswordValid) {
            this.showError('La contraseña debe tener al menos 6 caracteres');
            return false;
        }

        return true;
    }

    private showError(message: string) {
        const errorMessage = this.shadowRoot?.querySelector('.error-message') as HTMLElement;
        if (errorMessage) {
            errorMessage.textContent = message;
            errorMessage.style.display = 'block';
        }
    }

    private switchForm() {
        this.currentForm = this.currentForm === 'login' ? 'register' : 'login';
        this.render();
        this.setupEventListeners();
    }

    render() {
        if (!this.shadowRoot) return;

        this.shadowRoot.innerHTML = `
            <style>
                .auth-container {
                    max-width: 400px;
                    margin: 0 auto;
                    padding: 20px;
                    background: white;
                    border-radius: 8px;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
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

                input.invalid {
                    border-color: #dc3545;
                }

                .input-error {
                    color: #dc3545;
                    font-size: 12px;
                    margin-top: 5px;
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

                button:disabled {
                    background-color: #ccc;
                    cursor: not-allowed;
                }

                button:hover:not(:disabled) {
                    background-color: #357abd;
                }

                .switch-form {
                    display: block;
                    text-align: center;
                    margin-top: 15px;
                    color: #4a90e2;
                    cursor: pointer;
                    background: none;
                    border: none;
                    width: auto;
                }

                .switch-form:hover {
                    text-decoration: underline;
                }

                .error-message {
                    display: none;
                    color: #dc3545;
                    background-color: #f8d7da;
                    border: 1px solid #f5c6cb;
                    padding: 10px;
                    border-radius: 4px;
                    margin-bottom: 15px;
                    text-align: center;
                }
            </style>

            <div class="auth-container">
                <h2>${this.currentForm === 'login' ? 'Iniciar Sesión' : 'Registrarse'}</h2>
                <div class="error-message"></div>
                <form>
                    <div class="form-group">
                        <label for="email">Correo Electrónico</label>
                        <input type="email" id="email" required>
                    </div>
                    <div class="form-group">
                        <label for="password">Contraseña</label>
                        <input type="password" id="password" required>
                    </div>
                    <button type="submit">
                        ${this.currentForm === 'login' ? 'Iniciar Sesión' : 'Registrarse'}
                    </button>
                </form>
                <button class="switch-form">
                    ${this.currentForm === 'login' 
                        ? '¿No tienes cuenta? Regístrate' 
                        : '¿Ya tienes cuenta? Inicia sesión'}
                </button>
            </div>
        `;
    }
}

export default AuthComponent; 