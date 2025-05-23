'use client'

import CategoryTree from "./CategoryTree/CategoryTree";
import CategoryActions from "./CategoryActions";
import { Card } from "@/components/ui/card";
import { useState } from "react";
import axios from "axios";

interface Category {
  name: string,
  subcategories: Array<string>
}

export default function CategoriesConstructor({ _categories }: { _categories: Category[] }) {
  const [categories, setCategories] = useState<Category[]>(_categories);

  const handleSendCategories = () => {
    axios.post('/api/dataFetching/categories/setCategories', { categories });
  };

  return (
    <div className="flex flex-col h-full p-4 gap-4">
      <div className="flex justify-between items-center px-2">
        <h1 className="text-2xl font-bold text-slate-800">Редактор категорий</h1>
        <CategoryActions
          onSave={handleSendCategories}
          onAddCategory={() => setCategories([...categories, {
            name: 'Новая категория',
            subcategories: []
          }])}
        />
      </div>

      <Card className="flex-1 p-6 bg-muted/50 overflow-auto">
        <CategoryTree
          categories={categories}
          setCategories={setCategories}
        />
      </Card>
    </div>
  );
}