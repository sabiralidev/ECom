import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { ChevronLeft, ChevronRight, LoaderCircle, Star, X } from "lucide-react";

const buttonStyles = {
  primary: "bg-[var(--graphite)] text-[var(--surface)] hover:bg-[var(--bronze-deep)]",
  secondary: "border border-[var(--line)] bg-[var(--surface-elevated)] text-[var(--ink)] hover:border-[var(--bronze)]",
  outline: "border border-[var(--ink)] text-[var(--ink)] hover:bg-[var(--ink)] hover:text-[var(--surface)]",
  ghost: "text-[var(--ink)] hover:bg-[var(--paper)]",
  danger: "bg-[var(--error)] text-white hover:opacity-90",
};

const buttonSizes = {
  sm: "min-h-9 px-3 text-xs",
  md: "min-h-11 px-5 text-sm",
  lg: "min-h-12 px-7 text-sm",
  icon: "h-10 w-10 p-2",
};

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  className = "",
  children,
  ...props
}) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 font-semibold transition-colors duration-micro focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--bronze)] disabled:cursor-not-allowed disabled:opacity-55 ${buttonStyles[variant] || buttonStyles.primary} ${buttonSizes[size] || buttonSizes.md} ${className}`}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading && <LoaderCircle aria-hidden="true" size={16} className="animate-spin" />}
      {children}
    </button>
  );
}

export function Input({ label, id, error, className = "", ...props }) {
  return (
    <div className="grid gap-1.5">
      {label && <label htmlFor={id} className="text-sm font-medium text-[var(--ink)]">{label}</label>}
      <input id={id} className={`min-h-11 w-full rounded-[var(--radius-sm)] border border-[var(--line)] bg-[var(--surface-elevated)] px-3 text-[var(--ink)] placeholder:text-[var(--ink-soft)] focus:border-[var(--bronze)] focus:outline-none focus:ring-2 focus:ring-[var(--bronze)]/20 ${className}`} aria-invalid={Boolean(error)} aria-describedby={error && id ? `${id}-error` : undefined} {...props} />
      {error && <p id={id ? `${id}-error` : undefined} className="text-sm text-[var(--error)]" role="alert">{error}</p>}
    </div>
  );
}

export function Select({ label, id, className = "", children, ...props }) {
  return (
    <div className="grid gap-1.5">
      {label && <label htmlFor={id} className="text-sm font-medium text-[var(--ink)]">{label}</label>}
      <select id={id} className={`min-h-11 w-full rounded-[var(--radius-sm)] border border-[var(--line)] bg-[var(--surface-elevated)] px-3 text-[var(--ink)] focus:border-[var(--bronze)] focus:outline-none focus:ring-2 focus:ring-[var(--bronze)]/20 ${className}`} {...props}>{children}</select>
    </div>
  );
}

export function Checkbox({ label, className = "", ...props }) {
  return (
    <label className={`inline-flex cursor-pointer items-center gap-2 text-sm text-[var(--ink)] ${className}`}>
      <input type="checkbox" className="h-4 w-4 accent-[var(--bronze)]" {...props} />
      <span>{label}</span>
    </label>
  );
}

export function Badge({ tone = "neutral", className = "", children, ...props }) {
  const tones = {
    neutral: "bg-[var(--paper)] text-[var(--ink)]",
    accent: "bg-[var(--bronze)]/15 text-[var(--bronze-deep)]",
    success: "bg-[var(--success)]/15 text-[var(--success)]",
    warning: "bg-[var(--warning)]/15 text-[var(--warning)]",
    danger: "bg-[var(--error)]/15 text-[var(--error)]",
  };
  return <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${tones[tone] || tones.neutral} ${className}`} {...props}>{children}</span>;
}

export function Card({ className = "", children, ...props }) {
  return <section className={`rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--surface-elevated)] shadow-sm ${className}`} {...props}>{children}</section>;
}

function useDialogDismiss(open, onClose, ref) {
  useEffect(() => {
    if (!open) return undefined;
    const previousFocus = document.activeElement;
    const bodyOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose?.();
      if (event.key !== "Tab" || !ref.current) return;
      const focusable = ref.current.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])');
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    ref.current?.querySelector("button, [href], input, select, textarea")?.focus();
    return () => {
      document.body.style.overflow = bodyOverflow;
      document.removeEventListener("keydown", handleKeyDown);
      previousFocus?.focus?.();
    };
  }, [open, onClose, ref]);
}

