import { KanbanColumn, type ColumnType } from "./KanbanColumn";
import { CalendarColumn } from "./CalendarColumn";
import type { Todo, Habit } from "../store-v2/types";

// Board data structure
interface KanbanBoardData {
   backlogs: Todo[];
   todo: Todo[];
   habits: Todo[];
   completed: Todo[];
}

interface KanbanBoardProps {
   board: KanbanBoardData;
   habits?: Habit[];
   onAddItem?: (columnType: ColumnType) => void;
   onItemClick?: (item: Todo) => void;
}

// Only show backlogs, todo, habits columns (completed shown in calendar)
const columns: { type: ColumnType; title: string }[] = [
   { type: "backlogs", title: "Backlogs" },
   { type: "todo", title: "To Do" },
   { type: "habits", title: "Habits" },
];

export function KanbanBoard({ board, habits = [], onAddItem, onItemClick }: KanbanBoardProps) {
   return (
      <div className="flex h-full bg-background overflow-x-auto">
         {/* Left spacer - same bg as board */}
         <div className="flex-1 min-w-0" />

         {/* Columns container */}
         <div className="flex">
            {columns.map((column) => (
               <div
                  key={column.type}
                  className="bg-background flex-1 w-[280px] border-r first:border-l border-border"
               >
                  <KanbanColumn
                     type={column.type}
                     title={column.title}
                     items={board[column.type]}
                     habits={column.type === "habits" ? habits : undefined}
                     onAddItem={() => onAddItem?.(column.type)}
                     onItemClick={onItemClick}
                  />
               </div>
            ))}

            {/* Calendar Column - shows completed todos */}
            <div className="bg-background w-[520px] shrink-0 border-r border-border">
               <CalendarColumn
                  completed={board.completed}
                  backlogs={board.backlogs}
                  pending={board.todo}
                  habits={board.habits}
               />
            </div>
         </div>

         {/* Right spacer - same bg as board */}
         <div className="flex-1 min-w-0" />
      </div>
   );
}
