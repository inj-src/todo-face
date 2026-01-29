import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import type { Todo } from "../store/types";

interface TodoWithStreak extends Todo {
   streak?: number;
}

interface CalendarColumnProps {
   completed: TodoWithStreak[];
   backlogs: TodoWithStreak[];
}

type ViewMode = "weekly" | "monthly";

// Get the date key for grouping (YYYY-MM-DD format)
function getDateKey(dateString: string): string {
   const date = new Date(dateString);
   return date.toISOString().split("T")[0];
}

// Get week dates (Sunday to Saturday)
function getWeekDates(referenceDate: Date): Date[] {
   const dates: Date[] = [];
   const startOfWeek = new Date(referenceDate);
   const day = startOfWeek.getDay();
   startOfWeek.setDate(startOfWeek.getDate() - day);

   for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      dates.push(date);
   }
   return dates;
}

// Get month dates (all days in a month, padded to start on Sunday)
function getMonthDates(year: number, month: number): (Date | null)[] {
   const dates: (Date | null)[] = [];
   const firstDay = new Date(year, month, 1);
   const lastDay = new Date(year, month + 1, 0);

   // Add padding for days before the first of month
   for (let i = 0; i < firstDay.getDay(); i++) {
      dates.push(null);
   }

   // Add all days in the month
   for (let day = 1; day <= lastDay.getDate(); day++) {
      dates.push(new Date(year, month, day));
   }

   return dates;
}

