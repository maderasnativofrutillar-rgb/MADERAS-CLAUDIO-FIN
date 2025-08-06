import { cn } from "@/lib/utils";

interface HighlightedTextProps {
  children: React.ReactNode;
  className?: string;
}

export function HighlightedText({ children, className }: HighlightedTextProps) {
  return (
    <span className={cn("relative inline-block", className)}>
      <span className="relative z-10">{children}</span>
      <span
        className="absolute left-0 bottom-0 h-full w-full bg-accent/40 rounded-sm -z-1 animate-highlight"
        aria-hidden="true"
      />
    </span>
  );
}