export function Modal({ open, onClose, title, children, className = "" }) {
  const dialogRef = useRef(null);
  useDialogDismiss(open, onClose, dialogRef);
  if (!open) return null;
  return createPortal(
    <div className="fixed inset-0 z-[var(--layer-overlay)] grid place-items-center bg-black/55 p-4" onMouseDown={(event) => event.target === event.currentTarget && onClose?.()}>
      <section ref={dialogRef} role="dialog" aria-modal="true" aria-label={title} className={`relative max-h-[90dvh] w-full max-w-2xl overflow-y-auto rounded-[var(--radius-md)] bg-[var(--surface-elevated)] p-6 text-[var(--ink)] shadow-2xl ${className}`}>
        <div className="mb-5 flex items-center justify-between gap-4">
          <h2 className="display-title text-3xl">{title}</h2>
          <button type="button" onClick={onClose} className="rounded-full p-2 hover:bg-[var(--paper)]" aria-label="Close dialog"><X size={20} /></button>
        </div>
        {children}
      </section>
    </div>,
    document.body
  );
}

export function Drawer({ open, onClose, title, children, side = "right", className = "" }) {
  const dialogRef = useRef(null);
  useDialogDismiss(open, onClose, dialogRef);
  if (!open) return null;
  const position = side === "left" ? "left-0 -translate-x-0" : "right-0";
  return createPortal(
    <div className="fixed inset-0 z-[var(--layer-overlay)] bg-black/50" onMouseDown={(event) => event.target === event.currentTarget && onClose?.()}>
      <section ref={dialogRef} role="dialog" aria-modal="true" aria-label={title} className={`fixed inset-y-0 ${position} w-[min(90vw,28rem)] overflow-y-auto bg-[var(--surface-elevated)] p-6 text-[var(--ink)] shadow-2xl ${className}`}>
        <header className="mb-6 flex items-center justify-between border-b border-[var(--line)] pb-4">
          <h2 className="display-title text-3xl">{title}</h2>
          <button type="button" onClick={onClose} className="rounded-full p-2 hover:bg-[var(--paper)]" aria-label="Close drawer"><X size={20} /></button>
        </header>
        {children}
      </section>
    </div>,
    document.body
  );
}

export function Tooltip({ label, children }) {
  return <span className="group relative inline-flex">{children}<span role="tooltip" className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 -translate-x-1/2 whitespace-nowrap rounded bg-[var(--graphite)] px-2 py-1 text-xs text-[var(--surface)] opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">{label}</span></span>;
}

export function Tabs({ tabs, value, onChange, className = "" }) {
  return (
    <div className={className}>
      <div role="tablist" className="flex overflow-x-auto border-b border-[var(--line)]">
        {tabs.map((tab) => <button key={tab.value} id={`tab-${tab.value}`} type="button" role="tab" aria-selected={value === tab.value} aria-controls={`panel-${tab.value}`} onClick={() => onChange(tab.value)} className={`whitespace-nowrap border-b-2 px-4 py-3 text-sm ${value === tab.value ? "border-[var(--bronze)] font-semibold text-[var(--ink)]" : "border-transparent text-[var(--ink-soft)]"}`}>{tab.label}</button>)}
      </div>
      {tabs.map((tab) => value === tab.value && <div key={tab.value} id={`panel-${tab.value}`} role="tabpanel" aria-labelledby={`tab-${tab.value}`} className="py-4">{tab.content}</div>)}
    </div>
  );
}

export function Accordion({ items, className = "" }) {
  return <div className={className}>{items.map((item) => <details key={item.title} className="border-b border-[var(--line)] py-4"><summary className="cursor-pointer font-semibold text-[var(--ink)]">{item.title}</summary><div className="pt-3 text-sm leading-6 text-[var(--ink-soft)]">{item.content}</div></details>)}</div>;
}

export function Skeleton({ className = "", ...props }) {
  return <div aria-hidden="true" className={`motion-safe:animate-pulse rounded bg-[var(--line)]/60 ${className}`} {...props} />;
}

