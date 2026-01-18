import { MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TodoItem } from "../types";
import type { ColumnType } from "./KanbanColumn";

interface TodoCardProps {
   item: TodoItem;
   columnType: ColumnType;
   onClick?: () => void;
}

export function TodoCard({ item, columnType, onClick }: TodoCardProps) {
   // Show date on all columns except "todo" and "habits"
   const showDate = columnType !== "todo" && columnType !== "habits";

   return (
      <div
         onClick={onClick}
         className={cn(
            "group relative bg-card border border-border p-3 cursor-pointer",
            "hover:bg-accent/50 transition-colors duration-150"
         )}
      >
         {/* Card Header */}
         <div className="flex items-start justify-between gap-2">
            <h3 className="text-sm font-medium text-foreground leading-snug flex-1">
               {item.title}
            </h3>
            <button
               onClick={(e) => {
                  e.stopPropagation();
                  // Menu logic here
               }}
               className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-secondary transition-opacity text-muted-foreground"
               aria-label="Card options"
            >
               <MoreHorizontal size={14} />
            </button>
         </div>

         {/* Card Description */}
         {item.description && (
            <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed line-clamp-2">
               {item.description}
            </p>
         )}

         {/* Card Footer - Date & Streak */}
         {((showDate && item.dueDate) || item.streak) && (
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-border">
               {showDate && item.dueDate && (
                  <span className="text-[10px] text-muted-foreground time-display">
                     {item.dueDate}
                  </span>
               )}
               {item.streak && (
                  <span className="text-[10px] text-chart-2 font-medium">
                     🔥 {item.streak} days
                  </span>
               )}
            </div>
         )}
      </div>
   );
}
