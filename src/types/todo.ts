// 在TypeScript中的樣子
export interface Todo {
  id: string;
  userId: string;
  taskName: string;
  iconName: string;
  iconColor: string;
  isCompleted: boolean;
  completedAt: string | null;
  sortOrder: number;
}

// 在資料庫中的樣子
export interface DbTodo {
  id: string;
  user_id: string;
  task_name: string;
  icon_name: string;
  icon_color: string;
  is_completed: boolean;
  completed_at: string | null;
  sort_order: number;
}
