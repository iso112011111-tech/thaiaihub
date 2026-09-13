"use client";

import { Children, cloneElement, isValidElement, type ReactElement } from "react";
import { cn } from "@/lib/utils";

/**
 * Minimal `asChild` implementation: merges the parent's props and className
 * onto its single child so a <Link> can inherit <Button> styling.
 */
export function Slot({
  children,
  className,
  ...props
}: {
  children?: React.ReactNode;
  className?: string;
} & Record<string, unknown>) {
  const child = Children.only(children) as ReactElement<{ className?: string }>;
  if (!isValidElement(child)) return null;

  return cloneElement(child, {
    ...props,
    className: cn(className, child.props.className),
  } as Partial<typeof child.props>);
}
