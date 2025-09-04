import { jsx } from "react/jsx-runtime";
import { Root, Thumb } from "@radix-ui/react-switch";
import { forwardRef } from "react";
import { cn } from "../../lib/utils.js";
const Switch = /*#__PURE__*/ forwardRef(({ className, ...props }, ref)=>/*#__PURE__*/ jsx(Root, {
        className: cn("peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input", className),
        ...props,
        ref: ref,
        children: /*#__PURE__*/ jsx(Thumb, {
            className: cn("pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0")
        })
    }));
Switch.displayName = Root.displayName;
export { Switch };
