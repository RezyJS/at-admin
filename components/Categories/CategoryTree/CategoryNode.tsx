/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Pen, Trash2, Plus } from "lucide-react";
import SubCategoryItem from "./SubCategoryItem";
import { useState } from "react";

interface Category {
  name: string,
  subcategories: Array<string>
}

export default function CategoryNode({
  category,
  onEdit,
  onDelete,
  onAddSubCategory,
  onSubCategoryEdit,
  onSubCategoryDelete
}: {
  category: Category
  onEdit: (name: string) => void
  onDelete: () => void
  onAddSubCategory: () => void
  onSubCategoryEdit: (index: number, value: string) => void
  onSubCategoryDelete: (index: number) => void
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [tempName, setTempName] = useState(category.name);

  const handleSaveName = () => {
    onEdit(tempName);
    setIsEditing(false);
  };

  return (
    <div className="space-y-4 p-4 bg-white rounded-lg shadow-sm border group/edit h-fit">
      <div className="flex gap-2 items-center">
        <div className="flex gap-1 opacity-0 group-hover/edit:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setIsEditing(true)}
          >
            <Pen className="h-4 w-4 text-slate-500" />
          </Button>
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
          value={tempName}
          readOnly={!isEditing}
          onChange={(e) => setTempName(e.target.value)}
          onBlur={handleSaveName}
          onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
          className={`text-lg font-semibold ${isEditing
            ? 'border-b-2 border-b-primary bg-white'
            : 'border-b-transparent'
            }`}
        />
      </div>

      <div className="space-y-2 pl-8 border-l-2 border-l-slate-100">
        {category.subcategories.map((sub: any, index: number) => (
          <SubCategoryItem
            key={index}
            value={sub}
            onEdit={(value) => onSubCategoryEdit(index, value)}
            onDelete={() => onSubCategoryDelete(index)}
          />
        ))}
      </div>

      <Button
        onClick={onAddSubCategory}
        variant="ghost"
        size="sm"
        className="text-sm text-slate-500 hover:text-primary w-full"
      >
        <Plus className="h-4 w-4 mr-2" />
        Добавить подкатегорию
      </Button>
    </div>
  );
}