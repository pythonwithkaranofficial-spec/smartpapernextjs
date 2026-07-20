import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex field-sizing-content min-h-20 w-full px-3.5 py-2 text-base transition-all duration-300 outline-none placeholder:text-white/45 disabled:opacity-50 md:text-sm premium-input",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
