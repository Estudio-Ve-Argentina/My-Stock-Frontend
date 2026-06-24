import { Children, type ReactNode } from "react";

type Cols = 2 | 3 | 4;

interface CarouselProps {
  children: ReactNode;
  cols?: Cols;
  compact?: boolean;
}

const gridCols: Record<Cols, string> = {
  2: "md:grid-cols-2",
  3: "md:grid-cols-3",
  4: "md:grid-cols-4",
};

export function Carousel({ children, cols = 3, compact = false }: CarouselProps) {
  const items = Children.toArray(children);

  return (
    <div
      className={`no-scrollbar flex snap-x snap-mandatory gap-5 overflow-x-auto pb-1 md:grid md:gap-5 md:overflow-visible md:pb-0 ${gridCols[cols]}`}
    >
      {items.map((child, index) => (
        <div
          key={index}
          className={`shrink-0 snap-start md:w-auto md:shrink ${compact ? "w-[70%] sm:w-[48%]" : "w-[72%] sm:w-[52%]"}`}
        >
          {child}
        </div>
      ))}
    </div>
  );
}
