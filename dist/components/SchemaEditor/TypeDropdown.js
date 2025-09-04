import { jsx, jsxs } from "react/jsx-runtime";
import { Check, ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cn, getTypeColor, getTypeLabel } from "../../lib/utils.js";
import { useTranslation } from "../../hooks/use-translation.js";
const typeOptions = [
    "string",
    "number",
    "boolean",
    "object",
    "array",
    "null"
];
const TypeDropdown_TypeDropdown = ({ value, onChange, className })=>{
    const t = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    useEffect(()=>{
        const handleClickOutside = (event)=>{
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) setIsOpen(false);
        };
        document.addEventListener("mousedown", handleClickOutside);
        return ()=>{
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);
    return /*#__PURE__*/ jsxs("div", {
        className: "relative",
        ref: dropdownRef,
        children: [
            /*#__PURE__*/ jsxs("button", {
                type: "button",
                className: cn("text-xs px-3.5 py-1.5 rounded-md font-medium w-[92px] text-center flex items-center justify-between", getTypeColor(value), "hover:shadow-xs hover:ring-1 hover:ring-ring/30 active:scale-95 transition-all", className),
                onClick: ()=>setIsOpen(!isOpen),
                children: [
                    /*#__PURE__*/ jsx("span", {
                        children: getTypeLabel(t, value)
                    }),
                    /*#__PURE__*/ jsx(ChevronDown, {
                        size: 14,
                        className: "ml-1"
                    })
                ]
            }),
            isOpen && /*#__PURE__*/ jsx("div", {
                className: "absolute z-50 mt-1 w-[140px] rounded-md border bg-popover shadow-lg animate-in fade-in-50 zoom-in-95",
                children: /*#__PURE__*/ jsx("div", {
                    className: "py-1",
                    children: typeOptions.map((type)=>/*#__PURE__*/ jsxs("button", {
                            type: "button",
                            className: cn("w-full text-left px-3 py-1.5 text-xs flex items-center justify-between", "hover:bg-muted/50 transition-colors", value === type && "font-medium"),
                            onClick: ()=>{
                                onChange(type);
                                setIsOpen(false);
                            },
                            children: [
                                /*#__PURE__*/ jsx("span", {
                                    className: cn("px-2 py-0.5 rounded", getTypeColor(type)),
                                    children: getTypeLabel(t, type)
                                }),
                                value === type && /*#__PURE__*/ jsx(Check, {
                                    size: 14
                                })
                            ]
                        }, type))
                })
            })
        ]
    });
};
const TypeDropdown = TypeDropdown_TypeDropdown;
export { TypeDropdown_TypeDropdown as TypeDropdown, TypeDropdown as default };
