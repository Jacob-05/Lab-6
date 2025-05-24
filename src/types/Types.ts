export interface TaskType {
    id: string;
    title: string;
    description: string;
    status: 'pending' | 'in-progress' | 'completed';
    completed: boolean;
    createdAt: Date;
    userId: string;
} 