import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2Icon } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 border border-transparent font-bold whitespace-nowrap transition-colors outline-none select-none focus-visible:ring-4 disabled:pointer-events-none disabled:cursor-not-allowed disabled:border-transparent disabled:bg-secondary disabled:text-muted-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      severity: {
        primary: "",
        secondary: "",
        success: "",
        info: "",
        warning: "",
        danger: "",
        help: "",
        contrast: "",
      },
      size: {
        small:
          "h-8 gap-1.5 px-3 text-xs [&_svg:not([class*='size-'])]:size-3.5",
        normal: "h-10 gap-2 px-4 text-sm [&_svg:not([class*='size-'])]:size-4",
        large: "h-11 gap-2 px-6 text-sm [&_svg:not([class*='size-'])]:size-4",
      },
      rounded: {
        true: "rounded-full",
        false: "rounded-lg",
      },
      outline: {
        true: "bg-transparent",
        false: "",
      },
      text: {
        true: "border-transparent bg-transparent shadow-none",
        false: "",
      },
      link: {
        true: "h-auto border-transparent bg-transparent p-0 shadow-none underline-offset-4 hover:underline focus-visible:ring-0",
        false: "",
      },
      iconOnly: {
        true: "aspect-square px-0",
        false: "",
      },
    },
    compoundVariants: [
      // Solid
      {
        outline: false,
        text: false,
        link: false,
        severity: "primary",
        className:
          "bg-brand-strong text-white hover:opacity-90 focus-visible:ring-amount/30",
      },
      {
        outline: false,
        text: false,
        link: false,
        severity: "secondary",
        className:
          "border-border bg-muted text-muted-foreground hover:bg-white focus-visible:ring-brand/20",
      },
      {
        outline: false,
        text: false,
        link: false,
        severity: "success",
        className:
          "bg-success text-white hover:opacity-90 focus-visible:ring-success/30",
      },
      {
        outline: false,
        text: false,
        link: false,
        severity: "info",
        className:
          "bg-accent text-accent-foreground hover:bg-accent/80 focus-visible:ring-brand/20",
      },
      {
        outline: false,
        text: false,
        link: false,
        severity: "warning",
        className:
          "bg-amber-500 text-white hover:opacity-90 focus-visible:ring-amber-500/30",
      },
      {
        outline: false,
        text: false,
        link: false,
        severity: "danger",
        className:
          "bg-destructive text-white hover:opacity-90 focus-visible:ring-destructive/30",
      },
      {
        outline: false,
        text: false,
        link: false,
        severity: "help",
        className:
          "bg-violet-600 text-white hover:opacity-90 focus-visible:ring-violet-600/30",
      },
      {
        outline: false,
        text: false,
        link: false,
        severity: "contrast",
        className:
          "bg-foreground text-background hover:opacity-90 focus-visible:ring-brand/20",
      },

      // Outline
      {
        outline: true,
        text: false,
        link: false,
        severity: "primary",
        className:
          "border-brand-strong text-brand-strong hover:bg-brand-strong/10 focus-visible:ring-brand/30",
      },
      {
        outline: true,
        text: false,
        link: false,
        severity: "secondary",
        className:
          "border-border text-foreground hover:bg-muted focus-visible:ring-brand/20",
      },
      {
        outline: true,
        text: false,
        link: false,
        severity: "success",
        className:
          "border-success text-success hover:bg-success-soft focus-visible:ring-success/30",
      },
      {
        outline: true,
        text: false,
        link: false,
        severity: "info",
        className:
          "border-accent-foreground text-accent-foreground hover:bg-accent focus-visible:ring-brand/20",
      },
      {
        outline: true,
        text: false,
        link: false,
        severity: "warning",
        className:
          "border-amber-500 text-amber-600 hover:bg-amber-500/10 focus-visible:ring-amber-500/30",
      },
      {
        outline: true,
        text: false,
        link: false,
        severity: "danger",
        className:
          "border-destructive text-destructive hover:bg-destructive/10 focus-visible:ring-destructive/30",
      },
      {
        outline: true,
        text: false,
        link: false,
        severity: "help",
        className:
          "border-violet-600 text-violet-600 hover:bg-violet-600/10 focus-visible:ring-violet-600/30",
      },
      {
        outline: true,
        text: false,
        link: false,
        severity: "contrast",
        className:
          "border-foreground text-foreground hover:bg-muted focus-visible:ring-brand/20",
      },

      // Text
      {
        text: true,
        link: false,
        severity: "primary",
        className:
          "text-brand-strong hover:bg-brand-strong/10 focus-visible:ring-brand/30",
      },
      {
        text: true,
        link: false,
        severity: "secondary",
        className:
          "text-muted-foreground hover:bg-muted focus-visible:ring-brand/20",
      },
      {
        text: true,
        link: false,
        severity: "success",
        className:
          "text-success hover:bg-success-soft focus-visible:ring-success/30",
      },
      {
        text: true,
        link: false,
        severity: "info",
        className:
          "text-accent-foreground hover:bg-accent focus-visible:ring-brand/20",
      },
      {
        text: true,
        link: false,
        severity: "warning",
        className:
          "text-amber-600 hover:bg-amber-500/10 focus-visible:ring-amber-500/30",
      },
      {
        text: true,
        link: false,
        severity: "danger",
        className:
          "text-destructive hover:bg-destructive/10 focus-visible:ring-destructive/30",
      },
      {
        text: true,
        link: false,
        severity: "help",
        className:
          "text-violet-600 hover:bg-violet-600/10 focus-visible:ring-violet-600/30",
      },
      {
        text: true,
        link: false,
        severity: "contrast",
        className: "text-foreground hover:bg-muted focus-visible:ring-brand/20",
      },

      // Link
      {
        link: true,
        severity: "primary",
        className: "text-brand-strong",
      },
      {
        link: true,
        severity: "secondary",
        className: "text-muted-foreground",
      },
      {
        link: true,
        severity: "success",
        className: "text-success",
      },
      {
        link: true,
        severity: "info",
        className: "text-accent-foreground",
      },
      {
        link: true,
        severity: "warning",
        className: "text-amber-600",
      },
      {
        link: true,
        severity: "danger",
        className: "text-destructive",
      },
      {
        link: true,
        severity: "help",
        className: "text-violet-600",
      },
      {
        link: true,
        severity: "contrast",
        className: "text-foreground",
      },

      // Icon-only sizes
      { iconOnly: true, size: "small", className: "size-8" },
      { iconOnly: true, size: "normal", className: "size-10" },
      { iconOnly: true, size: "large", className: "size-11" },
    ],
    defaultVariants: {
      severity: "primary",
      size: "normal",
      rounded: false,
      outline: false,
      text: false,
      link: false,
      iconOnly: false,
    },
  },
);

