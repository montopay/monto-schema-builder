import { cn } from "@/lib/utils";
import { type ObjectJSONSchema, type JSONSchema, type SchemaType, type NewField, isObjectSchema, asObjectSchema } from "@/types/jsonSchema";
import { ChevronDown, ChevronRight, Settings } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { getTypeColor, getTypeLabel } from "../SchemaField";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Suspense, lazy } from "react";

// Lazy load components to avoid circular dependencies
const ObjectSchema = lazy(() => import("./ObjectSchema"));

interface ArrayItemTypeProps {
    schema: JSONSchema;
    onEdit: (validation: ObjectJSONSchema) => void;
    depth?: number;
}

const ArrayItemType: React.FC<ArrayItemTypeProps> = ({
    schema,
    onEdit,
    depth = 0,
}) => {
    const [isTypeOpen, setIsTypeOpen] = useState(false);
    const [isConfigOpen, setIsConfigOpen] = useState(false);
    const typeDropdownRef = useRef<HTMLDivElement>(null);
    const type =
        typeof schema === "boolean"
            ? "string"
            : ((schema.type || "string") as SchemaType);

    // Array validation settings
    const [minItems, setMinItems] = useState<number | undefined>(
        typeof schema === "boolean" ? undefined : schema.minItems
    );
    const [maxItems, setMaxItems] = useState<number | undefined>(
        typeof schema === "boolean" ? undefined : schema.maxItems
    );
    const [uniqueItems, setUniqueItems] = useState<boolean>(
        typeof schema === "boolean" ? false : schema.uniqueItems || false
    );

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                typeDropdownRef.current &&
                !typeDropdownRef.current.contains(event.target as Node)
            ) {
                setIsTypeOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleItemTypeChange = (type: SchemaType) => {
        const newItemSchema: ObjectJSONSchema = {
            type,
            minItems,
            maxItems,
            uniqueItems,
        };
        if (type === "array") {
            newItemSchema.items = { type: "string" };
        } else if (type === "object") {
            newItemSchema.properties = {};
            newItemSchema.required = [];
        }
        onEdit(newItemSchema);
        setIsTypeOpen(false);
    };

    const applyValidationSettings = () => {
        onEdit({
            minItems,
            maxItems,
            uniqueItems,
        });
    };

    // Handle updates to nested schema types (object or array)
    const handleNestedObjectPropertyEdit = (updatedField: NewField) => {
        if (!isObjectSchema(schema)) {
            throw new Error("Invalid schema");
        }
        if (schema.type === "array") {
            onEdit({
                ...schema,
                items: updatedField.validation,
            });
        } else if (schema.type === "object") {
            onEdit({
                ...schema,
                properties: {
                    ...schema.properties,
                    [updatedField.name]: updatedField.validation,
                },
            });
        }
    };

    return (
        <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="text-sm font-medium">Array items are of type:</div>

                    <div className="relative" ref={typeDropdownRef}>
                        <button
                            type="button"
                            onClick={() => setIsTypeOpen(!isTypeOpen)}
                            onKeyDown={(e) => e.key === "Enter" && setIsTypeOpen(!isTypeOpen)}
                            className={cn(
                                "text-sm px-3.5 py-1.5 rounded-md font-medium text-left cursor-pointer hover:shadow-sm hover:ring-1 hover:ring-ring/20 active:scale-[0.98] transition-all flex items-center justify-between gap-2 whitespace-nowrap min-w-[92px]",
                                getTypeColor(type),
                                isTypeOpen && "ring-2 ring-ring/30",
                            )}
                        >
                            {getTypeLabel(type)}
                            <ChevronDown
                                size={14}
                                className={cn(
                                    "text-current opacity-60 transition-transform duration-200",
                                    isTypeOpen && "rotate-180",
                                )}
                            />
                        </button>
                        <div
                            className={cn(
                                "fixed sm:absolute sm:left-0 left-4 sm:left-auto bottom-4 sm:bottom-auto sm:top-[calc(100%+6px)] w-[calc(100%-32px)] sm:w-[160px] rounded-lg shadow-lg border border-border/40 bg-popover/95 backdrop-blur-sm p-2 transition-all duration-200 origin-bottom sm:origin-top-left z-50",
                                isTypeOpen
                                    ? "scale-100 opacity-100"
                                    : "scale-95 opacity-0 pointer-events-none",
                            )}
                        >
                            {(["string", "number", "boolean", "object", "array"] as const).map(
                                (t, i) => (
                                    <button
                                        type="button"
                                        key={t}
                                        onClick={() => handleItemTypeChange(t)}
                                        className={cn(
                                            "w-full text-left px-3 py-2 text-sm rounded-md transition-all duration-150 flex items-center justify-between gap-2 group relative",
                                            getTypeColor(t),
                                            "hover:ring-1 hover:ring-ring/20 hover:shadow-sm",
                                            t === type && "ring-1 ring-ring/40 shadow-sm",
                                            i > 0 && "mt-2",
                                        )}
                                    >
                                        <span className="font-medium">{getTypeLabel(t)}</span>
                                        {t === type && (
                                            <ChevronRight
                                                size={14}
                                                className="text-current opacity-60"
                                            />
                                        )}
                                    </button>
                                ),
                            )}
                        </div>
                    </div>
                </div>

                <Popover open={isConfigOpen} onOpenChange={setIsConfigOpen}>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            size="sm"
                            className="gap-1 text-muted-foreground hover:text-foreground"
                        >
                            <Settings size={14} />
                            <span className="hidden sm:inline">Array Settings</span>
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80">
                        <Tabs defaultValue="validation">
                            <TabsList className="grid w-full grid-cols-1">
                                <TabsTrigger value="validation">Validation</TabsTrigger>
                            </TabsList>
                            <TabsContent value="validation" className="space-y-4 pt-4">
                                <div className="grid gap-2">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="minItems">Min Items</Label>
                                            <Input
                                                id="minItems"
                                                type="number"
                                                min={0}
                                                value={minItems || ""}
                                                onChange={(e) => {
                                                    const value = e.target.value ? Number.parseInt(e.target.value) : undefined;
                                                    setMinItems(value);
                                                }}
                                                placeholder="No minimum"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="maxItems">Max Items</Label>
                                            <Input
                                                id="maxItems"
                                                type="number"
                                                min={0}
                                                value={maxItems || ""}
                                                onChange={(e) => {
                                                    const value = e.target.value ? Number.parseInt(e.target.value) : undefined;
                                                    setMaxItems(value);
                                                }}
                                                placeholder="No maximum"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2 pt-2">
                                        <Switch
                                            id="uniqueItems"
                                            checked={uniqueItems}
                                            onCheckedChange={setUniqueItems}
                                        />
                                        <Label htmlFor="uniqueItems">Force unique items</Label>
                                    </div>
                                </div>
                                <Button
                                    className="w-full"
                                    onClick={() => {
                                        applyValidationSettings();
                                        setIsConfigOpen(false);
                                    }}
                                >
                                    Apply Settings
                                </Button>
                            </TabsContent>
                        </Tabs>
                    </PopoverContent>
                </Popover>
            </div>

            {/* Type preview - simplified */}
            <div className={cn(
                "p-2 rounded-md border bg-background/50",
                getTypeColor(type).replace("bg-", "border-").replace("50", "200")
            )}>
                <div className="text-sm font-medium flex items-center gap-2">
                    <div className={cn("w-2 h-2 rounded-full", getTypeColor(type))} />
                    <span>{getTypeLabel(type)} value</span>
                </div>
            </div>

            {/* Object schema editor section always visible for object types */}
            {type === "object" && (
                <div className="mt-1 pl-4 border-l border-dashed border-border/60">
                    <Suspense fallback={<div className="text-sm py-2">Loading object editor...</div>}>
                        <ObjectSchema
                            schema={typeof schema === "boolean"
                                ? { type: "object" as const }
                                : { ...(schema as object), type: "object" as const }}
                            onEdit={handleNestedObjectPropertyEdit}
                            isNested={true}
                            depth={depth + 1}
                        />
                    </Suspense>
                </div>
            )}

            {/* Array schema editor section for array types */}
            {type === "array" && (
                <div className="mt-1 pl-4 border-l border-dashed border-border/60">
                    <Suspense fallback={<div className="text-sm py-2">Loading array editor...</div>}>
                        <ArrayItemType
                            schema={asObjectSchema(schema).items}
                            onEdit={(subItemSchema) => {
                                if (!isObjectSchema(schema)) throw new Error("Invalid schema");
                                onEdit({
                                    ...schema,
                                    items: subItemSchema,
                                });
                            }}
                            depth={depth + 1}
                        />
                    </Suspense>
                </div>
            )}
        </div>
    );
};

export default ArrayItemType;