import { KanbanColumn, type ColumnType } from "./KanbanColumn";
import type { Todo } from "../store/types";

// Board data structure
interface KanbanBoardData {
   backlogs: TodoWithStreak[];
   todo: TodoWithStreak[];
   habits: TodoWithStreak[];
   completed: TodoWithStreak[];
   discarded: TodoWithStreak[];
}

interface TodoWithStreak extends Todo {
   streak?: number;
}

interface KanbanBoardProps {
   board: KanbanBoardData;
   onAddItem?: (columnType: ColumnType) => void;
   onItemClick?: (item: TodoWithStreak) => void;
}

const columns: { type: ColumnType; title: string }[] = [
   { type: "backlogs", title: "Backlogs" },
   { type: "todo", title: "To Do" },
   { type: "habits", title: "Habits" },
   { type: "completed", title: "Completed" },
   { type: "discarded", title: "Discarded" },
];

export function KanbanBoard({ board, onAddItem, onItemClick }: KanbanBoardProps) {
   return (
      <div className="flex h-full bg-background overflow-x-auto">
         {/* Left spacer - same bg as board */}
         <div className="flex-1 min-w-0" />

         {/* Columns container */}
         <div className="flex">
            {columns.map((column) => (
               <div
                  key={column.type}
                  className="bg-background flex-1 min-w-[260px] max-w-[320px] border-r first:border-l border-border"
               >
                  <KanbanColumn
                     type={column.type}
                     title={column.title}
                     items={board[column.type]}
                     onAddItem={() => onAddItem?.(column.type)}
                     onItemClick={onItemClick}
                  />
               </div>
            ))}
         </div>

         {/* Right spacer - same bg as board */}
         <div className="flex-1 min-w-0" />
      </div>
   );
}
