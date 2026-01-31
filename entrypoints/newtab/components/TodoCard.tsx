import { useState } from "react";
import { MoreHorizontal, Flame, Check, ArrowRight, Zap, Trash2, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { Todo, Habit } from "../store-v2/types";
import type { ColumnType } from "./KanbanColumn";
import { useTodoStore, getHabitStreak } from "../store-v2/store";
import { EditTodoModal } from "./EditTodoModal";
import { EditHabitModal } from "./EditHabitModal";

interface TodoCardProps {
   item: Todo;
   columnType: ColumnType;
   onClick?: () => void;
   /** For habit cards, provide the parent habit data for editing */
   habitData?: Habit;
}

// Get action label and icon based on column type
function getActionConfig(columnType: ColumnType, isBacklog: boolean): { label: string; icon: typeof Check } {
   if (isBacklog) {
      return { label: "Clear", icon: Check };
   }

   switch (columnType) {
      case "backlogs":
         return { label: "Clear", icon: Check };
      case "todo":
         return { label: "Mark Completed", icon: Check };
      case "habits":
         return { label: "Log Today", icon: Zap };
      default:
         return { label: "Complete", icon: Check };
   }
}

export function TodoCard({ item, columnType, onClick, habitData }: TodoCardProps) {
   const { completeTodo, clearBacklog, deleteTodo, deleteHabit, updateTodo, updateHabit } = useTodoStore();
   const [menuOpen, setMenuOpen] = useState(false);
   const [editTodoModalOpen, setEditTodoModalOpen] = useState(false);
   const [editHabitModalOpen, setEditHabitModalOpen] = useState(false);

   const isHabitItem = item.isHabit && item.habitId;
   const isBacklog = columnType === "backlogs";
   const isCompleted = item.completed;

   // Get streak from habit (live reference)
   const streak = isHabitItem ? getHabitStreak(item.habitId) : 0;

   const actionConfig = getActionConfig(columnType, isBacklog);
   const ActionIcon = actionConfig.icon;

   async function handleAction() {
      if (isCompleted) return; // Can't act on completed items

      if (isBacklog) {
         // Clear backlog: complete without streak increment
         clearBacklog(item.id, item.dueDate);
         return;
      }

      // Complete the todo (habit or regular)
      completeTodo(item.id, item.dueDate);
   }

   async function handleDelete() {
      setMenuOpen(false);
      if (isHabitItem && item.habitId) {
         deleteHabit(item.habitId);
      } else {
         deleteTodo(item.id, item.dueDate);
      }
   }

   function handleEdit() {
      setMenuOpen(false);
      // Backlog items are not editable
      if (isBacklog) return;

      if (isHabitItem && habitData) {
         setEditHabitModalOpen(true);
      } else {
         setEditTodoModalOpen(true);
      }
   }

   async function handleUpdateTodo(id: string, data: { title: string; description?: string }) {
      updateTodo(id, item.dueDate, data);
   }

   async function handleUpdateHabit(id: string, data: { title: string; description?: string; frequency: "daily" | "custom"; customDays?: number[] }) {
      updateHabit(id, data);
   }

   return (
      <>
         <div
            onClick={onClick}
            className={cn(
               "group relative bg-card border border-border p-3 cursor-pointer",
               "hover:bg-accent/50 transition-colors duration-150",
               isCompleted && "opacity-60 bg-green-950/20 border-green-800/30"
            )}
         >
            {/* Card Header */}
            <div className="flex items-start justify-between gap-2">
               <h3 className={cn(
                  "text-sm font-medium text-foreground leading-snug flex-1",
                  isCompleted && "line-through text-foreground/80"
               )}>
                  {item.title}
               </h3>
               {/* Hide menu for backlog items (not editable) */}
               {!isBacklog && (
                  <Popover open={menuOpen} onOpenChange={setMenuOpen}>
                     <PopoverTrigger asChild>
                        <Button
                           variant="ghost"
                           size="icon-sm"
                           onClick={(e) => {
                              e.stopPropagation();
                           }}
                           className="opacity-0 group-hover:opacity-100 size-6 transition-opacity group-hover:delay-300 text-muted-foreground cursor-pointer"
                           aria-label="Card options"
                        >
                           <MoreHorizontal size={14} />
                        </Button>
                     </PopoverTrigger>
                     <PopoverContent
                        align="end"
                        className="w-40 p-1"
                        onClick={(e) => e.stopPropagation()}
                     >
                        <div className="flex flex-col">
                           <button
                              onClick={handleEdit}
                              className="flex items-center gap-2 px-2 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-accent rounded cursor-pointer transition-colors"
                           >
                              <Pencil size={12} />
                              Edit
                           </button>
                           <button
                              onClick={handleDelete}
                              className="flex items-center gap-2 px-2 py-1.5 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded cursor-pointer transition-colors"
                           >
                              <Trash2 size={12} />
                              Delete
                           </button>
                        </div>
                     </PopoverContent>
                  </Popover>
               )}
            </div>

            {/* Card Description */}
            {item.description && (
               <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed line-clamp-2">
                  {item.description}
               </p>
            )}

            {/* Card Footer - Streak (only for habits) */}
            {isHabitItem && streak > 0 && (
               <div className="flex items-center justify-end mt-2 pt-2 border-t border-border/50">
                  <div
                     className={cn(
                        "flex items-center gap-1 px-1.5 py-0.5 bg-chart-2/5 border border-chart-2/20",
                        "text-chart-2 shadow-[1px_1px_0px_--theme(--color-chart-2/0.2)]"
                     )}
                     title={`${streak} day streak`}
                  >
                     <Flame size={12} className="fill-chart-2/20 animate-pulse" />
                     <span className="text-[10px] font-bold tracking-tighter tabular-nums">
                        {streak} DAYS
                     </span>
                  </div>
               </div>
            )}

            {/* Hover Action Button - Hidden for completed items */}
            {!isCompleted && (
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
                     "transition-all duration-200 ease-out group-hover:delay-300"
                  )}
                  aria-label={actionConfig.label}
               >
                  <ActionIcon size={12} />
                  {actionConfig.label}
               </Button>
            )}
         </div>

         {/* Edit Todo Modal */}
         <EditTodoModal
            open={editTodoModalOpen}
            onOpenChange={setEditTodoModalOpen}
            todo={item}
            onSubmit={handleUpdateTodo}
         />

         {/* Edit Habit Modal */}
         {habitData && (
            <EditHabitModal
               open={editHabitModalOpen}
               onOpenChange={setEditHabitModalOpen}
               habit={habitData}
               onSubmit={handleUpdateHabit}
            />
         )}
      </>
   );
}
