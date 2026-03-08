import MessageArea from './MessageArea';
import OnlineUserList from './OnlineUserList';

export default function ChatRoom() {
  return (
    <>
      <div className="grid grid-cols-12 h-[80vh] bg-slate-200 gap-4 w-full p-4 mt-2 mx-2 shadow-2xl rounded-xl">
        <div className="col-span-8 flex flex-col h-full overflow-hidden">
          <MessageArea />
        </div>
        <div className="col-span-4 flex flex-col h-full overflow-hidden">
          <OnlineUserList />
        </div>
      </div>
    </>
  );
}
