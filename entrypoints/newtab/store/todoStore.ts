import { create } from "zustand";
import type { Todo, Habit, AppSettings } from "./types";
import { getTodayDateString, isToday, shouldHabitAppearToday } from "./types";
import {
   getAllTodos,
   getAllHabits,
   getSettings,
   saveTodo,
   saveTodos,
   saveHabit,
   saveSettings,
   deleteHabit as deleteHabitFromDB,
   deleteTodo as deleteTodoFromDB,
} from "./db";

interface TodoStore {
   // State
   todos: Todo[];
   habits: Habit[];
   settings: AppSettings | null;
   isLoading: boolean;
   isHydrated: boolean;

   // Modal state
   showTomorrowModal: boolean;

   // Actions - Initialization
   hydrate: () => Promise<void>;

   // Actions - Todos
   createTodo: (data: { title: string; description?: string; dueDate?: string }) => Promise<void>;
   completeTodo: (id: string) => Promise<void>;
   discardTodo: (id: string) => Promise<void>;
   moveToTodo: (id: string) => Promise<void>;
   restoreTodo: (id: string) => Promise<void>;
   deleteTodo: (id: string) => Promise<void>;

   // Actions - Habits
   createHabit: (data: {
      title: string;
      description?: string;
      frequency: "daily" | "custom";
      customDays?: number[];
   }) => Promise<void>;
   deleteHabit: (id: string) => Promise<void>;
   logHabitCompletion: (todoId: string) => Promise<void>;

   // Actions - Day transition
   processNewDay: () => Promise<void>;
   generateTodaysHabitTodos: () => Promise<void>;

   // Actions - Tomorrow modal
   setShowTomorrowModal: (show: boolean) => void;
   dismissTomorrowModal: () => Promise<void>;
   checkTomorrowModalTrigger: () => void;
}

