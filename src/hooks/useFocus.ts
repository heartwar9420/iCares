import { useCallback, useEffect, useState } from 'react';
import { useProfileContext } from '../contexts/ProfileContext';

interface GridCell {
  id: number;
  status: 'empty' | 'focused';
  task_name?: string;
  icon_name?: string;
  color?: string;
}

interface FocusRecord {
  id: string;
  user_id: string;
  todo_id: string | null;
  start_time: string;
  end_time: string;
  duration_seconds: number;
  created_at?: string;
  todos?: {
    task_name: string;
    icon_name?: string;
    icon_color?: string;
  };
}

interface GroupRecords {
  [key: string]: FocusRecord[];
}
const generateTodayGrid = (records: FocusRecord[]): GridCell[] => {
  const newGrid: GridCell[] = Array.from({ length: 144 }, (_, index) => ({
    id: index,
    status: 'empty',
  }));

  const now = new Date();
  // 建立 00:00:00 的時間點 用來判斷今天是否為今天
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const todayEnd = todayStart + 24 * 60 * 60 * 1000;

  records.forEach((record) => {
    const recordDate = new Date(record.start_time);
    const recordTime = recordDate.getTime();

    // 用 00:00:00 來判斷是否為今天
    if (recordTime >= todayStart && recordTime < todayEnd) {
      const startMinutes = recordDate.getHours() * 60 + recordDate.getMinutes();
      const startCellId = Math.floor(startMinutes / 10);

      const endMinutes = startMinutes + Math.floor(record.duration_seconds / 60);
      const endCellId = Math.floor(endMinutes / 10);

      for (let i = startCellId; i <= endCellId; i++) {
        if (i < 144) {
          newGrid[i] = {
            id: i,
            status: 'focused',
            task_name: record.todos?.task_name || '一般專注',
            icon_name: record.todos?.icon_name || 'TreePine',
            color: record.todos?.icon_color || 'text-emerald-500',
          };
        }
      }
    }
  });

  return newGrid;
};

export function useFocus() {
  // icon / color / todo title
  const [activeIcon, setActiveIcon] = useState<string>('TreePine');
  const [activeColor, setActiveColor] = useState<string>('text-emerald-500');
  const [activeTaskName, setActiveTaskName] = useState<string>('');
  const [activeId, setActiveId] = useState<string>('');

  // 存放到 FocusHistory 的 state
  const [groupedHistory, setGroupedHistory] = useState<GroupRecords>({});
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  const { user } = useProfileContext();

  const processGrouping = (records: FocusRecord[]) => {
    const groups: GroupRecords = {};
    const today = new Date().toLocaleDateString();
    const yesterday = new Date(Date.now() - 86400000).toLocaleDateString();

    records.forEach((record) => {
      const date = new Date(record.start_time).toLocaleDateString();
      let label = date;
      if (date === today) label = '今天';
      else if (date === yesterday) label = '昨天';

      if (!groups[label]) groups[label] = [];
      groups[label].push(record);
    });
    return groups;
  };

  const fetchFocusHistory = useCallback(async () => {
    try {
      setIsLoadingHistory(true);
      if (!user) return;
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/focus-records/${user.id}`,
      );
      const result = await response.json();
      if (result.status === 'success') {
        // 更新歷史紀錄列表
        setGroupedHistory(processGrouping(result.data));
        // 同步更新熱力圖的 144 格
        setGridCellsArray(generateTodayGrid(result.data));
      }
    } catch (error) {
      console.error('讀取歷史專注資料失敗', error);
    } finally {
      setIsLoadingHistory(false);
    }
  }, [user]);

  useEffect(() => {
    if (user?.id) {
      fetchFocusHistory();
    }
  }, [user?.id, fetchFocusHistory]);

  const deleteFocusRecord = async (recordId: string) => {
    if (!window.confirm('確定要刪除此筆紀錄嗎？')) return;

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/focus-records/${recordId}`,
        { method: 'DELETE' },
      );
      const result = await response.json();

      if (result.status === 'success') {
        fetchFocusHistory();
      } else {
        alert(`刪除失敗：${result.message}`);
      }
    } catch (error) {
      console.error('刪除紀錄請求失敗', error);
      alert('無法連線到伺服器');
    }
  };

  // 儲存中
  const [isSaving, setIsSaving] = useState(false);
  // 存到 db 中
  const saveFocusToDatabase = async (
    startTime: Date,
    endTime: Date,
    durationSeconds: number,
    todoId: string | null,
  ) => {
    try {
      setIsSaving(true);
      // 取得當前的使用者

      if (!user) return;
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/focus-records`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: user.id,
          todo_id: todoId,
          start_time: startTime.toISOString(),
          end_time: endTime.toISOString(),
          duration_seconds: durationSeconds,
        }),
      });

      const result = await response.json();
      if (result.status === 'success') {
        fetchFocusHistory(); //把資料存到db後 就刷新
      }
    } catch (error) {
      console.error('傳送到後端失敗', error);
    } finally {
      setIsSaving(false);
    }
  };

  const [gridCellsArray, setGridCellsArray] = useState<GridCell[]>(
    Array.from({ length: 144 }, (_, index) => ({
      id: index,
      status: 'empty',
    })),
  );

  // 用來接收外部傳來的參數，並更新State
  const setActiveTask = (iconName: string, color: string, taskName: string, id: string) => {
    setActiveIcon(iconName);
    setActiveColor(color);
    setActiveTaskName(taskName);
    setActiveId(id);
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

  // 用來算出目前時間所在格子的函式
  const markCurrentCell = () => {
    // 從這邊算出目前的時間格子
    const now = new Date();
    const totalMinutes = now.getHours() * 60 + now.getMinutes();
    const currentCellId = Math.floor(totalMinutes / 10);

    // 把目前的時間格子傳到 markCellAsFocused中 上色
    markCellAsFocused(currentCellId);
  };

  return {
    gridCellsArray,
    setActiveTask,
    markCurrentCell,
    saveFocusToDatabase,
    isSaving,
    isLoadingHistory,
    fetchFocusHistory,
    groupedHistory,
    deleteFocusRecord,
    activeId,
    activeColor,
    activeTaskName,
    activeIcon,
  };
}
