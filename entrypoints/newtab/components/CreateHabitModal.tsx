import { useState } from "react";
import {
   Dialog,
   DialogContent,
   DialogHeader,
   DialogTitle,
   DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type FrequencyType = "daily" | "weekly" | "custom";

interface CreateHabitModalProps {
   open: boolean;
   onOpenChange: (open: boolean) => void;
   onSubmit: (habit: {
      title: string;
      description?: string;
      frequency: FrequencyType;
      customDays?: number[];
   }) => void;
}

const DAYS_OF_WEEK = [
   { key: 0, label: "S", name: "Sunday" },
   { key: 1, label: "M", name: "Monday" },
   { key: 2, label: "T", name: "Tuesday" },
   { key: 3, label: "W", name: "Wednesday" },
   { key: 4, label: "T", name: "Thursday" },
   { key: 5, label: "F", name: "Friday" },
   { key: 6, label: "S", name: "Saturday" },
];

export function CreateHabitModal({
   open,
   onOpenChange,
   onSubmit,
}: CreateHabitModalProps) {
   const [title, setTitle] = useState("");
   const [description, setDescription] = useState("");
   const [frequency, setFrequency] = useState<FrequencyType>("daily");
   const [customDays, setCustomDays] = useState<number[]>([]);

   function handleDayToggle(dayKey: number) {
      setCustomDays((prev) =>
         prev.includes(dayKey)
            ? prev.filter((d) => d !== dayKey)
            : [...prev, dayKey].sort((a, b) => a - b)
      );
   }

   function handleFrequencyChange(newFrequency: FrequencyType) {
      setFrequency(newFrequency);
      if (newFrequency !== "custom") {
         setCustomDays([]);
      }
   }

   function handleSubmit(e: React.FormEvent) {
      e.preventDefault();

      if (!title.trim()) return;
      if (frequency === "custom" && customDays.length === 0) return;

      onSubmit({
         title: title.trim(),
         description: description.trim() || undefined,
         frequency,
         customDays: frequency === "custom" ? customDays : undefined,
      });

      // Reset form
      setTitle("");
      setDescription("");
      setFrequency("daily");
      setCustomDays([]);
      onOpenChange(false);
   }

   function handleClose() {
      setTitle("");
      setDescription("");
      setFrequency("daily");
      setCustomDays([]);
      onOpenChange(false);
   }

   const isSubmitDisabled = !title.trim() || (frequency === "custom" && customDays.length === 0);

   return (
      <Dialog open={open} onOpenChange={handleClose}>
         <DialogContent className="sm:max-w-[520px]">
            <DialogHeader>
               <DialogTitle className="text-lg font-semibold">Create Habit</DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4 mt-2">
               {/* Habit Title */}
               <div className="space-y-2">
                  <Label htmlFor="habit-title">Habit</Label>
                  <Input
                     id="habit-title"
                     placeholder="What habit do you want to build?"
                     value={title}
                     onChange={(e) => setTitle(e.target.value)}
                     autoFocus
                  />
               </div>

               {/* Description */}
               <div className="space-y-2">
                  <Label htmlFor="habit-description">
                     Description
                     <span className="text-muted-foreground text-xs ml-1">(optional)</span>
                  </Label>
                  <Textarea
                     id="habit-description"
                     placeholder="Add more details..."
                     value={description}
                     onChange={(e) => setDescription(e.target.value)}
                     rows={3}
                     className="resize-none"
                  />
               </div>

               {/* Frequency Selection */}
               <div className="space-y-2">
                  <Label>Frequency</Label>
                  <div className="flex gap-2">
                     <Button
                        type="button"
                        variant={frequency === "daily" ? "default" : "outline"}
                        className="flex-1"
                        onClick={() => handleFrequencyChange("daily")}
                     >
                        Daily
                     </Button>
                     <Button
                        type="button"
                        variant={frequency === "custom" ? "default" : "outline"}
                        className="flex-1"
                        onClick={() => handleFrequencyChange("custom")}
                     >
                        Custom
                     </Button>
                  </div>

                  {/* Custom Days Selector */}
                  {frequency === "custom" && (
                     <div className="pt-2">
                        <Label className="text-xs text-muted-foreground mb-2 block">
                           Select days
                        </Label>
                        <div className="flex gap-1">
                           {DAYS_OF_WEEK.map((day) => (
                              <Button
                                 key={day.key}
                                 type="button"
                                 variant={customDays.includes(day.key) ? "default" : "outline"}
                                 size="icon"
                                 className="w-8 h-8 text-xs"
                                 onClick={() => handleDayToggle(day.key)}
                                 title={day.name}
                              >
                                 {day.label}
                              </Button>
                           ))}
                        </div>
                        {customDays.length === 0 && (
                           <p className="text-xs text-destructive mt-2">
                              Please select at least one day
                           </p>
                        )}
                     </div>
                  )}
               </div>

               <DialogFooter>
                  <Button
                     type="button"
                     variant="outline"
                     onClick={handleClose}
                  >
                     Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitDisabled}>
                     Create Habit
                  </Button>
               </DialogFooter>
            </form>
         </DialogContent>
      </Dialog>
   );
}
