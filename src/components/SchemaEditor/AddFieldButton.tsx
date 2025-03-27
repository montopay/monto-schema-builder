import type React from "react";
import { useState } from "react";
import { CirclePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import SchemaTypeSelector from "./SchemaTypeSelector";

interface AddFieldButtonProps {
  onAddField: (field: {
    name: string;
    type: string;
    description: string;
    required: boolean;
  }) => void;
  variant?: "primary" | "secondary";
}

const AddFieldButton: React.FC<AddFieldButtonProps> = ({
  onAddField,
  variant = "primary",
}) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [fieldName, setFieldName] = useState("");
  const [fieldType, setFieldType] = useState("string");
  const [fieldDesc, setFieldDesc] = useState("");
  const [fieldRequired, setFieldRequired] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fieldName.trim()) return;

    onAddField({
      name: fieldName,
      type: fieldType,
      description: fieldDesc,
      required: fieldRequired,
    });

    setFieldName("");
    setFieldType("string");
    setFieldDesc("");
    setFieldRequired(false);
    setDialogOpen(false);
  };

  return (
    <>
      <Button
        onClick={() => setDialogOpen(true)}
        variant={variant === "primary" ? "default" : "outline"}
        size="sm"
        className="flex items-center gap-1.5 group"
      >
        <CirclePlus
          size={16}
          className="group-hover:scale-110 transition-transform"
        />
        <span>Add Field</span>
      </Button>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[425px] animate-in">
          <DialogHeader>
            <DialogTitle>Add New Field</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            <div className="space-y-2">
              <label htmlFor="fieldName" className="text-sm font-medium">
                Field Name
              </label>
              <Input
                id="fieldName"
                value={fieldName}
                onChange={(e) => setFieldName(e.target.value)}
                placeholder="e.g. firstName, age, isActive"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="fieldType" className="text-sm font-medium">
                Field Type
              </label>
              <SchemaTypeSelector id="fieldType" value={fieldType} onChange={setFieldType} />
            </div>

            <div className="space-y-2">
              <label htmlFor="fieldDesc" className="text-sm font-medium">
                Description (Optional)
              </label>
              <Input
                id="fieldDesc"
                value={fieldDesc}
                onChange={(e) => setFieldDesc(e.target.value)}
                placeholder="What this field represents"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="fieldRequired"
                checked={fieldRequired}
                onChange={(e) => setFieldRequired(e.target.checked)}
                className="rounded border-gray-300"
              />
              <label htmlFor="fieldRequired" className="text-sm font-medium">
                Is this field required?
              </label>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Add Field</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AddFieldButton;
