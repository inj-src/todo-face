import { useEffect, useMemo, useState } from "react";
import { Header } from "./components/Header";
import { KanbanBoard } from "./components/KanbanBoard";
import { CreateTodoModal } from "./components/CreateTodoModal";
import { CreateHabitModal } from "./components/CreateHabitModal";
import { useTodoStore } from "./store/todoStore";
import type { Todo, Habit } from "./store/types";
import type { ColumnType } from "./components/KanbanColumn";

// Derive kanban board structure from store state
interface KanbanBoardData {
   backlogs: TodoWithStreak[];
   todo: TodoWithStreak[];
   habits: TodoWithStreak[];
   completed: TodoWithStreak[];
   discarded: TodoWithStreak[];
}

// Extended todo type that includes streak for habits display
interface TodoWithStreak extends Todo {
   streak?: number;
}

function deriveBoard(todos: Todo[], habits: Habit[]): KanbanBoardData {
   const todayDate = new Date().toISOString().split("T")[0];

   // Create a map of habit streaks
   const habitStreakMap = new Map(habits.map((h) => [h.id, h.streak]));

   // Separate todos by status
   const backlogs: TodoWithStreak[] = [];
   const todoItems: TodoWithStreak[] = [];
   const habitTodos: TodoWithStreak[] = [];
   const completed: TodoWithStreak[] = [];
   const discarded: TodoWithStreak[] = [];

   for (const todo of todos) {
      const todoWithStreak: TodoWithStreak = { ...todo };

      // Add streak info for habit todos
      if (todo.habitId) {
         todoWithStreak.streak = habitStreakMap.get(todo.habitId) || 0;
      }

      switch (todo.status) {
         case "backlog":
            backlogs.push(todoWithStreak);
            break;
         case "todo":
            // Habit todos go to habits column, regular todos go to todo column
            if (todo.habitId && todo.originalDate === todayDate) {
               habitTodos.push(todoWithStreak);
            } else {
               todoItems.push(todoWithStreak);
            }
            break;
         case "completed":
            // Completed habit todos go to habits column (for today), others to completed
            if (todo.habitId && todo.originalDate === todayDate) {
               habitTodos.push(todoWithStreak);
            } else {
               completed.push(todoWithStreak);
            }
            break;
         case "discarded":
            discarded.push(todoWithStreak);
            break;
      }
   }

   return {
      backlogs,
      todo: todoItems,
      habits: habitTodos,
      completed,
      discarded,
   };
}

export default function App() {
   const {
      todos,
      habits,
      isLoading,
      isHydrated,
      showTomorrowModal,
      setShowTomorrowModal,
      dismissTomorrowModal,
      hydrate,
      createTodo,
      createHabit,
   } = useTodoStore();

   const [searchQuery, setSearchQuery] = useState("");
   const [isTodoModalOpen, setIsTodoModalOpen] = useState(false);
   const [isHabitModalOpen, setIsHabitModalOpen] = useState(false);

   // Hydrate store on mount
   useEffect(() => {
      if (!isHydrated) {
         hydrate();
      }
   }, [isHydrated, hydrate]);

   // Check tomorrow modal trigger periodically
   useEffect(() => {
      const checkInterval = setInterval(() => {
         useTodoStore.getState().checkTomorrowModalTrigger();
      }, 60000); // Check every minute

      return () => clearInterval(checkInterval);
   }, []);

   // Derive board from store state
   const board = useMemo(() => deriveBoard(todos, habits), [todos, habits]);

   function handleSearch(query: string) {
      setSearchQuery(query);
   }

   function handleAddItem(columnType: ColumnType) {
      if (columnType === "todo") {
         setIsTodoModalOpen(true);
      } else if (columnType === "habits") {
         setIsHabitModalOpen(true);
      }
   }

   async function handleCreateTodo(todoData: {
      title: string;
      description?: string;
      dueDate?: string;
   }) {
      await createTodo(todoData);
   }

   async function handleCreateHabit(habitData: {
      title: string;
      description?: string;
      frequency: "daily" | "custom";
      customDays?: number[];
   }) {
      await createHabit({
         title: habitData.title,
         description: habitData.description,
         frequency: habitData.frequency,
         customDays: habitData.customDays,
      });
   }

   function handleItemClick(item: TodoWithStreak) {
      console.log("Clicked item:", item);
   }

   // Filter board based on search query
   const filteredBoard: KanbanBoardData = searchQuery
      ? {
         backlogs: board.backlogs.filter(
            (item) =>
               item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
               item.description?.toLowerCase().includes(searchQuery.toLowerCase())
         ),
         todo: board.todo.filter(
            (item) =>
               item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
               item.description?.toLowerCase().includes(searchQuery.toLowerCase())
         ),
         habits: board.habits.filter(
            (item) =>
               item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
               item.description?.toLowerCase().includes(searchQuery.toLowerCase())
         ),
         completed: board.completed.filter(
            (item) =>
               item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
               item.description?.toLowerCase().includes(searchQuery.toLowerCase())
         ),
         discarded: board.discarded.filter(
            (item) =>
               item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
               item.description?.toLowerCase().includes(searchQuery.toLowerCase())
         ),
      }
      : board;

   // Show loading state
   if (isLoading) {
      return (
         <div className="h-screen flex items-center justify-center bg-background dark">
            <div className="text-muted-foreground">Loading...</div>
         </div>
      );
   }

   return (
      <div className="h-screen flex flex-col bg-background dark">
         <Header
            onSearch={handleSearch}
            onAddTask={() => handleAddItem("todo")}
         />
         <main className="flex-1 overflow-hidden">
            <KanbanBoard
               board={filteredBoard}
               onAddItem={handleAddItem}
               onItemClick={handleItemClick}
            />
         </main>

         {/* Todo Creation Modal */}
         <CreateTodoModal
            open={isTodoModalOpen}
            onOpenChange={setIsTodoModalOpen}
            onSubmit={handleCreateTodo}
         />

         {/* Habit Creation Modal */}
         <CreateHabitModal
            open={isHabitModalOpen}
            onOpenChange={setIsHabitModalOpen}
            onSubmit={handleCreateHabit}
         />

         {/* Tomorrow Planning Modal (9 PM) - Uses CreateTodoModal with tomorrowMode */}
         <CreateTodoModal
            open={showTomorrowModal}
            onOpenChange={setShowTomorrowModal}
            onSubmit={handleCreateTodo}
            tomorrowMode
            onDismiss={dismissTomorrowModal}
         />
      </div>
   );
}