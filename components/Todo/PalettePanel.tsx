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
      className={`absolute flex flex-col top-full right-0 rounded-2xl overflow-hidden text-center justify-center bg-amber-50 z-10 ${className}`}
    >
      <div className="flex">
        {colorOptions.map((color_config) => (
          <button
            onClick={() => onColorSelect(color_config.textColor)}
            key={color_config.name}
            className={`flex p-5 hover:bg-slate-100 ${color_config.focusColor}`}
          >
            <div className={`w-5 h-5 rounded-full ${color_config.bgColor}`}></div>
          </button>
        ))}
      </div>
      <div className="h-1 bg-slate-200" />
      <div className="grid grid-cols-10">
        {iconOptions.map((icon_config) => (
          <button
            key={icon_config.name}
            className={
              'flex justify-center hover:bg-slate-100 focus:bg-slate-300 p-1 rounded-2xl m-1'
            }
            onClick={() => onIconSelect(icon_config.name)}
          >
            <icon_config.icon size={32} className={`${currentColor}`} />
          </button>
        ))}
      </div>
    </div>
  );
}
