import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';

export const isLoggedIn = (): boolean => {
    return !!localStorage.getItem('userId');
};

export const login = async (email: string, password: string): Promise<void> => {
    try {
        const auth = getAuth();
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        localStorage.setItem('userId', userCredential.user.uid);
        window.dispatchEvent(new CustomEvent('auth-changed', { 
            detail: { isAuthenticated: true } 
        }));
    } catch (error: any) {
        throw new Error(`Error al iniciar sesión: ${error.message}`);
    }
};

export const register = async (email: string, password: string): Promise<void> => {
    try {
        const auth = getAuth();
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        localStorage.setItem('userId', userCredential.user.uid);
        window.dispatchEvent(new CustomEvent('auth-changed', { 
            detail: { isAuthenticated: true } 
        }));
    } catch (error: any) {
        throw new Error(`Error al registrar usuario: ${error.message}`);
    }
};

export const logout = async (): Promise<void> => {
    try {
        const auth = getAuth();
        await signOut(auth);
        localStorage.removeItem('userId');
        window.dispatchEvent(new CustomEvent('auth-changed', { 
            detail: { isAuthenticated: false } 
        }));
    } catch (error: any) {
        throw new Error(`Error al cerrar sesión: ${error.message}`);
    }
}; 