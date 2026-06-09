import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-mantle group-[.toaster]:text-text group-[.toaster]:border-surface0/60 group-[.toaster]:shadow-2xl rounded-xl border p-4 flex gap-2.5 items-center text-xs font-medium",
          description: "group-[.toast]:text-subtext0 text-[11px]",
          actionButton:
            "group-[.toast]:bg-mauve group-[.toast]:text-crust group-[.toast]:font-semibold rounded-lg px-2.5 py-1.5",
          cancelButton:
            "group-[.toast]:bg-surface0 group-[.toast]:text-text rounded-lg px-2.5 py-1.5",
          success: "group-[.toaster]:border-green/20 group-[.toaster]:text-green group-[.toaster]:bg-green/5",
          error: "group-[.toaster]:border-red/20 group-[.toaster]:text-red group-[.toaster]:bg-red/5",
          info: "group-[.toaster]:border-blue/20 group-[.toaster]:text-blue group-[.toaster]:bg-blue/5",
          warning: "group-[.toaster]:border-yellow/20 group-[.toaster]:text-yellow group-[.toaster]:bg-yellow/5"
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
