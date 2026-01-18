import { Plus, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TodoItem } from "../types";
import { TodoCard } from "./TodoCard";

export type ColumnType = "backlogs" | "todo" | "habits" | "completed" | "discarded";

interface KanbanColumnProps {
   type: ColumnType;
   title: string;
   items: TodoItem[];
   onAddItem?: () => void;
   onItemClick?: (item: TodoItem) => void;
   onItemMove?: (item: TodoItem, targetColumn: ColumnType) => void;
}

const columnConfig: Record<ColumnType, { dotColor: string; accentClass: string }> = {
   backlogs: {
      dotColor: "bg-blue-400",
      accentClass: "border-t-blue-400",
   },
   todo: {
      dotColor: "bg-yellow-400",
      accentClass: "border-t-yellow-400",
   },
   habits: {
      dotColor: "bg-purple-400",
      accentClass: "border-t-purple-400",
   },
   completed: {
      dotColor: "bg-green-400",
      accentClass: "border-t-green-400",
   },
   discarded: {
      dotColor: "bg-red-400",
      accentClass: "border-t-red-400",
   },
};

export function KanbanColumn({
   type,
   title,
   items,
   onAddItem,
   onItemClick,
}: KanbanColumnProps) {
   const config = columnConfig[type];

   return (
      <div className="flex flex-col h-full min-w-[280px] max-w-[320px] flex-1">
         {/* Column Header */}
         <div
            className="flex items-center justify-between px-3 py-2 border-b border-dashed border-border"
         >
            <div className="flex items-center gap-2">
               <span className={cn("w-2 h-2 rounded-full", config.dotColor)} />
               <span className="text-sm font-medium text-foreground tracking-tight">
                  {title}
               </span>
               <span className="text-xs text-muted-foreground ml-1">
                  {items.length}
               </span>
            </div>
            <button
               onClick={onAddItem}
               className="p-1 hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
               aria-label={`Add item to ${title}`}
            >
               <Plus size={14} />
            </button>
         </div>

         {/* Column Content */}
         <div className="flex-1 overflow-y-auto overflow-x-hidden p-2 space-y-2">
            {items.map((item) => (
               <TodoCard
                  key={item.id}
                  item={item}
                  columnType={type}
                  onClick={() => onItemClick?.(item)}
               />
            ))}

            {/* Empty state */}
            {items.length === 0 && (
               <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                  <span className="text-xs opacity-50">No items</span>
               </div>
            )}
         </div>
      </div>
   );
}
