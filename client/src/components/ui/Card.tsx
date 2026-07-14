import type { HTMLAttributes, ReactNode } from "react";

type Props = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  hover?: boolean;
};

export function Card({
  children,
  hover = true,
  className = "",
  ...rest
}: Props) {
  return (
    <div
      className={`rounded-2xl border border-[#E9DED3] bg-[#FFFBF7] p-6 transition ${
        hover ? "hover:-translate-y-1 hover:border-[#D9C8B5]" : ""
      } ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
}