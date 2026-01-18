import { MoreHorizontal, Flame, Check, ArrowRight, RotateCcw, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { TodoItem } from "../types";
import type { ColumnType } from "./KanbanColumn";

interface TodoCardProps {
   item: TodoItem;
   columnType: ColumnType;
   onClick?: () => void;
   onAction?: () => void;
}

// Get action label and icon based on column type
function getActionConfig(columnType: ColumnType): { label: string; icon: typeof Check } {
   switch (columnType) {
      case "backlogs":
         return { label: "Move to Todo", icon: ArrowRight };
      case "todo":
         return { label: "Mark Completed", icon: Check };
      case "habits":
         return { label: "Log Today", icon: Zap };
      case "completed":
      case "discarded":
         return { label: "Restore", icon: RotateCcw };
      default:
         return { label: "Complete", icon: Check };
   }
}

export function TodoCard({ item, columnType, onClick, onAction }: TodoCardProps) {
   // Show date on all columns except "todo" and "habits"
   const showDate = columnType !== "todo" && columnType !== "habits";
   const actionConfig = getActionConfig(columnType);
   const ActionIcon = actionConfig.icon;

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
            <Button
               variant="ghost"
               size="icon-sm"
               onClick={(e) => {
                  e.stopPropagation();
                  // Menu logic here
               }}
               className="opacity-0 group-hover:opacity-100 size-6 transition-opacity text-muted-foreground"
               aria-label="Card options"
            >
               <MoreHorizontal size={14} />
            </Button>
         </div>

         {/* Card Description */}
         {item.description && (
            <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed line-clamp-2">
               {item.description}
            </p>
         )}

         {/* Card Footer - Date & Streak */}
         {((showDate && item.dueDate) || item.streak) && (
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/50">
               {showDate && item.dueDate && (
                  <span className="text-[10px] text-muted-foreground time-display">
                     {item.dueDate}
                  </span>
               )}
               {item.streak && (
                  <div
                     className={cn(
                        "flex items-center gap-1 px-1.5 py-0.5 bg-chart-2/5 border border-chart-2/20",
                        "text-chart-2 shadow-[1px_1px_0px_--theme(--color-chart-2/0.2)]"
                     )}
                     title={`${item.streak} day streak`}
                  >
                     <Flame size={12} className="fill-chart-2/20 animate-pulse" />
                     <span className="text-[10px] font-bold tracking-tighter tabular-nums">
                        {item.streak} DAYS
                     </span>
                  </div>
               )}
            </div>
         )}

         {/* Hover Action Button */}
         <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
               e.stopPropagation();
               onAction?.();
            }}
            className={cn(
               "w-full mt-2 h-7 text-[11px] font-medium tracking-tight cursor-pointer",
               "bg-primary/5 border border-primary/20 text-primary",
               "hover:bg-primary/10 hover:border-primary/30 hover:text-primary",
               "opacity-0 max-h-0 overflow-hidden",
               "group-hover:opacity-100 group-hover:max-h-10",
               "transition-all duration-200 ease-out"
            )}
            aria-label={actionConfig.label}
         >
            <ActionIcon size={12} />
            {actionConfig.label}
         </Button>
      </div>
   );
}
