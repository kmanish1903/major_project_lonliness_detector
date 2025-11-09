import * as React from "react";
import { cn } from "@/lib/utils";

// Lightweight tooltip stubs to avoid runtime issues with Radix in some environments.
// API-compatible with our internal usage.

const TooltipProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => <>{children}</>;

const Tooltip: React.FC<{ children: React.ReactNode } & React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className,
  ...props
}) => (
  <div className={cn(className)} {...props}>
    {children}
  </div>
);

const TooltipTrigger: React.FC<{ asChild?: boolean; children: React.ReactNode }> = ({ children }) => <>{children}</>;

const TooltipContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    side?: "top" | "bottom" | "left" | "right";
    align?: "start" | "center" | "end";
    hidden?: boolean;
  }
>(({ className, children, ...props }, ref) => (
  // Render nothing by default (we only used tooltips in an unused sidebar)
  <div ref={ref} className={cn("hidden", className)} role="tooltip" {...props}>
    {children}
  </div>
));
TooltipContent.displayName = "TooltipContent";

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };
