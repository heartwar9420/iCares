interface Props {
  onClick?: () => void;
  children: React.ReactNode;
  // React.ReactNode = 代表什麼都能裝(包含文字或圖案)
  className?: string;
  disabled?: boolean;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}
export default function ActionIconButton({
  onClick,
  children,
  className,
  disabled,
  onMouseEnter,
  onMouseLeave,
}: Props) {
  return (
    <button
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      disabled={disabled}
      className={`${className} ${!disabled ? 'cursor-pointer hover:opacity-70 hover:scale-110 ' : 'cursor-not-allowed'}`}
    >
      {children}
    </button>
  );
}
