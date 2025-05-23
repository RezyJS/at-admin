'use client'

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Pen, Trash2 } from "lucide-react";
import { useState } from "react";

export default function SubCategoryItem({
  value,
  onEdit,
  onDelete
}: {
  value: string
  onEdit: (value: string) => void
  onDelete: () => void
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [tempValue, setTempValue] = useState(value);

  const handleSave = () => {
    onEdit(tempValue);
    setIsEditing(false);
  };

  return (
    <div className="flex gap-2 items-center group group/edit">
      <div className="flex gap-1 opacity-0 group-hover/edit:opacity-100 transition-opacity">
        {!isEditing && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setIsEditing(true)}
          >
            <Pen className="h-4 w-4 text-slate-500" />
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={onDelete}
        >
          <Trash2 className="h-4 w-4 text-red-500" />
        </Button>
      </div>

      <Input
        value={tempValue}
        readOnly={!isEditing}
        onChange={(e) => setTempValue(e.target.value)}
        onBlur={handleSave}
        onKeyDown={(e) => e.key === 'Enter' && handleSave()}
        className={`border-l-4 ${isEditing
            ? 'border-l-primary bg-white'
            : 'border-l-slate-200 bg-transparent'
          }`}
      />
    </div>
  );
}