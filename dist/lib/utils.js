import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
function cn(...inputs) {
    return twMerge(clsx(inputs));
}
const getTypeColor = (type)=>{
    switch(type){
        case "string":
            return "text-blue-500 bg-blue-50";
        case "number":
        case "integer":
            return "text-purple-500 bg-purple-50";
        case "boolean":
            return "text-green-500 bg-green-50";
        case "object":
            return "text-orange-500 bg-orange-50";
        case "array":
            return "text-pink-500 bg-pink-50";
        case "null":
            return "text-gray-500 bg-gray-50";
    }
};
const getTypeLabel = (t, type)=>{
    switch(type){
        case "string":
            return t.schemaTypeString;
        case "number":
        case "integer":
            return t.schemaTypeNumber;
        case "boolean":
            return t.schemaTypeBoolean;
        case "object":
            return t.schemaTypeObject;
        case "array":
            return t.schemaTypeArray;
        case "null":
            return t.schemaTypeNull;
    }
};
export { cn, getTypeColor, getTypeLabel };
