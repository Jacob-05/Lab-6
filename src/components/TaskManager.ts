import { TaskService } from '../services/TaskService';
import { TaskType } from '../types/Types';
import { auth } from '../config/firebase';
import '../styles/main.css';

export class TaskManager extends HTMLElement {
    private taskService: TaskService;
    private tasks: TaskType[] = [];
    private draggedTask: TaskType | null = null;

    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.taskService = new TaskService();
    }

    connectedCallback() {
        this.loadTasks();
        this.render();
        this.setupEventListeners();

        // Escuchar cambios en la autenticación
        auth.onAuthStateChanged((user) => {
            if (user) {
                this.loadTasks();
            } else {
                this.tasks = [];
                this.render();
            }
        });
    }

    private async loadTasks() {
        try {
            this.tasks = await this.taskService.getTasks();
            this.render();
        } catch (error) {
            console.error('Error al cargar las tareas:', error);
            this.showError('Error al cargar las tareas');
        }
    }

    private setupEventListeners() {
        const form = this.shadowRoot?.querySelector('form');
        if (form) {
            form.addEventListener('submit', this.handleSubmit.bind(this));
        }

        // Configurar drag and drop en las columnas
        const columns = this.shadowRoot?.querySelectorAll('.task-column');
        columns?.forEach(column => {
            column.addEventListener('dragover', (e: Event) => this.handleDragOver(e as DragEvent));
            column.addEventListener('drop', (e: Event) => this.handleDrop(e as DragEvent));
        });

        // Configurar eventos para las tarjetas de tarea (usando delegación si es posible o re-adjuntando después de render)
        // Dado que render() reemplaza innerHTML, re-adjuntaremos los eventos después de cada render.
        // Una mejor aproximación sería usar LitElement o similar, pero ajustaremos este enfoque por ahora.
        this.setupTaskCardEventListeners();
    }

    private setupTaskCardEventListeners() {
        // Esperar un momento para que el DOM se actualice después de render
        setTimeout(() => {
            const taskCards = this.shadowRoot?.querySelectorAll('.task-card');
            taskCards?.forEach(cardElement => {
                const card = cardElement as HTMLElement; // Convertir a HTMLElement
                const taskId = card.dataset.taskId; 
                const task = this.tasks.find(t => t.id === taskId);
                if (task) {
                    card.addEventListener('dragstart', () => this.handleDragStart(task));
                    card.addEventListener('dragend', () => this.handleDragEnd());
                }

                const deleteButton = card.querySelector('.delete-btn');
                if (deleteButton && taskId) {
                    // También convertir el botón si necesitas acceder a propiedades específicas de HTMLElement
                    (deleteButton as HTMLElement).addEventListener('click', () => this.deleteTask(taskId));
                }
            });
        }, 0); // Usar setTimeout con 0 para ejecutar después de que el render se complete
    }

    private handleDragOver(event: DragEvent) {
        event.preventDefault();
        const column = event.currentTarget as HTMLElement;
        column.classList.add('drag-over');
    }

    private handleDrop(event: DragEvent) {
        event.preventDefault();
        const column = event.currentTarget as HTMLElement;
        column.classList.remove('drag-over');

        if (this.draggedTask) {
            const newStatus = column.dataset.status as 'pending' | 'in-progress' | 'completed';
            this.updateTaskStatus(this.draggedTask.id, newStatus);
        }
    }

    private async updateTaskStatus(taskId: string, newStatus: 'pending' | 'in-progress' | 'completed') {
        try {
            await this.taskService.updateTask(taskId, { status: newStatus });
            await this.loadTasks();
        } catch (error) {
            console.error('Error al actualizar el estado de la tarea:', error);
            this.showError('Error al actualizar el estado de la tarea');
        }
    }

    private async handleSubmit(event: Event) {
        event.preventDefault();
        const form = event.target as HTMLFormElement;
        const titleInput = form.querySelector('#title') as HTMLInputElement;
        const descriptionInput = form.querySelector('#description') as HTMLTextAreaElement;

        if (!titleInput.value.trim() || !descriptionInput.value.trim()) {
            this.showError('Por favor, completa todos los campos');
            return;
        }

        const newTask: Partial<TaskType> = {
            title: titleInput.value.trim(),
            description: descriptionInput.value.trim(),
            status: 'pending',
            completed: false,
            createdAt: new Date()
        };

        try {
            await this.taskService.createTask(newTask);
            titleInput.value = '';
            descriptionInput.value = '';
            await this.loadTasks();
        } catch (error) {
            console.error('Error al crear la tarea:', error);
            this.showError('Error al crear la tarea');
        }
    }

    private showError(message: string) {
        const errorMessage = this.shadowRoot?.querySelector('.error-message') as HTMLElement;
        if (errorMessage) {
            errorMessage.textContent = message;
            errorMessage.style.display = 'block';
            setTimeout(() => {
                errorMessage.style.display = 'none';
            }, 3000);
        }
    }

    private handleDragStart(task: TaskType) {
        this.draggedTask = task;
    }

    private handleDragEnd() {
        this.draggedTask = null;
        const columns = this.shadowRoot?.querySelectorAll('.task-column');
        columns?.forEach(column => column.classList.remove('drag-over'));
    }

    private renderTask(task: TaskType) {
        return `
            <div class="task-card" draggable="true" data-task-id="${task.id}">
                <h3>${task.title}</h3>
                <p>${task.description}</p>
                <div class="task-footer">
                    <span class="task-date">${new Date(task.createdAt).toLocaleDateString()}</span>
                    <button class="delete-btn">Eliminar</button>
                </div>
            </div>
        `;
    }

    private async deleteTask(taskId: string) {
        if (confirm('¿Estás seguro de que deseas eliminar esta tarea?')) {
            try {
                await this.taskService.deleteTask(taskId);
                await this.loadTasks();
            } catch (error) {
                console.error('Error al eliminar la tarea:', error);
                this.showError('Error al eliminar la tarea');
            }
        }

        // Re-adjuntar los listeners de las tarjetas después de renderizar
        this.setupTaskCardEventListeners();
    }

    render() {
        if (!this.shadowRoot) return;

        const pendingTasks = this.tasks.filter(task => task.status === 'pending');
        const inProgressTasks = this.tasks.filter(task => task.status === 'in-progress');
        const completedTasks = this.tasks.filter(task => task.status === 'completed');

        this.shadowRoot.innerHTML = `
            <style>
                .task-manager {
                    padding: 20px;
                    max-width: 1200px;
                    margin: 0 auto;
                }

                .task-form {
                    background: white;
                    padding: 20px;
                    border-radius: 8px;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
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

                input, textarea {
                    width: 100%;
                    padding: 8px;
                    border: 1px solid #ddd;
                    border-radius: 4px;
                    box-sizing: border-box;
                }

                textarea {
                    height: 100px;
                    resize: vertical;
                }

                button {
                    background-color: #4a90e2;
                    color: white;
                    border: none;
                    padding: 10px 20px;
                    border-radius: 4px;
                    cursor: pointer;
                }

                button:hover {
                    background-color: #357abd;
                }

                .task-board {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 20px;
                    margin-top: 20px;
                }

                .task-column {
                    background: #f5f5f5;
                    padding: 15px;
                    border-radius: 8px;
                    min-height: 400px;
                }

                .task-column.drag-over {
                    background: #e3e3e3;
                }

                .column-header {
                    font-size: 1.2em;
                    font-weight: bold;
                    margin-bottom: 15px;
                    padding-bottom: 10px;
                    border-bottom: 2px solid #ddd;
                }

                .task-card {
                    background: white;
                    padding: 15px;
                    border-radius: 4px;
                    margin-bottom: 10px;
                    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
                    cursor: move;
                }

                .task-card:hover {
                    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
                }

                .task-card h3 {
                    margin: 0 0 10px 0;
                    color: #333;
                }

                .task-card p {
                    margin: 0 0 10px 0;
                    color: #666;
                }

                .task-footer {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-top: 10px;
                    font-size: 0.9em;
                }

                .task-date {
                    color: #999;
                }

                .delete-btn {
                    background-color: #dc3545;
                    padding: 5px 10px;
                    font-size: 0.9em;
                }

                .delete-btn:hover {
                    background-color: #c82333;
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

            <div class="task-manager">
                <div class="error-message"></div>
                <form class="task-form">
                    <div class="form-group">
                        <label for="title">Título</label>
                        <input type="text" id="title" required>
                    </div>
                    <div class="form-group">
                        <label for="description">Descripción</label>
                        <textarea id="description" required></textarea>
                    </div>
                    <button type="submit">Agregar Tarea</button>
                </form>

                <div class="task-board">
                    <div class="task-column" data-status="pending">
                        <div class="column-header">Por Hacer</div>
                        ${pendingTasks.map(task => this.renderTask(task)).join('')}
                    </div>
                    <div class="task-column" data-status="in-progress">
                        <div class="column-header">En Progreso</div>
                        ${inProgressTasks.map(task => this.renderTask(task)).join('')}
                    </div>
                    <div class="task-column" data-status="completed">
                        <div class="column-header">Completadas</div>
                        ${completedTasks.map(task => this.renderTask(task)).join('')}
                    </div>
                </div>
            </div>
        `;
    }
} 