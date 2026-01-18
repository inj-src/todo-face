import { openDB, type IDBPDatabase } from "idb";
import type { TodoFaceDB, Todo, Habit, AppSettings } from "./types";

const DB_NAME = "todo-face-db";
const DB_VERSION = 1;

let dbInstance: IDBPDatabase<TodoFaceDB> | null = null;

// Initialize and get database instance
export async function getDB(): Promise<IDBPDatabase<TodoFaceDB>> {
   if (dbInstance) {
      return dbInstance;
   }

   dbInstance = await openDB<TodoFaceDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
         // Todos store
         if (!db.objectStoreNames.contains("todos")) {
            const todoStore = db.createObjectStore("todos", { keyPath: "id" });
            todoStore.createIndex("by-status", "status");
            todoStore.createIndex("by-originalDate", "originalDate");
         }

         // Habits store
         if (!db.objectStoreNames.contains("habits")) {
            db.createObjectStore("habits", { keyPath: "id" });
         }

         // Settings store
         if (!db.objectStoreNames.contains("settings")) {
            db.createObjectStore("settings");
         }
      },
   });

   return dbInstance;
}

// ============ Todo Operations ============

export async function getAllTodos(): Promise<Todo[]> {
   const db = await getDB();
   return db.getAll("todos");
}

export async function getTodosByStatus(status: Todo["status"]): Promise<Todo[]> {
   const db = await getDB();
   return db.getAllFromIndex("todos", "by-status", status);
}

export async function getTodoById(id: string): Promise<Todo | undefined> {
   const db = await getDB();
   return db.get("todos", id);
}

export async function saveTodo(todo: Todo): Promise<void> {
   const db = await getDB();
   await db.put("todos", todo);
}

export async function saveTodos(todos: Todo[]): Promise<void> {
   const db = await getDB();
   const tx = db.transaction("todos", "readwrite");
   await Promise.all([
      ...todos.map((todo) => tx.store.put(todo)),
      tx.done,
   ]);
}

export async function deleteTodo(id: string): Promise<void> {
   const db = await getDB();
   await db.delete("todos", id);
}

// ============ Habit Operations ============

export async function getAllHabits(): Promise<Habit[]> {
   const db = await getDB();
   return db.getAll("habits");
}

export async function getHabitById(id: string): Promise<Habit | undefined> {
   const db = await getDB();
   return db.get("habits", id);
}

export async function saveHabit(habit: Habit): Promise<void> {
   const db = await getDB();
   await db.put("habits", habit);
}

export async function deleteHabit(id: string): Promise<void> {
   const db = await getDB();
   await db.delete("habits", id);
}

// ============ Settings Operations ============

const SETTINGS_KEY = "app-settings";

export async function getSettings(): Promise<AppSettings | undefined> {
   const db = await getDB();
   return db.get("settings", SETTINGS_KEY);
}

export async function saveSettings(settings: AppSettings): Promise<void> {
   const db = await getDB();
   await db.put("settings", settings, SETTINGS_KEY);
}
