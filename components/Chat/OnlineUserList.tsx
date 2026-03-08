import { useState } from 'react';
import OnlineUserCounting from './OnlineUserCounting';
import OnlineUserStatus from './OnlineUserStatus';
import StatusSelector from './StatusSelector';

export interface UserStatus {
  id: string;
  name: string;
  isConnected: boolean; // 是否上線？
  privacyMode: 'Public' | 'Hidden'; // 是否公開？
  autoStatus: '專注中' | '休息中' | '長休息中' | '閒置中'; // 自動切換狀態
}

// 假資料
export const FAKE_USERS: UserStatus[] = [
  { id: '1', name: '小飯', isConnected: true, privacyMode: 'Public', autoStatus: '專注中' },
  { id: '2', name: '小糖', isConnected: true, privacyMode: 'Public', autoStatus: '休息中' },
  { id: '3', name: '小斑', isConnected: false, privacyMode: 'Public', autoStatus: '閒置中' },
  { id: '4', name: '你行Nissan啊', isConnected: true, privacyMode: 'Hidden', autoStatus: '專注中' },
  { id: '5', name: 'Me', isConnected: true, privacyMode: 'Public', autoStatus: '閒置中' },
];

export default function OnlineUserList() {
  const [userList, setUserList] = useState(FAKE_USERS);
  const onlineCount = userList.filter(
    (user) => user.isConnected && user.privacyMode === 'Public',
  ).length;

  const handleMyStatusChange = (newPrivacyMode: 'Public' | 'Hidden', newIsConnected: boolean) => {
    const updatedList = userList.map((user) => {
      if (user.id === '5')
        return {
          ...user,
          privacyMode: newPrivacyMode,
          isConnected: newIsConnected,
        };
      return user;
    });
    setUserList(updatedList);
  };

  return (
    <div className="flex flex-col h-full w-full overflow-hidden rounded-2xl">
      <div className="">
        <OnlineUserCounting onlineCount={onlineCount} />
      </div>
      <div className="flex flex-1 w-full">
        <OnlineUserStatus users={userList} />
      </div>
      <div className="">
        <StatusSelector onStatusChange={handleMyStatusChange} />
      </div>
    </div>
  );
}
