interface Props {
  onlineCount: number;
}
export default function OnlineUserCounting({ onlineCount }: Props) {
  return (
    <div className="bg-emerald-300 p-2">
      <div className="flex justify-between text-2xl">
        線上人數
        <span className="text-2xl">{onlineCount}人</span>
      </div>
    </div>
  );
}
