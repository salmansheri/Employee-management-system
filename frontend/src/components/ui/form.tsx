import * as React from "react"
import { cn } from "../../lib/utils"

const FormItemContext = React.createContext<{ id: string } | null>(null)

export const FormItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const id = React.useId()

  return (
    <FormItemContext.Provider value={{ id }}>
      <div ref={ref} className={cn("space-y-1", className)} {...props} />
    </FormItemContext.Provider>
  )
})
FormItem.displayName = "FormItem"

export const FormLabel = React.forwardRef<
  HTMLLabelElement,
  React.LabelHTMLAttributes<HTMLLabelElement>
>(({ className, ...props }, ref) => {
  const context = React.useContext(FormItemContext)

  return (
    <label
      ref={ref}
      className={cn(
        "text-[10px] font-bold text-subtext1 uppercase tracking-wider block",
        className
      )}
      htmlFor={context?.id}
      {...props}
    />
  )
})
FormLabel.displayName = "FormLabel"

export const FormControl = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const context = React.useContext(FormItemContext)

  return (
    <div
      ref={ref}
      id={context?.id}
      className={cn("relative", className)}
      {...props}
    />
  )
})
FormControl.displayName = "FormControl"

export const FormDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => {
  return (
    <p
      ref={ref}
      className={cn("text-[11px] text-subtext0", className)}
      {...props}
    />
  )
})
FormDescription.displayName = "FormDescription"

export const FormMessage = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement> & {
    children?: React.ReactNode | any[]
  }
>(({ className, children, ...props }, ref) => {
  // TanStack Form returns errors as an array or a single string
  const errorMsg = Array.isArray(children)
    ? children.join(", ")
    : typeof children === "string"
    ? children
    : children?.toString() || ""

  if (!errorMsg) {
    return null
  }

  return (
    <p
      ref={ref}
      className={cn("text-xs font-semibold text-red mt-1 animate-pulse", className)}
      {...props}
    >
      {errorMsg}
    </p>
  )
})
FormMessage.displayName = "FormMessage"
