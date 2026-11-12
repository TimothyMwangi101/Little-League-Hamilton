import type { ButtonHTMLAttributes } from "react"

export const actionButtonClass =
    "inline-flex items-center gap-2 border-2 border-text-main px-3 py-2 text-xs font-bold uppercase tracking-wider shadow-hard-hover transition-all hover:bg-primary hover:text-white disabled:cursor-not-allowed disabled:opacity-60"

export const primaryButtonClass =
    "border-2 border-text-main bg-primary px-4 py-2 text-xs font-bold uppercase tracking-wider text-white shadow-hard-hover transition-all hover:bg-auth-green disabled:cursor-not-allowed disabled:opacity-60"

type ButtonVariant = "action" | "primary"

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
    variant: ButtonVariant
}

const buttonVariantClasses: Record<ButtonVariant, string> = {
    action: actionButtonClass,
    primary: primaryButtonClass,
}

export default function Button({ className, variant, ...props }: ButtonProps) {
    return (
        <button
            className={[buttonVariantClasses[variant], className].join(" ")}
            {...props}
        />
    )
}