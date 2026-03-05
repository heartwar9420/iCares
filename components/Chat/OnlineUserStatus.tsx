import { User } from 'lucide-react';
import { UserStatus } from './OnlineUserList';

interface Props {
  users: UserStatus[];
}

export default function OnlineUserStatus({ users }: Props) {
  const getDisplayStatus = (user: UserStatus) => {
    if (!user.isConnected || user.privacyMode === 'Hidden') {
      return '離線中';
    }
    return user.autoStatus;
  };
  return (
    <div className="bg-white p-2 w-full flex flex-col overflow-y-auto gap-3">
      {users.map((user) => {
        const finalStatus = getDisplayStatus(user);
        return (
          <div
            key={user.id}
            className={`flex  items-center justify-between p-2 rounded-md hover:bg-slate-400 hover:opacity-100  text-gray-800 ${finalStatus === '離線中' ? 'opacity-30' : ''}`}
          >
            <div className="flex text-xl items-center gap-2">
              <User size={16} />
              <span>{user.name}</span>
            </div>
            <div className="text-sm px-2 py-1 rounded-full bg-slate-100">
              <span>{finalStatus}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
