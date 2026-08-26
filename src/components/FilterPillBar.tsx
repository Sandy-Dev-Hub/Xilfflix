import type { GenreOption } from './GenreDropdown';

interface FilterPillBarProps {
  options: { id: string; label: string }[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  prepend?: React.ReactNode;
}

export default function FilterPillBar({ 
  options, 
  selectedId, 
  onSelect,
  prepend
}: FilterPillBarProps) {
  return (
    <div className="flex overflow-x-auto hide-scrollbar gap-2 px-4 py-3 bg-xf-bg/95 backdrop-blur border-b border-white/5">
      {prepend}
      
      {options.map(opt => {
        const isSelected = selectedId === opt.id;
        return (
           <button
            key={opt.id}
            onClick={() => onSelect(isSelected ? null : opt.id)}
            className={`flex-shrink-0 px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 border ${
              isSelected 
                ? 'bg-white text-black border-white shadow-md' 
                : 'bg-[#181818] text-white border-white/10 hover:bg-white/10'
            }`}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  );
}
