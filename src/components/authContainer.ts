import { isLoggedIn } from "../services/AuthService";

class AuthContainer extends HTMLElement {
    private currentForm: string = "login";

    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        // Verificar si el usuario ya está autenticado
        if (isLoggedIn()) {
            // El usuario ya está autenticado, disparar evento
            window.dispatchEvent(new CustomEvent("auth-changed", { detail: { isLoggedIn: true } }));
            return;
        }

        // Renderizar formulario inicial
        this.render();

        // Escuchar eventos para cambiar entre formularios
        window.addEventListener("switch-auth-form", this.handleSwitchForm.bind(this));
    }

    disconnectedCallback() {
        window.removeEventListener("switch-auth-form", this.handleSwitchForm.bind(this));
    }

    handleSwitchForm(event: Event) {
        const detail = (event as CustomEvent).detail;
        if (detail && detail.form) {
            this.currentForm = detail.form;
            this.render();
        }
    }

    render() {
        if (!this.shadowRoot) return;

        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: flex;
                    flex-direction: column;
                    width: 100%;
                    height: 100%;
                    background-color: #f5f5f5;
                    box-sizing: border-box;
                }
                
                .auth-container {
                    width: 100%;
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 20px;
                }
                
                .app-logo {
                    text-align: center;
                    margin-bottom: 20px;
                }
                
                .app-logo h1 {
                    font-size: 32px;
                    color: #4a90e2;
                    margin: 0;
                }
            </style>

            <div class="auth-container">
                <div class="app-logo">
                    <h1>Gestor de Tareas</h1>
                </div>
                ${this.currentForm === "login" ? 
                    '<login-form></login-form>' : 
                    '<register-form></register-form>'}
            </div>
        `;
    }
}

export default AuthContainer; 