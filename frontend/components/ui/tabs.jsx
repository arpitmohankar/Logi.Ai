import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"

import { cn } from "@/lib/utils"

function Tabs({
  className,
  ...props
}) {
  return (
    (<TabsPrimitive.Root
      data-slot="tabs"
      className={cn("flex flex-col gap-2", className)}
      {...props} />)
  );
}

function TabsList({
  className,
  ...props
}) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      className={cn(
        "bg-white text-blue-900 inline-flex h-11 w-fit items-center justify-center rounded-2xl px-2 py-1 shadow-lg z-30 border border-slate-200",
        className
      )}
      {...props} />
  );
}

function TabsTrigger({
  className,
  ...props
}) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        "px-5 py-2 rounded-xl font-semibold text-base transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-blue-300 focus-visible:z-40 border border-transparent data-[state=active]:bg-white data-[state=active]:text-blue-900 data-[state=active]:border-blue-200 data-[state=active]:shadow-md data-[state=active]:font-bold data-[state=inactive]:text-blue-900/60 data-[state=inactive]:bg-transparent data-[state=inactive]:font-normal",
        className
      )}
      {...props} />
  );
}

function TabsContent({
  className,
  ...props
}) {
  return (
    (<TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn("flex-1 outline-none", className)}
      {...props} />)
  );
}

export { Tabs, TabsList, TabsTrigger, TabsContent }
