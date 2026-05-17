import React from 'react';

interface Props {
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  id?: string;
}

const ActionIconButton = React.memo(function ActionIconButton({
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
});
export default ActionIconButton;
