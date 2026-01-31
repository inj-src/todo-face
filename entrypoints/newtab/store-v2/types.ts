export interface Todo {
   id: string;
   title: string;
   description?: string;
   completed: boolean;
   dueDate: string;        // ISO format: YYYY-MM-DD
   habitId: string | null;
   isHabit: boolean;
}

export interface Habit {
   id: string;
   title: string;
   description?: string;
   frequency: "daily" | "custom";
   customDays?: number[];  // 0-6 (Sunday-Saturday)
   streak: number;
   lastCompletedDate?: string; // ISO: YYYY-MM-DD
}

export interface StoreState {
   todos: Record<string, Todo[]>;  // Key: YYYY-MM-DD
   habits: Habit[];
   lastHabitInitializedAt: string; // ISO date: YYYY-MM-DD
   tomorrowTodoModalDismissedAt?: string;
   showTomorrowTodoModal: boolean;

   // Computed selectors
   getTodosForColumn: () => Todo[];      // isHabit == false, dueDate >= today, completed == false
   getBacklogItems: () => Todo[];        // dueDate < today, completed == false
   getHabitTodosForColumn: () => Todo[]; // isHabit == true, dueDate >= today
   getCompletedTodos: () => Todo[];      // completed == true

   // Actions - Todos
   createTodo: (data: { title: string; description?: string; dueDate?: string }) => void;
   updateTodo: (id: string, dueDate: string, data: { title: string; description?: string }) => void;
   deleteTodo: (id: string, dueDate: string) => void;
   completeTodo: (id: string, dueDate: string) => void;
   clearBacklog: (id: string, dueDate: string) => void;  // Complete without streak increment

   // Actions - Habits
   createHabit: (data: { title: string; description?: string; frequency: "daily" | "custom"; customDays?: number[] }) => void;
   updateHabit: (id: string, data: { title: string; description?: string; frequency: "daily" | "custom"; customDays?: number[] }) => void;
   deleteHabit: (id: string) => void;

   // Day management
   createTodosFromHabits: () => void;
   initializeDay: () => void;

   // Tomorrow modal
   setTomorrowTodoModalDismissedAt: (date: string) => void;
   setShowTomorrowTodoModal: (show: boolean) => void;
   checkTomorrowModalTrigger: () => void;
}

// Helper to format a date to local YYYY-MM-DD format
export function formatDateToLocal(date: Date): string {
   const year = date.getFullYear();
   const month = String(date.getMonth() + 1).padStart(2, "0");
   const day = String(date.getDate()).padStart(2, "0");
   return `${year}-${month}-${day}`;
}

// Helper to get today's date in local YYYY-MM-DD format
export function getTodayDateString(): string {
   return formatDateToLocal(new Date());
}

// Helper to get yesterday's date in local YYYY-MM-DD format
export function getYesterdayDateString(): string {
   const yesterday = new Date();
   yesterday.setDate(yesterday.getDate() - 1);
   return formatDateToLocal(yesterday);
}

// Helper to get tomorrow's date in local YYYY-MM-DD format
export function getTomorrowDateString(): string {
   const tomorrow = new Date();
   tomorrow.setDate(tomorrow.getDate() + 1);
   return formatDateToLocal(tomorrow);
}

// Helper to check if a habit should appear on a given date
export function shouldHabitAppearOnDate(habit: Habit, date: Date): boolean {
   const dayOfWeek = date.getDay(); // 0-6 (Sunday-Saturday)

   if (habit.frequency === "daily") {
      return true;
   }

   if (habit.frequency === "custom" && habit.customDays) {
      return habit.customDays.includes(dayOfWeek);
   }

   return false;
}