import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import type { Todo, Habit } from "../store-v2/types";
import { TodoCard } from "./TodoCard";

export type ColumnType = "backlogs" | "todo" | "habits";

interface KanbanColumnProps {
   type: ColumnType;
   title: string;
   items: Todo[];
   habits?: Habit[];
   onAddItem?: () => void;
   onItemClick?: (item: Todo) => void;
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
};

// Format date for display
function formatGroupDate(dateString: string): string {
   const date = new Date(dateString);
   const today = new Date();
   const yesterday = new Date(today);
   yesterday.setDate(yesterday.getDate() - 1);

   // Reset time for comparison
   const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
   const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
   const yesterdayOnly = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate());

   if (dateOnly.getTime() === todayOnly.getTime()) {
      return "Today";
   }
   if (dateOnly.getTime() === yesterdayOnly.getTime()) {
      return "Yesterday";
   }

   // Format as "Jan 18, 2026"
   return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
   });
}

// Group items by date
function groupItemsByDate(
   items: Todo[],
   columnType: ColumnType
): Map<string, { displayDate: string; items: Todo[] }> {
   const groups = new Map<string, { displayDate: string; items: Todo[] }>();

   items.forEach((item) => {
      const dateKey = item.dueDate; // Already in YYYY-MM-DD format
      const displayDate = formatGroupDate(dateKey);

      if (!groups.has(dateKey)) {
         groups.set(dateKey, { displayDate, items: [] });
      }
      groups.get(dateKey)!.items.push(item);
   });

   // Sort completed items to the bottom within each group
   groups.forEach((group) => {
      group.items.sort((a, b) => {
         const aCompleted = a.completed ? 1 : 0;
         const bCompleted = b.completed ? 1 : 0;
         return aCompleted - bCompleted;
      });
   });

   // Sort by date:
   // - Backlog: newest first (descending) to show most recent missed items first
   // - Todo/Habits: closest date first (ascending) - today first, then tomorrow, etc.
   const sortedEntries = [...groups.entries()].sort((a, b) => {
      if (columnType === "backlogs") {
         return b[0].localeCompare(a[0]); // Descending
      }
      return a[0].localeCompare(b[0]); // Ascending (closest first)
   });

   return new Map(sortedEntries);
}

// Date separator component
function DateSeparator({ date }: { date: string }) {
   return (
      <div className="mt-4 mb-2 text-center">
         <span className="text-[10px] font-mono font-medium text-muted-foreground uppercase tracking-widest">
            {date}
         </span>
      </div>
   );
}

export function KanbanColumn({
   type,
   title,
   items,
   habits = [],
   onAddItem,
   onItemClick,
}: KanbanColumnProps) {
   const config = columnConfig[type];

   // Group items by date
   const groupedItems = groupItemsByDate(items, type);

   return (
      <div className="flex flex-col h-full">
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
            {/* Only show add button for todo and habits columns */}
            <Button
               variant="ghost"
               size="icon"
               onClick={onAddItem}
               className={cn(
                  "h-7 w-7 text-muted-foreground hover:text-foreground cursor-pointer",
                  {
                     "opacity-0 pointer-events-none": type !== "todo" && type !== "habits"
                  }
               )}
               aria-label={`Add item to ${title}`}
            >
                  <Plus size={14} />
            </Button>

         </div>

         {/* Column Content */}
         <ScrollArea className="flex-1 overflow-y-auto">
            <div className="p-2">
               {/* Render grouped items with date separators */}
               {[...groupedItems.entries()].map(([dateKey, group], index) => (
                  <div key={dateKey}>
                     {/* Show date label for all dates (skip first group to save space if only one group) */}
                     {(groupedItems.size > 1 || index === 0) && (
                        <DateSeparator date={group.displayDate} />
                     )}
                     <div className="space-y-2">
                        {group.items.map((item) => (
                           <TodoCard
                              key={item.id}
                              item={item}
                              columnType={type}
                              onClick={() => onItemClick?.(item)}
                              habitData={item.habitId ? habits.find((h) => h.id === item.habitId) : undefined}
                           />
                        ))}
                     </div>
                  </div>
               ))}

               {/* Empty state */}
               {items.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                     <span className="text-xs opacity-50">No items</span>
                  </div>
               )}
            </div>
         </ScrollArea>
      </div>
   );
}
