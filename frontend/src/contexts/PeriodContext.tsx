import React, { createContext, useContext, useState, useMemo } from 'react';

type ViewMode = 'monthly' | 'annual';

interface PeriodContextData {
  month: number; // 1-12
  year: number;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  goToPreviousPeriod: () => void;
  goToNextPeriod: () => void;
}

const PeriodContext = createContext<PeriodContextData | undefined>(undefined);

export const PeriodProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const now = useMemo(() => new Date(), []);
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [viewMode, setViewMode] = useState<ViewMode>('monthly');

  const goToPreviousPeriod = () => {
    if (viewMode === 'monthly') {
      if (month === 1) {
        setMonth(12);
        setYear((y) => y - 1);
      } else {
        setMonth((m) => m - 1);
      }
    } else {
      setYear((y) => y - 1);
    }
  };

  const goToNextPeriod = () => {
    if (viewMode === 'monthly') {
      if (month === 12) {
        setMonth(1);
        setYear((y) => y + 1);
      } else {
        setMonth((m) => m + 1);
      }
    } else {
      setYear((y) => y + 1);
    }
  };

  return (
    <PeriodContext.Provider value={{ month, year, viewMode, setViewMode, goToPreviousPeriod, goToNextPeriod }}>
      {children}
    </PeriodContext.Provider>
  );
};

export function usePeriod() {
  const context = useContext(PeriodContext);
  if (!context) {
    throw new Error('usePeriod deve ser usado dentro de um PeriodProvider.');
  }
  return context;
}