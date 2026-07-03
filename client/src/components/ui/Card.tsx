import type { HTMLAttributes, ReactNode } from "react";

type Props = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  hover?: boolean;
};

export function Card({ children, hover = true, className = "", ...rest }: Props) {
  return (
    <div
      className={`glass rounded-2xl p-6 transition ${
        hover ? "hover:-translate-y-1 hover:border-white/20" : ""
      } ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
}
