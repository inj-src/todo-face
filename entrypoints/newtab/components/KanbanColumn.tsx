import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import type { Todo } from "../store/types";
import { TodoCard } from "./TodoCard";

export type ColumnType = "backlogs" | "todo" | "habits" | "completed" | "discarded";

// Extended todo with optional streak for habits
interface TodoWithStreak extends Todo {
   streak?: number;
}

interface KanbanColumnProps {
   type: ColumnType;
   title: string;
   items: TodoWithStreak[];
   onAddItem?: () => void;
   onItemClick?: (item: TodoWithStreak) => void;
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

// Columns that should have date-based grouping
const DATE_GROUPED_COLUMNS: ColumnType[] = ["backlogs", "completed", "discarded"];

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

// Get the date key for grouping (YYYY-MM-DD format for sorting)
function getDateKey(dateString: string): string {
   const date = new Date(dateString);
   return date.toISOString().split("T")[0];
}

// Group items by date
function groupItemsByDate(
   items: TodoWithStreak[],
   columnType: ColumnType
): Map<string, { displayDate: string; items: TodoWithStreak[] }> {
   const groups = new Map<string, { displayDate: string; items: TodoWithStreak[] }>();

   items.forEach((item) => {
      // Use updatedAt for completed/discarded, originalDate for backlogs
      const dateField = columnType === "backlogs" ? item.originalDate : item.updatedAt;
      const dateKey = getDateKey(dateField);
      const displayDate = formatGroupDate(dateField);

      if (!groups.has(dateKey)) {
         groups.set(dateKey, { displayDate, items: [] });
      }
      groups.get(dateKey)!.items.push(item);
   });

   // Sort by date (most recent first)
   return new Map(
      [...groups.entries()].sort((a, b) => b[0].localeCompare(a[0]))
   );
}

// Date separator component
function DateSeparator({ date }: { date: string }) {
   return (
      <div className="mt-4 mb-2 text-center">
         <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest">
            {date}
         </span>
      </div>
   );
}

export function KanbanColumn({
   type,
   title,
   items,
   onAddItem,
   onItemClick,
}: KanbanColumnProps) {
   const config = columnConfig[type];
   const shouldGroupByDate = DATE_GROUPED_COLUMNS.includes(type);

   // Group items by date if applicable
   const groupedItems = shouldGroupByDate ? groupItemsByDate(items, type) : null;

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
               {shouldGroupByDate && groupedItems ? (
                  // Render grouped items with date separators
                  <>
                     {[...groupedItems.entries()].map(([dateKey, group]) => (
                        <div key={dateKey}>
                           {/* Skip "Today" label, show labels for other dates */}
                           {group.displayDate !== "Today" && (
                              <DateSeparator date={group.displayDate} />
                           )}
                           <div className="space-y-2">
                              {group.items.map((item) => (
                                 <TodoCard
                                    key={item.id}
                                    item={item}
                                    columnType={type}
                                    onClick={() => onItemClick?.(item)}
                                 />
                              ))}
                           </div>
                        </div>
                     ))}
                  </>
               ) : (
                  // Render items without grouping
                  <div className="space-y-2">
                     {items.map((item) => (
                        <TodoCard
                           key={item.id}
                           item={item}
                           columnType={type}
                           onClick={() => onItemClick?.(item)}
                        />
                     ))}
                  </div>
               )}

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
