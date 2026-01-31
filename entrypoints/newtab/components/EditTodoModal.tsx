import { useState, useEffect } from "react";
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
import type { Todo } from "../store-v2/types";

interface EditTodoModalProps {
   open: boolean;
   onOpenChange: (open: boolean) => void;
   todo: Todo | null;
   onSubmit: (id: string, data: { title: string; description?: string }) => void;
}

export function EditTodoModal({
   open,
   onOpenChange,
   todo,
   onSubmit,
}: EditTodoModalProps) {
   const [title, setTitle] = useState("");
   const [description, setDescription] = useState("");

   // Reset form when todo changes
   useEffect(() => {
      if (todo) {
         setTitle(todo.title);
         setDescription(todo.description || "");
      }
   }, [todo]);

   function resetForm() {
      setTitle("");
      setDescription("");
   }

   function handleSubmit(e: React.FormEvent) {
      e.preventDefault();

      if (!title.trim() || !todo) return;

      onSubmit(todo.id, {
         title: title.trim(),
         description: description.trim() || undefined,
      });

      resetForm();
      onOpenChange(false);
   }

   function handleClose() {
      resetForm();
      onOpenChange(false);
   }

   return (
      <Dialog open={open} onOpenChange={handleClose}>
         <DialogContent className="sm:max-w-[520px]">
            <DialogHeader>
               <DialogTitle className="text-lg font-semibold">Edit Todo</DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4 mt-2">
               {/* Todo Title */}
               <div className="space-y-2">
                  <Label htmlFor="edit-todo-title">Todo</Label>
                  <Input
                     id="edit-todo-title"
                     placeholder="What needs to be done?"
                     value={title}
                     onChange={(e) => setTitle(e.target.value)}
                     autoFocus
                  />
               </div>

               {/* Description */}
               <div className="space-y-2">
                  <Label htmlFor="edit-todo-description">
                     Description
                     <span className="text-muted-foreground text-xs ml-1">(optional)</span>
                  </Label>
                  <Textarea
                     id="edit-todo-description"
                     placeholder="Add more details..."
                     value={description}
                     onChange={(e) => setDescription(e.target.value)}
                     rows={3}
                     className="resize-none"
                  />
               </div>

               <DialogFooter>
                  <Button
                     type="button"
                     variant="outline"
                     onClick={handleClose}
                  >
                     Cancel
                  </Button>
                  <Button type="submit" disabled={!title.trim()}>
                     Save Changes
                  </Button>
               </DialogFooter>
            </form>
         </DialogContent>
      </Dialog>
   );
}
