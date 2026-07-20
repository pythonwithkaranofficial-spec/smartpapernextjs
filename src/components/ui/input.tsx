import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        "h-9 w-full min-w-0 px-3.5 py-2 text-base transition-all duration-300 outline-none placeholder:text-white/45 disabled:pointer-events-none disabled:opacity-50 md:text-sm premium-input",
        className
      )}
      {...props}
    />
  )
}

export { Input }
