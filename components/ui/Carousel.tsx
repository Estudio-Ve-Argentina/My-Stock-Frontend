import { Children, type ReactNode } from "react";

type Cols = 2 | 3 | 4;

interface CarouselProps {
  children: ReactNode;
  cols?: Cols;
}

const gridCols: Record<Cols, string> = {
  2: "md:grid-cols-2",
  3: "md:grid-cols-3",
  4: "md:grid-cols-4",
};

export function Carousel({ children, cols = 3 }: CarouselProps) {
  const items = Children.toArray(children);

  return (
    <div
      className={`no-scrollbar -mx-6 flex snap-x snap-mandatory gap-4 overflow-x-auto px-6 pb-1 md:mx-0 md:grid md:gap-5 md:overflow-visible md:px-0 md:pb-0 ${gridCols[cols]}`}
    >
      {items.map((child, index) => (
        <div
          key={index}
          className="w-[78%] shrink-0 snap-start sm:w-[58%] md:w-auto md:shrink"
        >
          {child}
        </div>
      ))}
    </div>
  );
}
