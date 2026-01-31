import { useEffect, useState } from "react";
import { Header } from "./components/Header";
import { KanbanBoard } from "./components/KanbanBoard";
import { CreateTodoModal } from "./components/CreateTodoModal";
import { CreateHabitModal } from "./components/CreateHabitModal";
import { useTodoStore } from "./store-v2/store";
import { useMidnightRefresh } from "./hooks/useMidnightRefresh";
import type { Todo, Habit } from "./store-v2/types";
import type { ColumnType } from "./components/KanbanColumn";

// Board data structure for the KanbanBoard component
interface KanbanBoardData {
   backlogs: Todo[];
   todo: Todo[];
   habits: Todo[];
   completed: Todo[];
}

export default function App() {
   const {
      habits,
      getTodosForColumn,
      getBacklogItems,
      getHabitTodosForColumn,
      getCompletedTodos,
      showTomorrowTodoModal,
      setShowTomorrowTodoModal,
      setTomorrowTodoModalDismissedAt,
      createTodo,
      createHabit,
      checkTomorrowModalTrigger,
   } = useTodoStore();

   const [searchQuery, setSearchQuery] = useState("");
   const [isTodoModalOpen, setIsTodoModalOpen] = useState(false);
   const [isHabitModalOpen, setIsHabitModalOpen] = useState(false);

   // Initialize midnight refresh hook
   useMidnightRefresh();

   // Check tomorrow modal trigger periodically
   useEffect(() => {
      // Initial check
      checkTomorrowModalTrigger();

      const checkInterval = setInterval(() => {
         checkTomorrowModalTrigger();
      }, 60000); // Check every minute

      return () => clearInterval(checkInterval);
   }, [checkTomorrowModalTrigger]);

   // Derive board from store selectors
   const board: KanbanBoardData = {
      backlogs: getBacklogItems(),
      todo: getTodosForColumn(),
      habits: getHabitTodosForColumn(),
      completed: getCompletedTodos(),
   };

   // Filter board based on search query
   function filterItems(items: Todo[]): Todo[] {
      if (!searchQuery) return items;
      const query = searchQuery.toLowerCase();
      return items.filter(
         (item) =>
            item.title.toLowerCase().includes(query) ||
            item.description?.toLowerCase().includes(query)
      );
   }

   const filteredBoard: KanbanBoardData = {
      backlogs: filterItems(board.backlogs),
      todo: filterItems(board.todo),
      habits: filterItems(board.habits),
      completed: filterItems(board.completed),
   };

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

   function handleCreateTodo(todoData: {
      title: string;
      description?: string;
      dueDate?: string;
   }) {
      createTodo(todoData);
   }

   function handleCreateHabit(habitData: {
      title: string;
      description?: string;
      frequency: "daily" | "custom";
      customDays?: number[];
   }) {
      createHabit(habitData);
   }

   function handleItemClick(item: Todo) {
      console.log("Clicked item:", item);
   }

   function handleDismissTomorrowModal() {
      setTomorrowTodoModalDismissedAt(new Date().toISOString());
      setShowTomorrowTodoModal(false);
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
               habits={habits}
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

         {/* Tomorrow Planning Modal (9 PM) */}
         <CreateTodoModal
            open={showTomorrowTodoModal}
            onOpenChange={setShowTomorrowTodoModal}
            onSubmit={handleCreateTodo}
            tomorrowMode
            onDismiss={handleDismissTomorrowModal}
         />
      </div>
   );
}