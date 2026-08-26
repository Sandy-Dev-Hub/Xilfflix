import type { GenreOption } from './GenreDropdown';

interface FilterPillBarProps {
  options: GenreOption[];
  selected: GenreOption | null;
  onSelect: (option: GenreOption | null) => void;
  allLabel?: string;
}

export default function FilterPillBar({ 
  options, 
  selected, 
  onSelect, 
  allLabel = "All" 
}: FilterPillBarProps) {
  return (
    <div className="flex overflow-x-auto hide-scrollbar gap-2 px-4 py-3 sticky top-[60px] z-30 bg-xf-bg/95 backdrop-blur border-b border-white/5">
      <button
        onClick={() => onSelect(null)}
        className={`flex-shrink-0 px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 border ${
          selected === null 
            ? 'bg-white text-black border-white shadow-md' 
            : 'bg-[#181818] text-white border-white/10 hover:bg-white/10'
        }`}
      >
        {allLabel}
      </button>
      
      {options.map(opt => {
        const isSelected = selected?.id === opt.id;
        return (
           <button
            key={opt.id}
            onClick={() => onSelect(isSelected ? null : opt)}
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
