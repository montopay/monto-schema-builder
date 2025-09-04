import { jsx } from "react/jsx-runtime";
import { Root } from "@radix-ui/react-label";
import { cva } from "class-variance-authority";
import { forwardRef } from "react";
import { cn } from "../../lib/utils.js";
const labelVariants = cva("text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70");
const Label = /*#__PURE__*/ forwardRef(({ className, ...props }, ref)=>/*#__PURE__*/ jsx(Root, {
        ref: ref,
        className: cn(labelVariants(), className),
        ...props
    }));
Label.displayName = Root.displayName;
export { Label };
