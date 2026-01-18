export interface TodoItem {
   id: string;
   title: string;
   description?: string;
   priority?: "high" | "medium" | "low";
   tags?: string[];
   dueDate?: string;
   streak?: number;
   createdAt: string;
   updatedAt: string;
}

export interface KanbanBoard {
   backlogs: TodoItem[];
   todo: TodoItem[];
   habits: TodoItem[];
   completed: TodoItem[];
   discarded: TodoItem[];
}
