import ActionIconButton from '../UI/ActionIconButton';
import { colorOptions, iconOptions } from './iconConstants';

interface PalettePanelProps {
  currentColor: string;
  onColorSelect: (color: string) => void;
  onIconSelect: (iconName: string) => void;
  className?: string;
}

export default function PalettePanel({
  currentColor,
  onColorSelect,
  onIconSelect,
  className,
}: PalettePanelProps) {
  return (
    <div
      className={`absolute flex flex-col top-full mt-2 left-0 w-64 rounded-2xl overflow-hidden border border-white/10 shadow-[0_10px_40px_rgba(0,0,0,0.5)] bg-[#161b26]/95 backdrop-blur-xl z-50 ${className}`}
    >
      {/* 顏色選擇區 */}
      <div className="flex flex-wrap p-3 gap-2 justify-center bg-black/20">
        {colorOptions.map((color_config) => (
          <ActionIconButton
            key={color_config.name}
            onClick={() => onColorSelect(color_config.textColor)}
            className="p-1 rounded-full hover:scale-110 transition-transform focus:outline-none"
          >
            <div className={`w-5 h-5 rounded-full shadow-inner ${color_config.bgColor}`}></div>
          </ActionIconButton>
        ))}
      </div>

      <div className="h-px w-full bg-white/5" />

      {/* 圖示選擇區 */}
      <div className="grid grid-cols-6 gap-1 p-3 max-h-48 overflow-y-auto custom-scrollbar">
        {iconOptions.map((icon_config) => (
          <ActionIconButton
            key={icon_config.name}
            className="flex justify-center items-center aspect-square rounded-xl hover:bg-white/10 transition-colors focus:bg-white/20"
            onClick={() => onIconSelect(icon_config.name)}
          >
            <icon_config.icon size={20} className={`${currentColor}`} />
          </ActionIconButton>
        ))}
      </div>
    </div>
  );
}
