interface BadgeProps {
  label: string;
  color?: 'red' | 'white' | 'gold';
  size?: 'sm' | 'xs';
  className?: string;
}

const COLOR_CLASSES = {
  red: 'bg-xf-red text-white',
  white: 'bg-white/20 text-white border border-white/30',
  gold: 'bg-amber-500/90 text-black',
};

export default function Badge({
  label,
  color = 'red',
  size = 'sm',
  className = '',
}: BadgeProps) {
  const sizeClass = size === 'xs'
    ? 'px-1.5 py-0.5 text-[9px] tracking-wider'
    : 'px-2 py-0.5 text-[10px] tracking-wide';

  return (
    <span
      className={`inline-flex items-center font-bold uppercase rounded ${COLOR_CLASSES[color]} ${sizeClass} ${className}`}
    >
      {label}
    </span>
  );
}
