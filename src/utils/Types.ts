export interface UserType {
    id: string;
    email: string;
    name?: string;
}

export interface TaskType {
    id: string;
    title: string;
    description: string;
    completed: boolean;
    userId: string;
    createdAt: Date;
} 