interface Props {
  onClick?: () => void;
  children: React.ReactNode;
  // React.ReactNode = 代表什麼都能裝(包含文字或圖案)
  className?: string;
}
export default function ActionIconButton({ onClick, children, className }: Props) {
  return (
    <button
      onClick={onClick}
      className={`${className} cursor-pointer hover:opacity-70 hover:scale-110`}
    >
      {children}
    </button>
  );
}