export const useTodoStore = create<TodoStore>()((set, get) => ({
   // Initial state
   todos: [],
   habits: [],
   settings: null,
   isLoading: true,
   isHydrated: false,
   showTomorrowModal: false,

   // Hydrate store from IDB
   hydrate: async () => {
      set({ isLoading: true });

      try {
         const [todos, habits, settings] = await Promise.all([
            getAllTodos(),
            getAllHabits(),
            getSettings(),
         ]);

         const todayDate = getTodayDateString();
         const defaultSettings: AppSettings = {
            lastOpenDate: todayDate,
         };

         set({
            todos,
            habits,
            settings: settings || defaultSettings,
            isLoading: false,
            isHydrated: true,
         });

         // Process day change if needed
         const currentSettings = settings || defaultSettings;
         if (currentSettings.lastOpenDate !== todayDate) {
            await get().processNewDay();
         } else {
            // Still generate habit todos for today if not already done
            await get().generateTodaysHabitTodos();
         }

         // Check if we should show tomorrow modal
         get().checkTomorrowModalTrigger();
      } catch (error) {
         console.error("Failed to hydrate store:", error);
         set({ isLoading: false, isHydrated: true });
      }
   },

   // Create a new todo
   createTodo: async (data) => {
      const now = new Date().toISOString();
      const todayDate = getTodayDateString();

      const newTodo: Todo = {
         id: crypto.randomUUID(),
         title: data.title,
         description: data.description,
         dueDate: data.dueDate,
         status: "todo",
         originalDate: todayDate,
         createdAt: now,
         updatedAt: now,
      };

      await saveTodo(newTodo);
      set((state) => ({ todos: [...state.todos, newTodo] }));
   },

   // Mark todo as completed
   completeTodo: async (id) => {
      const { todos } = get();
      const todo = todos.find((t) => t.id === id);
      if (!todo) return;

      const now = new Date().toISOString();
      const updatedTodo: Todo = {
         ...todo,
         status: "completed",
         completedAt: now,
         updatedAt: now,
      };

      await saveTodo(updatedTodo);
      set((state) => ({
         todos: state.todos.map((t) => (t.id === id ? updatedTodo : t)),
      }));
   },

   // Discard a todo
   discardTodo: async (id) => {
      const { todos } = get();
      const todo = todos.find((t) => t.id === id);
      if (!todo) return;

      const now = new Date().toISOString();
      const updatedTodo: Todo = {
         ...todo,
         status: "discarded",
         updatedAt: now,
      };

      await saveTodo(updatedTodo);
      set((state) => ({
         todos: state.todos.map((t) => (t.id === id ? updatedTodo : t)),
      }));
   },

   // Move backlog item to todo column (updates date to today)
   moveToTodo: async (id) => {
      const { todos } = get();
      const todo = todos.find((t) => t.id === id);
      if (!todo) return;

      const now = new Date().toISOString();
      const todayDate = getTodayDateString();

      const updatedTodo: Todo = {
         ...todo,
         status: "todo",
         originalDate: todayDate, // Update date to today
         updatedAt: now,
      };

      await saveTodo(updatedTodo);
      set((state) => ({
         todos: state.todos.map((t) => (t.id === id ? updatedTodo : t)),
      }));
   },

   // Restore completed/discarded todo back to todo column
   restoreTodo: async (id) => {
      const { todos } = get();
      const todo = todos.find((t) => t.id === id);
      if (!todo) return;

      const now = new Date().toISOString();
      const todayDate = getTodayDateString();

      const updatedTodo: Todo = {
         ...todo,
         status: "todo",
         originalDate: todayDate, // Bring to today
         completedAt: undefined,
         updatedAt: now,
      };

      await saveTodo(updatedTodo);
      set((state) => ({
         todos: state.todos.map((t) => (t.id === id ? updatedTodo : t)),
      }));
   },

   // Delete a todo permanently
   deleteTodo: async (id) => {
      await deleteTodoFromDB(id);
      set((state) => ({
         todos: state.todos.filter((t) => t.id !== id),
      }));
   },

   // Create a new habit
   createHabit: async (data) => {
      const now = new Date().toISOString();

      const newHabit: Habit = {
         id: crypto.randomUUID(),
         title: data.title,
         description: data.description,
         frequency: data.frequency,
         customDays: data.customDays,
         streak: 0,
         createdAt: now,
         updatedAt: now,
      };

      await saveHabit(newHabit);
      set((state) => ({ habits: [...state.habits, newHabit] }));

      // Generate todo for this habit if it should appear today
      if (shouldHabitAppearToday(newHabit)) {
         const todayDate = getTodayDateString();
         const habitTodo: Todo = {
            id: crypto.randomUUID(),
            title: newHabit.title,
            description: newHabit.description,
            status: "todo",
            originalDate: todayDate,
            habitId: newHabit.id,
            createdAt: now,
            updatedAt: now,
         };

         await saveTodo(habitTodo);
         set((state) => ({ todos: [...state.todos, habitTodo] }));
      }
   },

   // Delete a habit
   deleteHabit: async (id) => {
      await deleteHabitFromDB(id);
      set((state) => ({
         habits: state.habits.filter((h) => h.id !== id),
         // Also remove any pending habit todos
         todos: state.todos.filter((t) => t.habitId !== id || t.status === "completed"),
      }));
   },

   // Log habit completion (when completing a habit todo)
   logHabitCompletion: async (todoId) => {
      const { todos, habits } = get();
      const todo = todos.find((t) => t.id === todoId);
      if (!todo || !todo.habitId) return;

      const habit = habits.find((h) => h.id === todo.habitId);
      if (!habit) return;

      const todayDate = getTodayDateString();
      const now = new Date().toISOString();

      // Update habit streak
      const isConsecutive = habit.lastCompletedDate === getYesterday();
      const newStreak = isConsecutive ? habit.streak + 1 : 1;

      const updatedHabit: Habit = {
         ...habit,
         streak: newStreak,
         lastCompletedDate: todayDate,
         updatedAt: now,
      };

      // Update todo as completed
      const updatedTodo: Todo = {
         ...todo,
         status: "completed",
         completedAt: now,
         updatedAt: now,
      };

      await Promise.all([saveHabit(updatedHabit), saveTodo(updatedTodo)]);

      set((state) => ({
         habits: state.habits.map((h) => (h.id === habit.id ? updatedHabit : h)),
         todos: state.todos.map((t) => (t.id === todoId ? updatedTodo : t)),
      }));
   },

   // Process new day - move uncompleted todos to backlog
   processNewDay: async () => {
      const { todos, settings } = get();
      const todayDate = getTodayDateString();

      // Move uncompleted non-habit todos from previous days to backlog
      const todosToUpdate: Todo[] = [];

      const updatedTodos = todos.map((todo) => {
         // Only process todos that are in "todo" status and not from today
         if (todo.status === "todo" && !isToday(todo.originalDate)) {
            const updated: Todo = {
               ...todo,
               status: "backlog",
               updatedAt: new Date().toISOString(),
            };
            todosToUpdate.push(updated);
            return updated;
         }
         return todo;
      });

      if (todosToUpdate.length > 0) {
         await saveTodos(todosToUpdate);
      }

      // Update settings with today's date
      const updatedSettings: AppSettings = {
         ...settings,
         lastOpenDate: todayDate,
      };
      await saveSettings(updatedSettings);

      set({ todos: updatedTodos, settings: updatedSettings });

      // Generate today's habit todos
      await get().generateTodaysHabitTodos();
   },

   // Generate habit todos for today
   generateTodaysHabitTodos: async () => {
      const { todos, habits } = get();
      const todayDate = getTodayDateString();
      const now = new Date().toISOString();

      const newHabitTodos: Todo[] = [];

      for (const habit of habits) {
         // Check if habit should appear today
         if (!shouldHabitAppearToday(habit)) continue;

         // Check if habit todo already exists for today
         const existingHabitTodo = todos.find(
            (t) => t.habitId === habit.id && t.originalDate === todayDate
         );
         if (existingHabitTodo) continue;

         // Create new habit todo for today
         const habitTodo: Todo = {
            id: crypto.randomUUID(),
            title: habit.title,
            description: habit.description,
            status: "todo",
            originalDate: todayDate,
            habitId: habit.id,
            createdAt: now,
            updatedAt: now,
         };

         newHabitTodos.push(habitTodo);
      }

      if (newHabitTodos.length > 0) {
         await saveTodos(newHabitTodos);
         set((state) => ({ todos: [...state.todos, ...newHabitTodos] }));
      }
   },

   // Tomorrow modal
   setShowTomorrowModal: (show) => {
      set({ showTomorrowModal: show });
   },

   dismissTomorrowModal: async () => {
      const { settings } = get();
      const now = new Date().toISOString();

      const updatedSettings: AppSettings = {
         ...settings!,
         tomorrowModalDismissedAt: now,
         tomorrowModalLastShown: now,
      };

      await saveSettings(updatedSettings);
      set({ showTomorrowModal: false, settings: updatedSettings });
   },

   checkTomorrowModalTrigger: () => {
      const now = new Date();
      const hour = now.getHours();

      // Only trigger at 9 PM (21:00) or later
      if (hour < 21) return;

      const { settings } = get();
      if (!settings) return;

      const { tomorrowModalLastShown } = settings;

      // If never shown or last shown more than 30 minutes ago
      if (!tomorrowModalLastShown) {
         set({ showTomorrowModal: true });
         return;
      }

      const lastShown = new Date(tomorrowModalLastShown);
      const diffMinutes = (now.getTime() - lastShown.getTime()) / (1000 * 60);

      if (diffMinutes >= 30) {
         set({ showTomorrowModal: true });
      }
   },
}));

// Helper function
function getYesterday(): string {
   const yesterday = new Date();
   yesterday.setDate(yesterday.getDate() - 1);
   return yesterday.toISOString().split("T")[0];
}
