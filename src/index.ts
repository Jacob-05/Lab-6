import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { firebaseConfig, auth, db } from './config/firebase';
import { TaskManager } from './components/TaskManager';
import AuthComponent from './components/AuthComponent';
import './styles/main.css';
import Root from './components/Root';
import LoginForm from './components/loginForm';
import RegisterForm from './components/registerForm';
import AuthContainer from './components/authContainer';

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Registrar componentes
function registerComponent(name: string, component: any) {
    if (!customElements.get(name)) {
        customElements.define(name, component);
    }
}

// Registrar componentes cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    console.log('Aplicación iniciada');

    try {
        // Registrar componentes
        registerComponent('root-element', Root);
        registerComponent('login-form', LoginForm);
        registerComponent('register-form', RegisterForm);
        registerComponent('task-manager', TaskManager);
        registerComponent('auth-container', AuthContainer);
        registerComponent('auth-component', AuthComponent);
    } catch (error) {
        console.error('Error al inicializar la aplicación:', error);
    }
}); 