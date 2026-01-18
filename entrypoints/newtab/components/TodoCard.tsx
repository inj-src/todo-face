import { MoreHorizontal, Flame, Check, ArrowRight, RotateCcw, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { Todo } from "../store/types";
import type { ColumnType } from "./KanbanColumn";
import { useTodoStore } from "../store/todoStore";

// Extended todo with optional streak
interface TodoWithStreak extends Todo {
   streak?: number;
}

interface TodoCardProps {
   item: TodoWithStreak;
   columnType: ColumnType;
   onClick?: () => void;
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

export function TodoCard({ item, columnType, onClick }: TodoCardProps) {
   const { completeTodo, moveToTodo, restoreTodo, logHabitCompletion } = useTodoStore();

   // Show date on all columns except "todo" and "habits"
   const showDate = columnType !== "todo" && columnType !== "habits";
   const actionConfig = getActionConfig(columnType);
   const ActionIcon = actionConfig.icon;

   // Check if habit is already completed today
   const isHabitCompleted = columnType === "habits" && item.status === "completed";

   async function handleAction() {
      switch (columnType) {
         case "backlogs":
            await moveToTodo(item.id);
            break;
         case "todo":
            await completeTodo(item.id);
            break;
         case "habits":
            if (!isHabitCompleted) {
               await logHabitCompletion(item.id);
            }
            break;
         case "completed":
         case "discarded":
            await restoreTodo(item.id);
            break;
      }
   }

   return (
      <div
         onClick={onClick}
         className={cn(
            "group relative bg-card border border-border p-3 cursor-pointer",
            "hover:bg-accent/50 transition-colors duration-150",
            isHabitCompleted && "opacity-60"
         )}
      >
         {/* Card Header */}
         <div className="flex items-start justify-between gap-2">
            <h3 className={cn(
               "text-sm font-medium text-foreground leading-snug flex-1",
               isHabitCompleted && "line-through"
            )}>
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
         {((showDate && item.dueDate) || item.streak !== undefined) && (
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/50">
               {showDate && item.dueDate && (
                  <span className="text-[10px] text-muted-foreground time-display">
                     {new Date(item.dueDate).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                     })}
                  </span>
               )}
               {item.streak !== undefined && item.streak > 0 && (
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

         {/* Hover Action Button - Hidden for completed habits */}
         {!isHabitCompleted && (
            <Button
               variant="ghost"
               size="sm"
               onClick={(e) => {
                  e.stopPropagation();
                  handleAction();
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
         )}

         {/* Completed indicator for habits */}
         {isHabitCompleted && (
            <div className="flex items-center justify-center gap-1 mt-2 pt-2 border-t border-border/50 text-green-500">
               <Check size={12} />
               <span className="text-[10px] font-medium">Completed today</span>
            </div>
         )}
      </div>
   );
}
