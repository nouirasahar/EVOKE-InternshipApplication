import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  children: ReactNode;
};

const variants: Record<Variant, string> = {
  primary:
    "border border-[#D8B79B] bg-[#D9966B] text-white hover:bg-[#CC8A61]",

  secondary:
    "border border-[#E9DED3] bg-[#FFFBF7] text-foreground hover:bg-[#FCF6F0]",

  ghost:
    "bg-transparent text-muted-foreground hover:text-foreground hover:bg-[#FCF6F0]",
};

export function Button({
  variant = "primary",
  className = "",
  children,
  ...rest
}: Props) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium transition cursor-pointer disabled:opacity-50 ${variants[variant]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}