import { collection, addDoc, getDocs, doc, deleteDoc, updateDoc, query, where } from 'firebase/firestore';
import { TaskType } from '../types/Types';
import { db, auth } from '../config/firebase';

export class TaskService {
    private collection = collection(db, 'tasks');

    async createTask(task: Partial<TaskType>): Promise<void> {
        try {
            const user = auth.currentUser;
            if (!user) {
                throw new Error('No hay usuario autenticado');
            }

            await addDoc(this.collection, {
                ...task,
                status: task.status || 'pending',
                createdAt: new Date(),
                userId: user.uid
            });
        } catch (error) {
            console.error('Error al crear la tarea:', error);
            throw error;
        }
    }

    async getTasks(): Promise<TaskType[]> {
        try {
            const user = auth.currentUser;
            if (!user) {
                throw new Error('No hay usuario autenticado');
            }

            const q = query(this.collection, where('userId', '==', user.uid));
            const querySnapshot = await getDocs(q);
            
            return querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt.toDate()
            })) as TaskType[];
        } catch (error) {
            console.error('Error al obtener las tareas:', error);
            throw error;
        }
    }

    async updateTask(taskId: string, updates: Partial<TaskType>): Promise<void> {
        try {
            const user = auth.currentUser;
            if (!user) {
                throw new Error('No hay usuario autenticado');
            }

            const taskRef = doc(this.collection, taskId);
            await updateDoc(taskRef, updates);
        } catch (error) {
            console.error('Error al actualizar la tarea:', error);
            throw error;
        }
    }

    async deleteTask(taskId: string): Promise<void> {
        try {
            const user = auth.currentUser;
            if (!user) {
                throw new Error('No hay usuario autenticado');
            }

            const taskRef = doc(this.collection, taskId);
            await deleteDoc(taskRef);
        } catch (error) {
            console.error('Error al eliminar la tarea:', error);
            throw error;
        }
    }
} 