import TodoInput from './TodoInput';
import TodoItem from './TodoItem';

export default function TodoList() {
  return (
    <div className="bg-cyan-200 pt-5 mt-5 mx-10 px-10 flex flex-col justify-center items-center h-fit rounded-2xl opacity-70">
      <TodoInput />
      <div className=" flex flex-col gap-5 overflow-y-auto overflow-x-hidden max-h-[30vh] flex-1 w-full pb-5">
        <TodoItem title="寫程式" />
        <TodoItem title="完成PPT" />
        <TodoItem title="吸貓" />
        <TodoItem title="專案上線" />
        <TodoItem title="完成期初報告" />
        <TodoItem title="填寫今日進度報告" />
      </div>
    </div>
  );
}
