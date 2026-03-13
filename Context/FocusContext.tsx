'use client';

import { createContext, useContext, ReactNode, useState } from 'react';

export interface GridCell {
  id: number;
  status: 'empty' | 'focused';
  task_name?: string;
  icon_name?: string;
  color?: string;
}

interface FocusContextType {
  activeIcon: string;
  activeColor: string;
  activeTaskName: string;
  setActiveTask: (iconName: string, color: string, taskName: string) => void;
  gridCellsArray: GridCell[];
  markCellAsFocused: (cellId: number) => void;
}

// 建立 Context，初始值先給 undefined (尚未賦值用 undefined)，並套用剛剛寫好的 Interface
const FocusContext = createContext<FocusContextType | undefined>(undefined);

// 建立 Provider 用來把狀態傳給底下的所有子元件
export function FocusProvider({ children }: { children: ReactNode }) {
  const [activeIcon, setActiveIcon] = useState<string>('TreePine');
  const [activeColor, setActiveColor] = useState<string>('text-emerald-500');
  const [activeTaskName, setActiveTaskName] = useState<string>('');

  const [gridCellsArray, setGridCellsArray] = useState<GridCell[]>(
    Array.from({ length: 144 }, (_, index) => ({
      id: index,
      status: 'empty',
    })),
  );

  // 用來接收外部傳來的參數，並更新State
  const setActiveTask = (iconName: string, color: string, taskName: string) => {
    setActiveIcon(iconName);
    setActiveColor(color);
    setActiveTaskName(taskName);
  };

  // 給計時器用的觸發器，用來傳入格子的 ID ，把他變成專注狀態
  const markCellAsFocused = (cellId: number) => {
    setGridCellsArray((prevGrid) => {
      const newGrid = [...prevGrid];
      if (newGrid[cellId]) {
        newGrid[cellId] = {
          ...newGrid[cellId],
          status: 'focused',
          icon_name: activeIcon,
          color: activeColor,
          task_name: activeTaskName,
        };
      }
      return newGrid;
    });
  };

  return (
    // 把 State 和 Function 打包進 value 廣播出去
    <FocusContext.Provider
      value={{
        activeIcon,
        activeColor,
        activeTaskName,
        setActiveTask,
        gridCellsArray,
        markCellAsFocused,
      }}
    >
      {children}
    </FocusContext.Provider>
  );
}

// 自訂 Hook
export function useFocus() {
  const context = useContext(FocusContext);
  if (context === undefined) {
    throw new Error('useFocus 必須在 FocusProvider 中使用');
  }
  return context;
}
