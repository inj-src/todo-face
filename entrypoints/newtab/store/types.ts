import type { DBSchema } from "idb";

// Base todo status
export type TodoStatus = "todo" | "completed" | "discarded" | "backlog";

// Frequency type for habits
export type HabitFrequency = "daily" | "custom";

// Core Todo type
export interface Todo {
   id: string;
   title: string;
   description?: string;
   priority?: "high" | "medium" | "low";
   tags?: string[];
   dueDate?: string; // ISO string
   status: TodoStatus;
   originalDate: string; // ISO string - the date this todo was created for
   completedAt?: string; // ISO string - when completed
   createdAt: string; // ISO string
   updatedAt: string; // ISO string
   // For habit-generated todos
   habitId?: string;
}

// Habit definition (template for generating daily todos)
export interface Habit {
   id: string;
   title: string;
   description?: string;
   frequency: HabitFrequency;
   customDays?: number[]; // 0-6 (Sunday-Saturday) for custom frequency
   streak: number;
   lastCompletedDate?: string; // YYYY-MM-DD format
   createdAt: string;
   updatedAt: string;
}

// App settings
export interface AppSettings {
   lastOpenDate: string; // YYYY-MM-DD - to detect day change
   tomorrowModalDismissedAt?: string; // ISO string - when 9PM modal was dismissed
   tomorrowModalLastShown?: string; // ISO string - for 30-min interval
}

// IDB Schema
export interface TodoFaceDB extends DBSchema {
   todos: {
      key: string;
      value: Todo;
      indexes: {
         "by-status": TodoStatus;
         "by-originalDate": string;
      };
   };
   habits: {
      key: string;
      value: Habit;
   };
   settings: {
      key: string;
      value: AppSettings;
   };
}

// Helper to get today's date in YYYY-MM-DD format
export function getTodayDateString(): string {
   const today = new Date();
   return today.toISOString().split("T")[0];
}

// Helper to check if a date string is today
export function isToday(dateString: string): boolean {
   return dateString.split("T")[0] === getTodayDateString();
}

// Helper to check if a habit should appear today
export function shouldHabitAppearToday(habit: Habit): boolean {
   const today = new Date();
   const dayOfWeek = today.getDay(); // 0-6

   if (habit.frequency === "daily") {
      return true;
   }

   if (habit.frequency === "custom" && habit.customDays) {
      return habit.customDays.includes(dayOfWeek);
   }

   return false;
}