export function EmptyState({ title = "Nothing to see here yet", description, action, className = "" }) {
  return <div className={`grid justify-items-center gap-3 py-12 text-center ${className}`}><h2 className="display-title text-3xl text-[var(--ink)]">{title}</h2>{description && <p className="max-w-md text-sm text-[var(--ink-soft)]">{description}</p>}{action}</div>;
}

export function Rating({ value = 0, count, className = "" }) {
  const rating = Math.min(5, Math.max(0, Number(value) || 0));
  return <span className={`inline-flex items-center gap-1.5 text-sm ${className}`} aria-label={`${rating.toFixed(1)} out of 5 stars${count === undefined ? "" : `, ${count} ratings`}`}><span className="inline-flex text-[var(--bronze)]" aria-hidden="true">{Array.from({ length: 5 }, (_, index) => <Star key={index} size={14} fill={index < Math.round(rating) ? "currentColor" : "none"} />)}</span><span className="text-[var(--ink-soft)]">{rating.toFixed(1)}{count !== undefined && ` (${count})`}</span></span>;
}

export function Pagination({ page, pages, onChange, className = "" }) {
  const current = Number(page) || 1;
  const total = Number(pages) || 1;
  if (total <= 1) return null;
  return <nav aria-label="Pagination" className={`flex items-center justify-center gap-2 ${className}`}><Button variant="secondary" size="icon" aria-label="Previous page" disabled={current <= 1} onClick={() => onChange(current - 1)}><ChevronLeft size={18} /></Button><span aria-live="polite" className="px-3 text-sm text-[var(--ink-soft)]">Page {current} of {total}</span><Button variant="secondary" size="icon" aria-label="Next page" disabled={current >= total} onClick={() => onChange(current + 1)}><ChevronRight size={18} /></Button></nav>;
}

export function Toast({ title, description, tone = "neutral", onDismiss }) {
  const role = tone === "danger" ? "alert" : "status";
  return <div role={role} aria-live={role === "alert" ? "assertive" : "polite"} className="flex items-start justify-between gap-4 rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--surface-elevated)] p-4 text-[var(--ink)] shadow-atelier"><div><p className="font-semibold">{title}</p>{description && <p className="mt-1 text-sm text-[var(--ink-soft)]">{description}</p>}</div>{onDismiss && <button type="button" onClick={onDismiss} aria-label="Dismiss notification"><X size={18} /></button>}</div>;
}

export function Breadcrumbs({ items, className = "" }) {
  return <nav aria-label="Breadcrumb" className={`text-sm text-[var(--ink-soft)] ${className}`}><ol className="flex flex-wrap items-center gap-2">{items.map((item, index) => <li key={`${item.label}-${index}`} className="flex items-center gap-2">{item.href && index < items.length - 1 ? <a href={item.href} className="hover:text-[var(--ink)]">{item.label}</a> : <span aria-current={index === items.length - 1 ? "page" : undefined}>{item.label}</span>}{index < items.length - 1 && <span aria-hidden="true">/</span>}</li>)}</ol></nav>;
}

export function PriceTag({ price, originalPrice, currency = "Rs", className = "" }) {
  const discounted = Number(originalPrice) > Number(price);
  const formatted = (amount) => `${currency} ${Number(amount || 0).toLocaleString()}`;
  const discount = discounted ? Math.round((1 - Number(price) / Number(originalPrice)) * 100) : 0;
  return <span className={`inline-flex flex-wrap items-baseline gap-x-2 gap-y-1 ${className}`}><strong className="font-semibold text-[var(--ink)]">{formatted(price)}</strong>{discounted && <><del className="text-sm text-[var(--ink-soft)]">{formatted(originalPrice)}</del><Badge tone="accent">{discount}% off</Badge></>}</span>;
}

export function QuantityStepper({ value, onChange, min = 1, max = 99, label = "Quantity", className = "" }) {
  return <div className={`inline-flex items-center border border-[var(--line)] ${className}`}><button type="button" aria-label={`Decrease ${label.toLowerCase()}`} disabled={value <= min} onClick={() => onChange(Math.max(min, value - 1))} className="h-10 w-10 disabled:opacity-40">−</button><output aria-live="polite" className="min-w-10 text-center text-sm">{value}</output><button type="button" aria-label={`Increase ${label.toLowerCase()}`} disabled={value >= max} onClick={() => onChange(Math.min(max, value + 1))} className="h-10 w-10 disabled:opacity-40">+</button></div>;
}