// Get month/year header
function getMonthYearLabel(date: Date): string {
   return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

// Tab button component
function TabButton({
   active,
   onClick,
   children,
}: {
   active: boolean;
   onClick: () => void;
   children: React.ReactNode;
}) {
   return (
      <button
         onClick={onClick}
         className={cn(
            "px-2 py-1 text-[11px] font-medium transition-all duration-200 cursor-pointer rounded",
            active
               ? "bg-primary/15 text-primary border border-primary/30"
               : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
         )}
      >
         {children}
      </button>
   );
}

// Single day box component for Weekly view
function WeeklyDayBox({
   date,
   completedTodos,
   backlogTodos,
   isToday,
}: {
   date: Date;
   completedTodos: TodoWithStreak[];
   backlogTodos: TodoWithStreak[];
   isToday: boolean;
}) {
   const hasItems = completedTodos.length > 0 || backlogTodos.length > 0;
   const dayOfMonth = date.getDate();
   const weekday = date.toLocaleDateString("en-US", { weekday: "short" });

   return (
      <div
         className={cn(
            "min-h-[80px] p-2 border border-border/50 transition-all duration-200",
            isToday && "ring-2 ring-primary/30 bg-primary/5",
            !hasItems && "opacity-60"
         )}
      >
         {/* Day header - show weekday for weekly view */}
         <div className="flex items-center justify-between mb-1.5">
            <span
               className={cn(
                  "text-[10px] font-medium uppercase tracking-wider",
                  isToday ? "text-primary" : "text-muted-foreground"
               )}
            >
               {weekday}
            </span>
            <span
               className={cn(
                  "text-xs font-bold tabular-nums",
                  isToday ? "text-primary" : "text-foreground"
               )}
            >
               {dayOfMonth}
            </span>
         </div>

         {/* Todo items */}
         <div className="space-y-1">
            {completedTodos.map((todo) => (
               <div
                  key={todo.id}
                  className={cn(
                     "px-1.5 py-0.5 text-[10px] font-medium truncate",
                     "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30",
                     "shadow-[0_1px_2px_rgba(16,185,129,0.1)]"
                  )}
                  title={todo.title}
               >
                  {todo.title}
               </div>
            ))}
            {backlogTodos.map((todo) => (
               <div
                  key={todo.id}
                  className={cn(
                     "px-1.5 py-0.5 text-[10px] font-medium truncate",
                     "bg-red-500/15 text-red-400 border border-red-500/30",
                     "shadow-[0_1px_2px_rgba(239,68,68,0.1)]"
                  )}
                  title={todo.title}
               >
                  {todo.title}
               </div>
            ))}
         </div>
      </div>
   );
}

// Single day box component for Monthly view (no weekday shown)
function MonthlyDayBox({
   date,
   completedTodos,
   backlogTodos,
   isToday,
}: {
   date: Date | null;
   completedTodos: TodoWithStreak[];
   backlogTodos: TodoWithStreak[];
   isToday: boolean;
}) {
   if (!date) {
      return <div className="min-h-[60px] bg-transparent" />;
   }

   const hasItems = completedTodos.length > 0 || backlogTodos.length > 0;
   const dayOfMonth = date.getDate();

   return (
      <div
         className={cn(
            "min-h-[60px] p-1.5 border border-border/50 transition-all duration-200",
            isToday && "ring-2 ring-primary/30 bg-primary/5",
            !hasItems && "opacity-50"
         )}
      >
         {/* Day number only - no weekday in monthly view */}
         <div className="flex items-center justify-end mb-1">
            <span
               className={cn(
                  "text-xs font-bold tabular-nums",
                  isToday ? "text-primary" : "text-foreground"
               )}
            >
               {dayOfMonth}
            </span>
         </div>

         {/* Todo items */}
         <div className="space-y-0.5">
            {completedTodos.slice(0, 2).map((todo) => (
               <div
                  key={todo.id}
                  className={cn(
                     "px-1 py-0.5 text-[9px] font-medium truncate",
                     "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                  )}
                  title={todo.title}
               >
                  {todo.title}
               </div>
            ))}
            {backlogTodos.slice(0, 2).map((todo) => (
               <div
                  key={todo.id}
                  className={cn(
                     "px-1 py-0.5 text-[9px] font-medium truncate",
                     "bg-red-500/15 text-red-400 border border-red-500/30"
                  )}
                  title={todo.title}
               >
                  {todo.title}
               </div>
            ))}
            {/* Show overflow indicator */}
            {(completedTodos.length > 2 || backlogTodos.length > 2) && (
               <div className="text-[8px] text-muted-foreground text-center">
                  +{Math.max(0, completedTodos.length - 2) + Math.max(0, backlogTodos.length - 2)} more
               </div>
            )}
         </div>
      </div>
   );
}

export function CalendarColumn({ completed, backlogs }: CalendarColumnProps) {
   const [viewMode, setViewMode] = useState<ViewMode>("weekly");
   const [referenceDate, setReferenceDate] = useState(new Date());

   const today = new Date();
   const todayKey = today.toISOString().split("T")[0];

   // Group todos by date
   const completedByDate = new Map<string, TodoWithStreak[]>();
   completed.forEach((todo) => {
      const dateKey = getDateKey(todo.updatedAt);
      if (!completedByDate.has(dateKey)) {
         completedByDate.set(dateKey, []);
      }
      completedByDate.get(dateKey)!.push(todo);
   });

   const backlogsByDate = new Map<string, TodoWithStreak[]>();
   backlogs.forEach((todo) => {
      const dateKey = getDateKey(todo.updatedAt);
      if (!backlogsByDate.has(dateKey)) {
         backlogsByDate.set(dateKey, []);
      }
      backlogsByDate.get(dateKey)!.push(todo);
   });

   // Navigation handlers
   function handlePrev() {
      const newDate = new Date(referenceDate);
      if (viewMode === "weekly") {
         newDate.setDate(newDate.getDate() - 7);
      } else {
         newDate.setMonth(newDate.getMonth() - 1);
      }
      setReferenceDate(newDate);
   }

   function handleNext() {
      const newDate = new Date(referenceDate);
      if (viewMode === "weekly") {
         newDate.setDate(newDate.getDate() + 7);
      } else {
         newDate.setMonth(newDate.getMonth() + 1);
      }
      setReferenceDate(newDate);
   }

   function handleToday() {
      setReferenceDate(new Date());
   }

   // Get dates to display
   const dates =
      viewMode === "weekly"
         ? getWeekDates(referenceDate)
         : getMonthDates(referenceDate.getFullYear(), referenceDate.getMonth());

   return (
      <div className="flex flex-col h-full">
         {/* Column Header with inline tabs */}
         <div className="flex items-center justify-between px-3 py-2 border-b border-dashed border-border">
            <div className="flex items-center gap-3">
               <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-indigo-400" />
                  <span className="text-sm font-medium text-foreground tracking-tight">
                     Calendar
                  </span>
               </div>
               {/* Inline View Mode Tabs */}
               <div className="flex items-center gap-1">
                  <TabButton
                     active={viewMode === "weekly"}
                     onClick={() => setViewMode("weekly")}
                  >
                     Weekly
                  </TabButton>
                  <TabButton
                     active={viewMode === "monthly"}
                     onClick={() => setViewMode("monthly")}
                  >
                     Monthly
                  </TabButton>
               </div>
            </div>
         </div>

         {/* Navigation */}
         <div className="flex items-center justify-between px-3 py-2 border-b border-border/30">
            <Button
               variant="ghost"
               size="icon-sm"
               onClick={handlePrev}
               className="h-6 w-6 text-muted-foreground hover:text-foreground cursor-pointer"
            >
               <ChevronLeft size={14} />
            </Button>
            <div className="flex items-center gap-2">
               <span className="text-xs font-medium text-foreground">
                  {viewMode === "weekly"
                     ? `Week of ${referenceDate.toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                     })}`
                     : getMonthYearLabel(referenceDate)}
               </span>
               <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleToday}
                  className="h-5 px-1.5 text-[10px] text-muted-foreground hover:text-foreground cursor-pointer"
               >
                  Today
               </Button>
            </div>
            <Button
               variant="ghost"
               size="icon-sm"
               onClick={handleNext}
               className="h-6 w-6 text-muted-foreground hover:text-foreground cursor-pointer"
            >
               <ChevronRight size={14} />
            </Button>
         </div>

         {/* Calendar Grid */}
         <ScrollArea className="flex-1 overflow-y-auto">
            <div className="p-2">
               {viewMode === "weekly" ? (
                  /* Weekly view - vertical stack */
                  <div className="space-y-1">
                     {(dates as Date[]).map((date) => {
                        const dateKey = date.toISOString().split("T")[0];
                        const isCurrentDay = dateKey === todayKey;
                        return (
                           <WeeklyDayBox
                              key={dateKey}
                              date={date}
                              completedTodos={completedByDate.get(dateKey) || []}
                              backlogTodos={backlogsByDate.get(dateKey) || []}
                              isToday={isCurrentDay}
                           />
                        );
                     })}
                  </div>
               ) : (
                  /* Monthly view - 7-column grid */
                  <div>
                     {/* Weekday headers */}
                     <div className="grid grid-cols-7 gap-px mb-1">
                        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                           (day) => (
                              <div
                                 key={day}
                                 className="text-center text-[10px] font-medium text-muted-foreground uppercase tracking-wider py-1"
                              >
                                 {day}
                              </div>
                           )
                        )}
                     </div>
                     {/* Day cells */}
                     <div className="grid grid-cols-7 gap-px">
                        {dates.map((date, index) => {
                           if (!date) {
                              return <MonthlyDayBox key={`empty-${index}`} date={null} completedTodos={[]} backlogTodos={[]} isToday={false} />;
                           }
                           const dateKey = date.toISOString().split("T")[0];
                           const isCurrentDay = dateKey === todayKey;
                           return (
                              <MonthlyDayBox
                                 key={dateKey}
                                 date={date}
                                 completedTodos={completedByDate.get(dateKey) || []}
                                 backlogTodos={backlogsByDate.get(dateKey) || []}
                                 isToday={isCurrentDay}
                              />
                           );
                        })}
                     </div>
                  </div>
               )}

               {/* Legend */}
               <div className="flex items-center justify-center gap-4 mt-4 pt-3 border-t border-border/30">
                  <div className="flex items-center gap-1.5">
                     <div className="w-2 h-2 bg-emerald-500/60 border border-emerald-500/50" />
                     <span className="text-[10px] text-muted-foreground">Completed</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                     <div className="w-2 h-2 bg-red-500/60 border border-red-500/50" />
                     <span className="text-[10px] text-muted-foreground">Backlog</span>
                  </div>
               </div>
            </div>
         </ScrollArea>
      </div>
   );
}
