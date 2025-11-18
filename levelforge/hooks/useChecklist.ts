import { useState, useMemo, useCallback } from 'react';
import { checklistData } from '../data/checklistItems';
import type { ChecklistState } from '../types/portfolio';

// Flatten the checklist data to make it easier to work with for state
const allItems = checklistData.flatMap(category => category.items);

const initialChecklistState: ChecklistState = allItems.reduce((acc, item) => {
  acc[item.id] = false;
  return acc;
}, {} as ChecklistState);

export const useChecklist = () => {
  const [checklistState, setChecklistState] = useState<ChecklistState>(initialChecklistState);

  const toggleItem = useCallback((id: string) => {
    setChecklistState(prevState => ({
      ...prevState,
      [id]: !prevState[id],
    }));
  }, []);

  const completionPercentage = useMemo(() => {
    const checkedCount = Object.values(checklistState).filter(Boolean).length;
    const totalCount = allItems.length;
    if (totalCount === 0) return 0;
    return Math.round((checkedCount / totalCount) * 100);
  }, [checklistState]);

  return {
    checklistState,
    toggleItem,
    completionPercentage,
  };
};