type ButtonSeverity = NonNullable<
  VariantProps<typeof buttonVariants>["severity"]
>;
type ButtonSize = NonNullable<VariantProps<typeof buttonVariants>["size"]>;
type ButtonIconPos = "left" | "right";

type ButtonProps = Omit<ButtonPrimitive.Props, "children"> & {
  severity?: ButtonSeverity;
  size?: ButtonSize;
  loading?: boolean;
  rounded?: boolean;
  text?: boolean;
  link?: boolean;
  outline?: boolean;
  icon?: ReactNode;
  iconPos?: ButtonIconPos;
  label?: string;
  loadingLabel?: string;
  children?: ReactNode;
  className?: string;
};

function Button({
  className,
  severity = "primary",
  size = "normal",
  loading = false,
  disabled = false,
  rounded = false,
  text = false,
  link = false,
  outline = false,
  icon,
  iconPos = "left",
  label,
  loadingLabel,
  children,
  type = "button",
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;
  const hasLabel = label !== undefined && label !== "";
  const iconOnly = !hasLabel && children === undefined && icon !== undefined;

  let displayLabel = label;
  if (loading && loadingLabel !== undefined) {
    displayLabel = loadingLabel;
  }

  let leadingIcon: ReactNode = null;
  let trailingIcon: ReactNode = null;

  if (loading) {
    leadingIcon = <Loader2Icon className="animate-spin" aria-hidden="true" />;
  } else if (icon !== undefined) {
    if (iconPos === "right") {
      trailingIcon = icon;
    } else {
      leadingIcon = icon;
    }
  }

  return (
    <ButtonPrimitive
      data-slot="button"
      type={type}
      disabled={isDisabled}
      aria-busy={loading}
      className={cn(
        buttonVariants({
          severity,
          size,
          rounded,
          outline,
          text,
          link,
          iconOnly,
          className,
        }),
      )}
      {...props}
    >
      {children !== undefined ? (
        children
      ) : (
        <>
          {leadingIcon}
          {displayLabel !== undefined && displayLabel !== ""
            ? displayLabel
            : null}
          {trailingIcon}
        </>
      )}
    </ButtonPrimitive>
  );
}

export { Button, buttonVariants };
export type { ButtonProps, ButtonSeverity, ButtonSize, ButtonIconPos };
