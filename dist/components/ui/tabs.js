import { jsx } from "react/jsx-runtime";
import { Content, List, Root, Trigger } from "@radix-ui/react-tabs";
import { forwardRef } from "react";
import { cn } from "../../lib/utils.js";
const Tabs = Root;
const TabsList = /*#__PURE__*/ forwardRef(({ className, ...props }, ref)=>/*#__PURE__*/ jsx(List, {
        ref: ref,
        className: cn("inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground", className),
        ...props
    }));
TabsList.displayName = List.displayName;
const TabsTrigger = /*#__PURE__*/ forwardRef(({ className, ...props }, ref)=>/*#__PURE__*/ jsx(Trigger, {
        ref: ref,
        className: cn("inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-xs", className),
        ...props
    }));
TabsTrigger.displayName = Trigger.displayName;
const TabsContent = /*#__PURE__*/ forwardRef(({ className, ...props }, ref)=>/*#__PURE__*/ jsx(Content, {
        ref: ref,
        className: cn("mt-2 ring-offset-background focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2", className),
        ...props
    }));
TabsContent.displayName = Content.displayName;
export { Tabs, TabsContent, TabsList, TabsTrigger };
