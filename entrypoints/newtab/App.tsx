import { useState } from "react";
import { Header } from "./components/Header";
import { KanbanBoard } from "./components/KanbanBoard";
import type { KanbanBoard as KanbanBoardType, TodoItem } from "./types";
import type { ColumnType } from "./components/KanbanColumn";

// Sample data to demonstrate the UI
const initialBoard: KanbanBoardType = {
   backlogs: [
      {
         id: "1",
         title: "Research new task management patterns",
         description: "Look into different approaches for organizing tasks in productivity apps",
         priority: "low",
         tags: ["research"],
         createdAt: new Date().toISOString(),
         updatedAt: new Date().toISOString(),
      },
      {
         id: "2",
         title: "Design system documentation",
         description: "Document all design tokens and component usage guidelines",
         priority: "medium",
         tags: ["docs", "design"],
         createdAt: new Date().toISOString(),
         updatedAt: new Date().toISOString(),
      },
   ],
   todo: [
      {
         id: "3",
         title: "Implement drag and drop",
         description: "Add drag and drop functionality for moving tasks between columns",
         priority: "high",
         tags: ["feature"],
         dueDate: "Jan 20",
         createdAt: new Date().toISOString(),
         updatedAt: new Date().toISOString(),
      },
      {
         id: "4",
         title: "Add keyboard shortcuts",
         description: "Implement keyboard navigation and shortcuts for power users",
         priority: "medium",
         tags: ["ux"],
         createdAt: new Date().toISOString(),
         updatedAt: new Date().toISOString(),
      },
   ],
   habits: [
      {
         id: "5",
         title: "Morning meditation",
         description: "10 minutes of mindfulness every morning",
         streak: 15,
         tags: ["wellness"],
         createdAt: new Date().toISOString(),
         updatedAt: new Date().toISOString(),
      },
      {
         id: "6",
         title: "Daily code review",
         description: "Review at least one PR every day",
         streak: 7,
         tags: ["dev"],
         createdAt: new Date().toISOString(),
         updatedAt: new Date().toISOString(),
      },
      {
         id: "7",
         title: "Read for 30 minutes",
         streak: 23,
         tags: ["learning"],
         createdAt: new Date().toISOString(),
         updatedAt: new Date().toISOString(),
      },
   ],
   completed: [
      {
         id: "8",
         title: "Set up project structure",
         description: "Initialize WXT extension with React and Tailwind",
         tags: ["setup"],
         createdAt: new Date().toISOString(),
         updatedAt: new Date().toISOString(),
      },
      {
         id: "9",
         title: "Configure theme system",
         description: "Set up CSS variables and design tokens for the brutalist theme",
         tags: ["design"],
         createdAt: new Date().toISOString(),
         updatedAt: new Date().toISOString(),
      },
   ],
   discarded: [
      {
         id: "10",
         title: "Complex animation system",
         description: "Over-engineered animation system that was not needed",
         tags: ["deprecated"],
         createdAt: new Date().toISOString(),
         updatedAt: new Date().toISOString(),
      },
   ],
};

export default function App() {
   const [board, setBoard] = useState<KanbanBoardType>(initialBoard);
   const [searchQuery, setSearchQuery] = useState("");

   const handleSearch = (query: string) => {
      setSearchQuery(query);
   };

   const handleAddItem = (columnType: ColumnType) => {
      // TODO: Implement add item modal/form
      console.log("Add item to:", columnType);
   };

   const handleItemClick = (item: TodoItem) => {
      // TODO: Implement item detail view
      console.log("Clicked item:", item);
   };

   // Filter board based on search query
   const filteredBoard: KanbanBoardType = searchQuery
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
      </div>
   );
}