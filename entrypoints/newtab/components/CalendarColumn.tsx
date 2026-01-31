import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import type { Todo } from "../store-v2/types";
import { formatDateToLocal } from "../store-v2/types";

interface CalendarColumnProps {
   completed: Todo[];
   backlogs: Todo[];
   pending: Todo[];
   habits: Todo[];
}

type ViewMode = "weekly" | "monthly";

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
            "px-2 py-1 text-[11px] font-medium duration-200 cursor-pointer ",
            active
               ? "bg-primary/15 text-primary ring ring-primary/30"
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
   pendingTodos,
   habitTodos,
   isToday,
}: {
   date: Date;
      completedTodos: Todo[];
      backlogTodos: Todo[];
      pendingTodos: Todo[];
      habitTodos: Todo[];
   isToday: boolean;
}) {
   const hasItems = completedTodos.length > 0 || backlogTodos.length > 0 || pendingTodos.length > 0 || habitTodos.length > 0;
   const dayOfMonth = date.getDate();
   const weekday = date.toLocaleDateString("en-US", { weekday: "short" });

   return (
      <div
         className={cn(
            "min-h-[80px] p-2 border border-border/50 transition-all duration-200",
            isToday && "border-2 border-primary/30 bg-primary/5",
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
         <div className="space-y-1 columns-2">
            {completedTodos.map((todo) => (
               <div
                  key={todo.id}
                  className={cn(
                     "px-1.5 py-0.5 text-[10px] font-medium truncate",
                     "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30",
                     "shadow-[0_1px_2px_rgba(16,185,129,0.1)]"
                  )}
                  title={`${todo.title} ${todo.description ? `\n\n ${todo.description}` : ""}`}
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
                  title={`${todo.title} ${todo.description ? `\n\n ${todo.description}` : ""}`}
               >
                  {todo.title}
               </div>
            ))}
            {pendingTodos.map((todo) => (
               <div
                  key={todo.id}
                  className={cn(
                     "px-1.5 py-0.5 text-[10px] font-medium truncate",
                     todo.completed
                        ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                        : "bg-zinc-500/15 text-zinc-400 border border-zinc-500/30",
                     "shadow-[0_1px_2px_rgba(113,113,122,0.1)]"
                  )}
                  title={`${todo.title} ${todo.description ? `\n\n ${todo.description}` : ""}`}
               >
                  {todo.title}
               </div>
            ))}
            {habitTodos.map((todo) => (
               <div
                  key={todo.id}
                  className={cn(
                     "px-1.5 py-0.5 text-[10px] font-medium truncate",
                     todo.completed
                        ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                        : "bg-violet-500/10 text-violet-400/70 border border-violet-500/20",
                     "shadow-[0_1px_2px_rgba(139,92,246,0.1)]"
                  )}
                  title={`${todo.title} ${todo.description ? `\n\n ${todo.description}` : ""}`}
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
   pendingTodos,
   habitTodos,
   isToday,
}: {
   date: Date | null;
      completedTodos: Todo[];
      backlogTodos: Todo[];
      pendingTodos: Todo[];
      habitTodos: Todo[];
   isToday: boolean;
}) {
   if (!date) {
      return <div className="min-h-[60px] bg-transparent" />;
   }

   const hasItems = completedTodos.length > 0 || backlogTodos.length > 0 || pendingTodos.length > 0 || habitTodos.length > 0;
   const dayOfMonth = date.getDate();

   return (
      <div
         className={cn(
            "min-h-[60px] p-1.5 border border-border/50 transition-all duration-200",
            isToday && "border-2 border-primary/30 bg-primary/5",
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

         {/* Todo items - show all */}
         <div className="space-y-0.5">
            {completedTodos.map((todo) => (
               <div
                  key={todo.id}
                  className={cn(
                     "px-1 py-0.5 text-[9px] font-medium truncate",
                     "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                  )}
                  title={`${todo.title} ${todo.description ? `\n\n ${todo.description}` : ""}`}
               >
                  {todo.title}
               </div>
            ))}
            {backlogTodos.map((todo) => (
               <div
                  key={todo.id}
                  className={cn(
                     "px-1 py-0.5 text-[9px] font-medium truncate",
                     "bg-red-500/15 text-red-400 border border-red-500/30"
                  )}
                  title={`${todo.title} ${todo.description ? `\n\n ${todo.description}` : ""}`}
               >
                  {todo.title}
               </div>
            ))}
            {pendingTodos.map((todo) => (
               <div
                  key={todo.id}
                  className={cn(
                     "px-1 py-0.5 text-[9px] font-medium truncate",
                     todo.completed
                        ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                        : "bg-zinc-500/15 text-zinc-400 border border-zinc-500/30"
                  )}
                  title={`${todo.title} ${todo.description ? `\n\n ${todo.description}` : ""}`}
               >
                  {todo.title}
               </div>
            ))}
            {habitTodos.map((todo) => (
               <div
                  key={todo.id}
                  className={cn(
                     "px-1 py-0.5 text-[9px] font-medium truncate",
                     todo.completed
                        ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                        : "bg-violet-500/10 text-violet-400/70 border border-violet-500/20"
                  )}
                  title={`${todo.title} ${todo.description ? `\n\n ${todo.description}` : ""}`}
               >
                  {todo.title}
               </div>
            ))}
         </div>
      </div>
   );
}



export function CalendarColumn({ completed, backlogs, pending, habits }: CalendarColumnProps) {
   const [viewMode, setViewMode] = useState<ViewMode>("weekly");
   const [referenceDate, setReferenceDate] = useState(new Date());

   const today = new Date();
   const todayKey = formatDateToLocal(today);

   // Group todos by date using dueDate (already in YYYY-MM-DD format)
   const completedByDate = new Map<string, Todo[]>();
   completed.forEach((todo) => {
      const dateKey = todo.dueDate;
      if (!completedByDate.has(dateKey)) {
         completedByDate.set(dateKey, []);
      }
      completedByDate.get(dateKey)!.push(todo);
   });

   const backlogsByDate = new Map<string, Todo[]>();
   backlogs.forEach((todo) => {
      const dateKey = todo.dueDate;
      if (!backlogsByDate.has(dateKey)) {
         backlogsByDate.set(dateKey, []);
      }
      backlogsByDate.get(dateKey)!.push(todo);
   });

   const pendingByDate = new Map<string, Todo[]>();
   pending.forEach((todo) => {
      const dateKey = todo.dueDate;
      if (!pendingByDate.has(dateKey)) {
         pendingByDate.set(dateKey, []);
      }
      pendingByDate.get(dateKey)!.push(todo);
   });

   const habitsByDate = new Map<string, Todo[]>();
   habits.forEach((todo) => {
      const dateKey = todo.dueDate;
      if (!habitsByDate.has(dateKey)) {
         habitsByDate.set(dateKey, []);
      }
      habitsByDate.get(dateKey)!.push(todo);
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
         {/* Column Header with inline tabs and navigation */}
         <div className="flex items-center justify-between px-3 py-[9px] border-b border-dashed border-border">
            {/* Left side: Title and view mode tabs */}
            <div className="flex items-center gap-3">
               <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-indigo-400" />
                  <span className="text-sm font-medium text-foreground tracking-tight">
                     Calendar
                  </span>
               </div>
               {/* View Mode Tabs */}
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

            {/* Right side: Navigation */}
            <div className="flex items-center gap-1">
               <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={handlePrev}
                  className="h-6 w-6 text-muted-foreground hover:text-foreground cursor-pointer"
               >
                  <ChevronLeft size={14} />
               </Button>
               <span className="text-xs font-medium text-foreground min-w-[90px] text-center">
                  {viewMode === "weekly"
                     ? `Week of ${referenceDate.toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                     })}`
                     : referenceDate.toLocaleDateString("en-US", {
                        month: "short",
                        year: "numeric",
                     })}
               </span>
               <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={handleNext}
                  className="h-6 w-6 text-muted-foreground hover:text-foreground cursor-pointer"
               >
                  <ChevronRight size={14} />
               </Button>
               <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleToday}
                  className="h-5 px-1.5 text-[10px] text-muted-foreground hover:text-foreground cursor-pointer ml-1"
               >
                  Today
               </Button>
            </div>
         </div>

         {/* Calendar Grid */}
         <ScrollArea className="flex-1 overflow-y-auto">
            <div className="p-2">
               {viewMode === "weekly" ? (
                  /* Weekly view - vertical stack */
                  <div className="space-y-1">
                     {(dates as Date[]).map((date) => {
                        const dateKey = formatDateToLocal(date);
                        const isCurrentDay = dateKey === todayKey;
                        return (
                           <WeeklyDayBox
                              key={dateKey}
                              date={date}
                              completedTodos={completedByDate.get(dateKey) || []}
                              backlogTodos={backlogsByDate.get(dateKey) || []}
                              pendingTodos={pendingByDate.get(dateKey) || []}
                              habitTodos={habitsByDate.get(dateKey) || []}
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
                              return <MonthlyDayBox key={`empty-${index}`} date={null} completedTodos={[]} backlogTodos={[]} pendingTodos={[]} habitTodos={[]} isToday={false} />;
                           }
                           const dateKey = formatDateToLocal(date);
                           const isCurrentDay = dateKey === todayKey;
                           return (
                              <MonthlyDayBox
                                 key={dateKey}
                                 date={date}
                                 completedTodos={completedByDate.get(dateKey) || []}
                                 backlogTodos={backlogsByDate.get(dateKey) || []}
                                 pendingTodos={pendingByDate.get(dateKey) || []}
                                 habitTodos={habitsByDate.get(dateKey) || []}
                                 isToday={isCurrentDay}
                              />
                           );
                        })}
                     </div>
                  </div>
               )}
            </div>
         </ScrollArea>
      </div>
   );
}
