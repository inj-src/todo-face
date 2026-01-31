import { useEffect } from "react";
import { useTodoStore } from "../store-v2/store";

/**
 * Hook that refreshes the page at midnight (12:00 AM) to ensure
 * the UI reflects the correct date and todos are properly categorized.
 * Also initializes the day when the component mounts.
 */
export function useMidnightRefresh() {
   useEffect(() => {
      // Initialize day on mount
      useTodoStore.getState().initializeDay();

      // Calculate time until next midnight
      const now = new Date();
      const midnight = new Date(now);
      midnight.setDate(midnight.getDate() + 1);
      midnight.setHours(0, 0, 0, 0);

      const msUntilMidnight = midnight.getTime() - now.getTime();

      console.log(`[useMidnightRefresh] Page will refresh at midnight in ${Math.round(msUntilMidnight / 1000 / 60)} minutes`);

      const timeout = setTimeout(() => {
         console.log("[useMidnightRefresh] Midnight reached, refreshing page...");
         window.location.reload();
      }, msUntilMidnight);

      return () => {
         clearTimeout(timeout);
      };
   }, []);
}
