import { KanbanColumn, type ColumnType } from "./KanbanColumn";
import type { KanbanBoard as KanbanBoardType, TodoItem } from "../types";

interface KanbanBoardProps {
   board: KanbanBoardType;
   onAddItem?: (columnType: ColumnType) => void;
   onItemClick?: (item: TodoItem) => void;
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
      <div className="flex gap-px h-full bg-border overflow-x-auto">
         {columns.map((column) => (
            <div
               key={column.type}
               className="bg-background flex-1 min-w-[280px]"
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
   );
}
