import axios from "axios";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import CategoryTree from "./CategoryTree";

interface Category {
  name: string,
  subcategories: Array<string>
}

export default function CategoriesConstructor({ _categories }: { _categories: Category[] }) {

  const [categories, setCategories] = useState<Category[]>(_categories);

  const handleAddCategory = () => {
    setCategories((prev) => [
      ...prev,
      {
        name: 'Название',
        subcategories: ['Подкатегория 1']
      }
    ]);
  }

  const handleAddSubCategory = (id: number) => {
    setCategories((prev) => {
      return prev.map((category, index) => {
        if (index === id) {
          return {
            ...category,
            subcategories: [...category.subcategories, 'Подкатегория']
          };
        }
        return category;
      });
    });
  }

  const handleDeleteSubCategory = (id: number, idx: number) => {
    setCategories((prev) => {
      return prev.map((category, categoryIndex) => {
        if (categoryIndex === id) {
          const updatedSubcategories = category.subcategories.filter(
            (_, subcatIndex) => subcatIndex !== idx
          );

          return {
            ...category,
            subcategories: updatedSubcategories
          };
        }
        return category;
      });
    });
  }

  const handleDeleteCategory = (id: number) => {
    setCategories((prev) => {
      return prev.filter((_, catId) => {
        return catId !== id;
      })
    });
  }

  const handleSendCategories = () => {
    axios.post('/api/dataFetching/categories/setCategories', { categories });
  }

  return (
    <div className="flex w-full h-full justify-between gap-4">
      <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-8">
        <CategoryTree
          categories={categories}
          setCategories={setCategories}
          handleDeleteCategory={handleDeleteCategory}
          handleAddSubCategory={handleAddSubCategory}
          handleDeleteSubCategory={handleDeleteSubCategory}
        />
      </div>
      <div className="flex flex-col gap-2 justify-start">
        <Button
          className="w-full self-center"
          onClick={handleSendCategories}
        >
          Отправить
        </Button>
        <Button
          className="w-full self-center bg-green-500 hover:bg-green-800"
          onClick={handleAddCategory}
        >
          Добавить категорию
        </Button>
      </div>
    </div>
  );
}