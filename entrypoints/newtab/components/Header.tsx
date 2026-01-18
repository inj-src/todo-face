import { Search, Plus, Settings, LayoutGrid } from "lucide-react";
import { useState } from "react";

interface HeaderProps {
   onSearch?: (query: string) => void;
   onAddTask?: () => void;
}

export function Header({ onSearch, onAddTask }: HeaderProps) {
   const [searchQuery, setSearchQuery] = useState("");

   const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setSearchQuery(value);
      onSearch?.(value);
   };

   return (
      <header className="flex items-center justify-between px-4 py-3 border-b border-border bg-card">
         {/* Left Section - Logo & Stats */}
         <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
               <span className="text-lg font-bold tracking-tighter text-foreground">
                  TODO·FACE
               </span>
            </div>
         </div>

         {/* Center Section - Search */}
         <div className="flex-1 max-w-md mx-4">
            <div className="relative">
               <Search
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
               />
               <input
                  type="text"
                  placeholder="Search tasks..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="w-full bg-background border border-border px-8 py-1.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-ring transition-colors"
               />
            </div>
         </div>

         {/* Right Section - Actions */}
         <div className="flex items-center gap-1">
            <button
               onClick={onAddTask}
               className="p-2 hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
               aria-label="Add new task"
            >
               <Plus size={18} />
            </button>
            <button
               className="p-2 hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
               aria-label="Settings"
            >
               <Settings size={18} />
            </button>
            <button
               className="p-2 hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
               aria-label="View options"
            >
               <LayoutGrid size={18} />
            </button>
         </div>
      </header>
   );
}
