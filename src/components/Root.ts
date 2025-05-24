import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../config/firebase';
import '../styles/main.css';

class Root extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        this.setupAuthListener();
        this.render();
    }

    private setupAuthListener() {
        onAuthStateChanged(auth, (user) => {
            console.log('Estado de autenticación cambiado:', user);
            this.updateContent(user);
        });
    }

    private updateContent(user: any) {
        if (!this.shadowRoot) return;

        if (user) {
            this.shadowRoot.innerHTML = '<task-manager></task-manager>';
        } else {
            this.shadowRoot.innerHTML = '<auth-container></auth-container>';
        }
    }

    render() {
        if (!this.shadowRoot) return;

        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: block;
                    width: 100%;
                    min-height: 100vh;
                    font-family: Arial, sans-serif;
                }
            </style>
            <div id="content"></div>
        `;
    }
}

export default Root; 