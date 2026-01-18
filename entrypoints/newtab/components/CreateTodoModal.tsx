import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Moon } from "lucide-react";
import {
   Dialog,
   DialogContent,
   DialogHeader,
   DialogTitle,
   DialogFooter,
   DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
   Popover,
   PopoverContent,
   PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface CreateTodoModalProps {
   open: boolean;
   onOpenChange: (open: boolean) => void;
   onSubmit: (todo: {
      title: string;
      description?: string;
      dueDate?: string;
   }) => void;
   /** When true, modal is for planning tomorrow's tasks (9 PM reminder) */
   tomorrowMode?: boolean;
   /** Called when user dismisses without adding todos (for reminder logic) */
   onDismiss?: () => void;
}

// Helper to get today (midnight)
function getToday(): Date {
   const today = new Date();
   today.setHours(0, 0, 0, 0);
   return today;
}

// Helper to get upcoming Friday
function getUpcomingFriday(): Date {
   const today = getToday();
   const dayOfWeek = today.getDay();
   // If today is Friday, get next Friday
   const daysUntilFriday = dayOfWeek === 5 ? 7 : (5 - dayOfWeek + 7) % 7 || 7;
   const friday = new Date(today);
   friday.setDate(today.getDate() + daysUntilFriday);
   return friday;
}

// Helper to get tomorrow
function getTomorrow(): Date {
   const tomorrow = getToday();
   tomorrow.setDate(tomorrow.getDate() + 1);
   return tomorrow;
}

// Check if two dates are the same day
function isSameDay(date1: Date, date2: Date): boolean {
   return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
   );
}

type DateShortcut = "today" | "tomorrow" | "weekend" | null;

export function CreateTodoModal({
   open,
   onOpenChange,
   onSubmit,
   tomorrowMode = false,
   onDismiss,
}: CreateTodoModalProps) {
   const today = getToday();
   const tomorrow = getTomorrow();
   const upcomingFriday = getUpcomingFriday();

   // In tomorrow mode, default to tomorrow's date
   const defaultDate = tomorrowMode ? tomorrow : today;

   const [title, setTitle] = useState("");
   const [description, setDescription] = useState("");
   const [dueDate, setDueDate] = useState<Date>(defaultDate);
   const [calendarOpen, setCalendarOpen] = useState(false);

   // Reset date when mode changes
   useEffect(() => {
      setDueDate(tomorrowMode ? getTomorrow() : getToday());
   }, [tomorrowMode, open]);

   // Determine which shortcut is active based on the selected date
   function getActiveShortcut(): DateShortcut {
      if (isSameDay(dueDate, today)) return "today";
      if (isSameDay(dueDate, tomorrow)) return "tomorrow";
      if (isSameDay(dueDate, upcomingFriday)) return "weekend";
      return null;
   }

   const selectedShortcut = getActiveShortcut();

   function handleShortcutClick(shortcut: DateShortcut) {
      let date: Date;
      switch (shortcut) {
         case "today":
            date = today;
            break;
         case "tomorrow":
            date = tomorrow;
            break;
         case "weekend":
            date = upcomingFriday;
            break;
         default:
            date = today;
      }
      setDueDate(date);
   }

   function handleDateSelect(date: Date | undefined) {
      if (date) {
         setDueDate(date);
         setCalendarOpen(false);
      }
   }

   function resetForm() {
      setTitle("");
      setDescription("");
      setDueDate(tomorrowMode ? getTomorrow() : getToday());
   }

   function handleSubmit(e: React.FormEvent) {
      e.preventDefault();

      if (!title.trim()) return;

      onSubmit({
         title: title.trim(),
         description: description.trim() || undefined,
         dueDate: dueDate.toISOString(),
      });

      resetForm();
   }

   function handleClose() {
      resetForm();
      onDismiss?.();
      onOpenChange(false);
   }

   // Text customization for tomorrow mode
   const modalTitle = tomorrowMode ? "Plan Tomorrow's Tasks" : "Create Todo";
   const titleLabel = tomorrowMode ? "Task for tomorrow" : "Todo";
   const titlePlaceholder = tomorrowMode
      ? "What do you want to accomplish tomorrow?"
      : "What needs to be done?";
   const submitLabel = tomorrowMode ? "Add Task" : "Create Todo";
   const cancelLabel = tomorrowMode ? "Skip for now" : "Cancel";

   return (
      <Dialog open={open} onOpenChange={handleClose}>
         <DialogContent className="sm:max-w-[520px]">
            <DialogHeader>
               <DialogTitle className="flex items-center gap-2 text-lg font-semibold">
                  {tomorrowMode && <Moon size={20} className="text-primary" />}
                  {modalTitle}
               </DialogTitle>
               {tomorrowMode && (
                  <DialogDescription>
                     It's getting late! Plan what you want to accomplish tomorrow.
                  </DialogDescription>
               )}
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4 mt-2">
               {/* Todo Title */}
               <div className="space-y-2">
                  <Label htmlFor="todo-title">{titleLabel}</Label>
                  <Input
                     id="todo-title"
                     placeholder={titlePlaceholder}
                     value={title}
                     onChange={(e) => setTitle(e.target.value)}
                     autoFocus
                  />
               </div>

               {/* Description */}
               <div className="space-y-2">
                  <Label htmlFor="todo-description">
                     Description
                     <span className="text-muted-foreground text-xs ml-1">(optional)</span>
                  </Label>
                  <Textarea
                     id="todo-description"
                     placeholder="Add more details..."
                     value={description}
                     onChange={(e) => setDescription(e.target.value)}
                     rows={3}
                     className="resize-none"
                  />
               </div>

               {/* Date Selection - Hidden in tomorrow mode */}
               {!tomorrowMode && (
                  <div className="space-y-2">
                     <Label>Due Date</Label>
                     <div className="flex gap-2 mb-2">
                        <Button
                           type="button"
                           variant={selectedShortcut === "today" ? "default" : "outline"}
                           className="flex-1"
                           onClick={() => handleShortcutClick("today")}
                        >
                           Today
                        </Button>
                        <Button
                           type="button"
                           variant={selectedShortcut === "tomorrow" ? "default" : "outline"}
                           className="flex-1"
                           onClick={() => handleShortcutClick("tomorrow")}
                        >
                           Tomorrow
                        </Button>
                        <Button
                           type="button"
                           variant={selectedShortcut === "weekend" ? "default" : "outline"}
                           className="flex-1"
                           onClick={() => handleShortcutClick("weekend")}
                        >
                           Weekend
                        </Button>
                     </div>

                     {/* Date Picker */}
                     <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                        <PopoverTrigger asChild>
                           <Button
                              type="button"
                              variant="outline"
                              className={cn(
                                 "w-full justify-start text-left font-normal",
                                 !dueDate && "text-muted-foreground"
                              )}
                           >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {dueDate ? format(dueDate, "PPP") : <span>Pick a date</span>}
                           </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                           <Calendar
                              mode="single"
                              selected={dueDate}
                              onSelect={handleDateSelect}
                              initialFocus
                           />
                        </PopoverContent>
                     </Popover>
                  </div>
               )}

               <DialogFooter>
                  <Button
                     type="button"
                     variant="outline"
                     onClick={handleClose}
                  >
                     {cancelLabel}
                  </Button>
                  <Button type="submit" disabled={!title.trim()}>
                     {submitLabel}
                  </Button>
               </DialogFooter>

               {tomorrowMode && (
                  <p className="text-xs text-muted-foreground text-center">
                     Reminder will appear again in 30 minutes if you skip
                  </p>
               )}
            </form>
         </DialogContent>
      </Dialog>
   );
}
