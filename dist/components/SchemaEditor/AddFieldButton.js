import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { CirclePlus, HelpCircle, Info } from "lucide-react";
import { useId, useState } from "react";
import { Badge } from "../ui/badge.js";
import { Button } from "../ui/button.js";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog.js";
import { Input } from "../ui/input.js";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip.js";
import SchemaTypeSelector from "./SchemaTypeSelector.js";
import { useTranslation } from "../../hooks/use-translation.js";
const AddFieldButton = ({ onAddField, variant = "primary" })=>{
    const [dialogOpen, setDialogOpen] = useState(false);
    const [fieldName, setFieldName] = useState("");
    const [fieldType, setFieldType] = useState("string");
    const [fieldDesc, setFieldDesc] = useState("");
    const [fieldRequired, setFieldRequired] = useState(false);
    const fieldNameId = useId();
    const fieldDescId = useId();
    const fieldRequiredId = useId();
    const fieldTypeId = useId();
    const t = useTranslation();
    const handleSubmit = (e)=>{
        e.preventDefault();
        if (!fieldName.trim()) return;
        onAddField({
            name: fieldName,
            type: fieldType,
            description: fieldDesc,
            required: fieldRequired
        });
        setFieldName("");
        setFieldType("string");
        setFieldDesc("");
        setFieldRequired(false);
        setDialogOpen(false);
    };
    return /*#__PURE__*/ jsxs(Fragment, {
        children: [
            /*#__PURE__*/ jsxs(Button, {
                type: "button",
                onClick: ()=>setDialogOpen(true),
                variant: "primary" === variant ? "default" : "outline",
                size: "sm",
                className: "flex items-center gap-1.5 group",
                children: [
                    /*#__PURE__*/ jsx(CirclePlus, {
                        size: 16,
                        className: "group-hover:scale-110 transition-transform"
                    }),
                    /*#__PURE__*/ jsx("span", {
                        children: t.fieldAddNewButton
                    })
                ]
            }),
            /*#__PURE__*/ jsx(Dialog, {
                open: dialogOpen,
                onOpenChange: setDialogOpen,
                children: /*#__PURE__*/ jsxs(DialogContent, {
                    className: "md:max-w-[1200px] max-h-[85vh] w-[95vw] p-4 sm:p-6 jsonjoy",
                    children: [
                        /*#__PURE__*/ jsxs(DialogHeader, {
                            className: "mb-4",
                            children: [
                                /*#__PURE__*/ jsxs(DialogTitle, {
                                    className: "text-xl flex flex-wrap items-center gap-2",
                                    children: [
                                        t.fieldAddNewLabel,
                                        /*#__PURE__*/ jsx(Badge, {
                                            variant: "secondary",
                                            className: "text-xs",
                                            children: t.fieldAddNewBadge
                                        })
                                    ]
                                }),
                                /*#__PURE__*/ jsx(DialogDescription, {
                                    className: "text-sm",
                                    children: t.fieldAddNewDescription
                                })
                            ]
                        }),
                        /*#__PURE__*/ jsxs("form", {
                            onSubmit: handleSubmit,
                            className: "space-y-6",
                            children: [
                                /*#__PURE__*/ jsxs("div", {
                                    className: "grid grid-cols-1 lg:grid-cols-2 gap-6",
                                    children: [
                                        /*#__PURE__*/ jsxs("div", {
                                            className: "space-y-4 min-w-[280px]",
                                            children: [
                                                /*#__PURE__*/ jsxs("div", {
                                                    children: [
                                                        /*#__PURE__*/ jsxs("div", {
                                                            className: "flex flex-wrap items-center gap-2 mb-1.5",
                                                            children: [
                                                                /*#__PURE__*/ jsx("label", {
                                                                    htmlFor: fieldNameId,
                                                                    className: "text-sm font-medium",
                                                                    children: t.fieldNameLabel
                                                                }),
                                                                /*#__PURE__*/ jsx(TooltipProvider, {
                                                                    children: /*#__PURE__*/ jsxs(Tooltip, {
                                                                        children: [
                                                                            /*#__PURE__*/ jsx(TooltipTrigger, {
                                                                                asChild: true,
                                                                                children: /*#__PURE__*/ jsx(Info, {
                                                                                    className: "h-4 w-4 text-muted-foreground shrink-0"
                                                                                })
                                                                            }),
                                                                            /*#__PURE__*/ jsx(TooltipContent, {
                                                                                className: "max-w-[90vw]",
                                                                                children: /*#__PURE__*/ jsx("p", {
                                                                                    children: t.fieldNameTooltip
                                                                                })
                                                                            })
                                                                        ]
                                                                    })
                                                                })
                                                            ]
                                                        }),
                                                        /*#__PURE__*/ jsx(Input, {
                                                            id: fieldNameId,
                                                            value: fieldName,
                                                            onChange: (e)=>setFieldName(e.target.value),
                                                            placeholder: t.fieldNamePlaceholder,
                                                            className: "font-mono text-sm w-full",
                                                            required: true
                                                        })
                                                    ]
                                                }),
                                                /*#__PURE__*/ jsxs("div", {
                                                    children: [
                                                        /*#__PURE__*/ jsxs("div", {
                                                            className: "flex flex-wrap items-center gap-2 mb-1.5",
                                                            children: [
                                                                /*#__PURE__*/ jsx("label", {
                                                                    htmlFor: fieldDescId,
                                                                    className: "text-sm font-medium",
                                                                    children: t.fieldDescription
                                                                }),
                                                                /*#__PURE__*/ jsx(TooltipProvider, {
                                                                    children: /*#__PURE__*/ jsxs(Tooltip, {
                                                                        children: [
                                                                            /*#__PURE__*/ jsx(TooltipTrigger, {
                                                                                asChild: true,
                                                                                children: /*#__PURE__*/ jsx(Info, {
                                                                                    className: "h-4 w-4 text-muted-foreground shrink-0"
                                                                                })
                                                                            }),
                                                                            /*#__PURE__*/ jsx(TooltipContent, {
                                                                                className: "max-w-[90vw]",
                                                                                children: /*#__PURE__*/ jsx("p", {
                                                                                    children: t.fieldDescriptionTooltip
                                                                                })
                                                                            })
                                                                        ]
                                                                    })
                                                                })
                                                            ]
                                                        }),
                                                        /*#__PURE__*/ jsx(Input, {
                                                            id: fieldDescId,
                                                            value: fieldDesc,
                                                            onChange: (e)=>setFieldDesc(e.target.value),
                                                            placeholder: t.fieldDescriptionPlaceholder,
                                                            className: "text-sm w-full"
                                                        })
                                                    ]
                                                }),
                                                /*#__PURE__*/ jsxs("div", {
                                                    className: "flex items-center gap-3 p-3 rounded-lg border bg-muted/50",
                                                    children: [
                                                        /*#__PURE__*/ jsx("input", {
                                                            type: "checkbox",
                                                            id: fieldRequiredId,
                                                            checked: fieldRequired,
                                                            onChange: (e)=>setFieldRequired(e.target.checked),
                                                            className: "rounded border-gray-300 shrink-0"
                                                        }),
                                                        /*#__PURE__*/ jsx("label", {
                                                            htmlFor: fieldRequiredId,
                                                            className: "text-sm",
                                                            children: t.fieldRequiredLabel
                                                        })
                                                    ]
                                                })
                                            ]
                                        }),
                                        /*#__PURE__*/ jsxs("div", {
                                            className: "space-y-4 min-w-[280px]",
                                            children: [
                                                /*#__PURE__*/ jsxs("div", {
                                                    children: [
                                                        /*#__PURE__*/ jsxs("div", {
                                                            className: "flex flex-wrap items-center gap-2 mb-1.5",
                                                            children: [
                                                                /*#__PURE__*/ jsx("label", {
                                                                    htmlFor: fieldTypeId,
                                                                    className: "text-sm font-medium",
                                                                    children: t.fieldType
                                                                }),
                                                                /*#__PURE__*/ jsx(TooltipProvider, {
                                                                    children: /*#__PURE__*/ jsxs(Tooltip, {
                                                                        children: [
                                                                            /*#__PURE__*/ jsx(TooltipTrigger, {
                                                                                asChild: true,
                                                                                children: /*#__PURE__*/ jsx(HelpCircle, {
                                                                                    className: "h-4 w-4 text-muted-foreground shrink-0"
                                                                                })
                                                                            }),
                                                                            /*#__PURE__*/ jsx(TooltipContent, {
                                                                                side: "left",
                                                                                className: "w-72 max-w-[90vw]",
                                                                                children: /*#__PURE__*/ jsxs("div", {
                                                                                    className: "grid grid-cols-2 gap-x-4 gap-y-1 text-xs",
                                                                                    children: [
                                                                                        /*#__PURE__*/ jsxs("div", {
                                                                                            children: [
                                                                                                "\u2022 ",
                                                                                                t.fieldTypeTooltipString
                                                                                            ]
                                                                                        }),
                                                                                        /*#__PURE__*/ jsxs("div", {
                                                                                            children: [
                                                                                                "\u2022 ",
                                                                                                t.fieldTypeTooltipNumber
                                                                                            ]
                                                                                        }),
                                                                                        /*#__PURE__*/ jsxs("div", {
                                                                                            children: [
                                                                                                "\u2022 ",
                                                                                                t.fieldTypeTooltipBoolean
                                                                                            ]
                                                                                        }),
                                                                                        /*#__PURE__*/ jsxs("div", {
                                                                                            children: [
                                                                                                "\u2022 ",
                                                                                                t.fieldTypeTooltipObject
                                                                                            ]
                                                                                        }),
                                                                                        /*#__PURE__*/ jsxs("div", {
                                                                                            className: "col-span-2",
                                                                                            children: [
                                                                                                "\u2022 ",
                                                                                                t.fieldTypeTooltipArray
                                                                                            ]
                                                                                        })
                                                                                    ]
                                                                                })
                                                                            })
                                                                        ]
                                                                    })
                                                                })
                                                            ]
                                                        }),
                                                        /*#__PURE__*/ jsx(SchemaTypeSelector, {
                                                            id: fieldTypeId,
                                                            value: fieldType,
                                                            onChange: setFieldType
                                                        })
                                                    ]
                                                }),
                                                /*#__PURE__*/ jsxs("div", {
                                                    className: "rounded-lg border bg-muted/50 p-3 hidden md:block",
                                                    children: [
                                                        /*#__PURE__*/ jsx("p", {
                                                            className: "text-xs font-medium mb-2",
                                                            children: t.fieldTypeExample
                                                        }),
                                                        /*#__PURE__*/ jsxs("code", {
                                                            className: "text-sm bg-background/80 p-2 rounded block overflow-x-auto",
                                                            children: [
                                                                "string" === fieldType && '"example"',
                                                                "number" === fieldType && "42",
                                                                "boolean" === fieldType && "true",
                                                                "object" === fieldType && '{ "key": "value" }',
                                                                "array" === fieldType && '["item1", "item2"]'
                                                            ]
                                                        })
                                                    ]
                                                })
                                            ]
                                        })
                                    ]
                                }),
                                /*#__PURE__*/ jsxs(DialogFooter, {
                                    className: "mt-6 gap-2 flex-wrap",
                                    children: [
                                        /*#__PURE__*/ jsx(Button, {
                                            type: "button",
                                            variant: "outline",
                                            size: "sm",
                                            onClick: ()=>setDialogOpen(false),
                                            children: t.fieldAddNewCancel
                                        }),
                                        /*#__PURE__*/ jsx(Button, {
                                            type: "submit",
                                            size: "sm",
                                            children: t.fieldAddNewConfirm
                                        })
                                    ]
                                })
                            ]
                        })
                    ]
                })
            })
        ]
    });
};
const SchemaEditor_AddFieldButton = AddFieldButton;
export { SchemaEditor_AddFieldButton as default };
