import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { StoreState, Todo, Habit } from "./types";
import { getTodayDateString, getYesterdayDateString, getTomorrowDateString, shouldHabitAppearOnDate } from "./types";

export const useTodoStore = create<StoreState>()(
   persist(
      (set, get) => ({
         todos: {},
         habits: [],
         lastHabitInitializedAt: "",
         tomorrowTodoModalDismissedAt: undefined,
         showTomorrowTodoModal: false,

         // =====================
         // COMPUTED SELECTORS
         // =====================

         // Get todos for the Todo column: isHabit == false, dueDate >= today (includes completed)
         getTodosForColumn: () => {
            const { todos } = get();
            const today = getTodayDateString();
            const result: Todo[] = [];

            Object.entries(todos).forEach(([dateKey, todoList]) => {
               if (dateKey >= today) {
                  todoList.forEach((todo) => {
                     if (!todo.isHabit) {
                        result.push(todo);
                     }
                  });
               }
            });

            return result;
         },

         // Get backlog items: dueDate < today, completed == false
         getBacklogItems: () => {
            const { todos } = get();
            const today = getTodayDateString();
            const result: Todo[] = [];

            Object.entries(todos).forEach(([dateKey, todoList]) => {
               if (dateKey < today) {
                  todoList.forEach((todo) => {
                     if (!todo.completed) {
                        result.push(todo);
                     }
                  });
               }
            });

            return result;
         },

         // Get habit todos for Habits column: isHabit == true, dueDate >= today (includes completed)
         getHabitTodosForColumn: () => {
            const { todos } = get();
            const today = getTodayDateString();
            const result: Todo[] = [];

            Object.entries(todos).forEach(([dateKey, todoList]) => {
               if (dateKey >= today) {
                  todoList.forEach((todo) => {
                     if (todo.isHabit) {
                        result.push(todo);
                     }
                  });
               }
            });

            // Sort: pending first, completed at bottom
            result.sort((a, b) => {
               const aCompleted = a.completed ? 1 : 0;
               const bCompleted = b.completed ? 1 : 0;
               return aCompleted - bCompleted;
            });

            return result;
         },

         // Get completed todos: completed == true
         getCompletedTodos: () => {
            const { todos } = get();
            const result: Todo[] = [];

            Object.values(todos).forEach((todoList) => {
               todoList.forEach((todo) => {
                  if (todo.completed) {
                     result.push(todo);
                  }
               });
            });

            return result;
         },

         // =====================
         // TODO ACTIONS
         // =====================

         createTodo: (data) => {
            const today = getTodayDateString();
            const dueDate = data.dueDate || today;

            const newTodo: Todo = {
               id: crypto.randomUUID(),
               title: data.title,
               description: data.description,
               completed: false,
               dueDate,
               habitId: null,
               isHabit: false,
            };

            set((state) => {
               const todosForDate = state.todos[dueDate] || [];
               return {
                  todos: {
                     ...state.todos,
                     [dueDate]: [...todosForDate, newTodo],
                  },
               };
            });
         },

         updateTodo: (id, dueDate, data) => {
            set((state) => {
               const todosForDate = state.todos[dueDate] || [];
               const updatedTodos = todosForDate.map((todo) =>
                  todo.id === id
                     ? { ...todo, title: data.title, description: data.description }
                     : todo
               );
               return {
                  todos: { ...state.todos, [dueDate]: updatedTodos },
               };
            });
         },

         deleteTodo: (id, dueDate) => {
            set((state) => {
               const todosForDate = state.todos[dueDate] || [];
               const updatedTodos = todosForDate.filter((todo) => todo.id !== id);
               return {
                  todos: { ...state.todos, [dueDate]: updatedTodos },
               };
            });
         },

         completeTodo: (id, dueDate) => {
            const { todos, habits } = get();
            const todosForDate = todos[dueDate] || [];
            const todo = todosForDate.find((t) => t.id === id);

            if (!todo) return;

            // If it's a habit todo, update the habit streak
            if (todo.isHabit && todo.habitId) {
               const habit = habits.find((h) => h.id === todo.habitId);
               if (habit) {
                  const today = getTodayDateString();
                  const yesterday = getYesterdayDateString();

                  // Calculate new streak
                  const isConsecutive = habit.lastCompletedDate === yesterday;
                  const newStreak = isConsecutive ? habit.streak + 1 : 1;

                  set((state) => ({
                     habits: state.habits.map((h) =>
                        h.id === habit.id
                           ? { ...h, streak: newStreak, lastCompletedDate: today }
                           : h
                     ),
                     todos: {
                        ...state.todos,
                        [dueDate]: state.todos[dueDate].map((t) =>
                           t.id === id ? { ...t, completed: true } : t
                        ),
                     },
                  }));
                  return;
               }
            }

            // Regular todo completion
            set((state) => ({
               todos: {
                  ...state.todos,
                  [dueDate]: state.todos[dueDate].map((t) =>
                     t.id === id ? { ...t, completed: true } : t
                  ),
               },
            }));
         },

         // Clear backlog: mark as completed WITHOUT incrementing habit streak
         clearBacklog: (id, dueDate) => {
            set((state) => ({
               todos: {
                  ...state.todos,
                  [dueDate]: (state.todos[dueDate] || []).map((t) =>
                     t.id === id ? { ...t, completed: true } : t
                  ),
               },
            }));
         },

         // =====================
         // HABIT ACTIONS
         // =====================

         createHabit: (data) => {
            const newHabit: Habit = {
               id: crypto.randomUUID(),
               title: data.title,
               description: data.description,
               frequency: data.frequency,
               customDays: data.customDays,
               streak: 0,
               lastCompletedDate: undefined,
            };

            set((state) => ({ habits: [...state.habits, newHabit] }));

            // Generate today's habit todo if applicable
            const today = new Date();
            if (shouldHabitAppearOnDate(newHabit, today)) {
               const todayString = getTodayDateString();
               const habitTodo: Todo = {
                  id: crypto.randomUUID(),
                  title: newHabit.title,
                  description: newHabit.description,
                  completed: false,
                  dueDate: todayString,
                  habitId: newHabit.id,
                  isHabit: true,
               };

               set((state) => ({
                  todos: {
                     ...state.todos,
                     [todayString]: [...(state.todos[todayString] || []), habitTodo],
                  },
               }));
            }
         },

         updateHabit: (id, data) => {
            const today = getTodayDateString();

            set((state) => {
               // Update the habit
               const updatedHabits = state.habits.map((h) =>
                  h.id === id
                     ? { ...h, title: data.title, description: data.description, frequency: data.frequency, customDays: data.customDays }
                     : h
               );

               // Also update any pending habit todos for current and future dates
               const updatedTodos: Record<string, Todo[]> = {};
               Object.entries(state.todos).forEach(([dateKey, todoList]) => {
                  if (dateKey >= today) {
                     // Update pending habit todos for today and future
                     updatedTodos[dateKey] = todoList.map((t) =>
                        t.habitId === id && !t.completed
                           ? { ...t, title: data.title, description: data.description }
                           : t
                     );
                  } else {
                     // Keep backlog todos unchanged
                     updatedTodos[dateKey] = todoList;
                  }
               });

               return {
                  habits: updatedHabits,
                  todos: updatedTodos,
               };
            });
         },

         deleteHabit: (id) => {
            const today = getTodayDateString();

            set((state) => {
               // Remove the habit
               const filteredHabits = state.habits.filter((h) => h.id !== id);

               // Remove habit todos:
               // - For current and future dates (>= today): remove all (including completed)
               // - For past dates (< today): keep completed habit todos (backlog history)
               const updatedTodos: Record<string, Todo[]> = {};
               Object.entries(state.todos).forEach(([dateKey, todoList]) => {
                  if (dateKey >= today) {
                     // Current/future: remove all todos for this habit
                     updatedTodos[dateKey] = todoList.filter((t) => t.habitId !== id);
                  } else {
                     // Backlog: keep completed habit todos for history
                     updatedTodos[dateKey] = todoList.filter(
                        (t) => !(t.habitId === id && !t.completed)
                     );
                  }
               });

               return { habits: filteredHabits, todos: updatedTodos };
            });
         },

         // =====================
         // DAY MANAGEMENT
         // =====================

         createTodosFromHabits: () => {
            const { habits, lastHabitInitializedAt, todos } = get();
            const today = new Date();
            const todayString = getTodayDateString();

            // If already initialized today, skip
            if (lastHabitInitializedAt === todayString) return;

            // Calculate days since last initialization
            let startDate: Date;
            if (lastHabitInitializedAt) {
               startDate = new Date(lastHabitInitializedAt);
               startDate.setDate(startDate.getDate() + 1); // Start from day after last init
            } else {
               startDate = today;
            }

            const newTodos: Record<string, Todo[]> = { ...todos };

            // Generate habit todos for each day from startDate to today
            const currentDate = new Date(startDate);
            while (currentDate <= today) {
               const dateString = currentDate.toISOString().split("T")[0];

               habits.forEach((habit) => {
                  if (shouldHabitAppearOnDate(habit, currentDate)) {
                     // Check if habit todo already exists for this date
                     const existingTodos = newTodos[dateString] || [];
                     const alreadyExists = existingTodos.some(
                        (t) => t.habitId === habit.id
                     );

                     if (!alreadyExists) {
                        const habitTodo: Todo = {
                           id: crypto.randomUUID(),
                           title: habit.title,
                           description: habit.description,
                           completed: false,
                           dueDate: dateString,
                           habitId: habit.id,
                           isHabit: true,
                        };

                        newTodos[dateString] = [...existingTodos, habitTodo];
                     }
                  }
               });

               currentDate.setDate(currentDate.getDate() + 1);
            }

            set({ todos: newTodos, lastHabitInitializedAt: todayString });
         },

         initializeDay: () => {
            const { habits } = get();
            const today = getTodayDateString();
            const yesterday = getYesterdayDateString();

            // Reset streaks for habits not completed yesterday
            set((state) => ({
               habits: state.habits.map((habit) => {
                  if (habit.lastCompletedDate !== yesterday && habit.lastCompletedDate !== today) {
                     return { ...habit, streak: 0 };
                  }
                  return habit;
               }),
            }));

            // Generate habit todos for today
            get().createTodosFromHabits();
         },

         // =====================
         // TOMORROW MODAL
         // =====================

         setTomorrowTodoModalDismissedAt: (date) => {
            set({ tomorrowTodoModalDismissedAt: date });
         },

         setShowTomorrowTodoModal: (show) => {
            set({ showTomorrowTodoModal: show });
         },

         checkTomorrowModalTrigger: () => {
            const now = new Date();
            const hour = now.getHours();

            // Only trigger at 9 PM (21:00) or later
            if (hour < 21) return;

            const { tomorrowTodoModalDismissedAt } = get();

            // If never dismissed or dismissed more than 30 minutes ago
            if (!tomorrowTodoModalDismissedAt) {
               set({ showTomorrowTodoModal: true });
               return;
            }

            const lastDismissed = new Date(tomorrowTodoModalDismissedAt);
            const diffMinutes = (now.getTime() - lastDismissed.getTime()) / (1000 * 60);

            if (diffMinutes >= 30) {
               set({ showTomorrowTodoModal: true });
            }
         },
      }),
      { name: "todo-face-v2" }
   )
);

// Helper function to get habit streak for display
export function getHabitStreak(habitId: string | null): number {
   if (!habitId) return 0;
   const state = useTodoStore.getState();
   const habit = state.habits.find((h) => h.id === habitId);
   return habit?.streak || 0;
}