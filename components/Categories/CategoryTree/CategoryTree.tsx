/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import CategoryNode from "./CategoryNode";

interface Category {
  name: string,
  subcategories: Array<string>
}

export default function CategoryTree({
  categories,
  setCategories
}: {
  categories: Category[]
  setCategories: (categories: Category[]) => void
}) {
  const handleCategoryEdit = (index: number, name: string) => {
    const newCategories = [...categories];
    newCategories[index].name = name;
    setCategories(newCategories);
  };

  const handleSubCategoryEdit = (categoryIndex: number, subIndex: number, value: string) => {
    const newCategories = [...categories];
    newCategories[categoryIndex].subcategories[subIndex] = value;
    setCategories(newCategories);
  };

  const handleAddSubCategory = (index: number) => {
    const newCategories = [...categories];
    newCategories[index].subcategories.push('Новая подкатегория');
    setCategories(newCategories);
  };

  const handleSubCategoryDelete = (categoryIndex: number, subIndex: number) => {
    const newCategories = [...categories];
    newCategories[categoryIndex].subcategories =
      newCategories[categoryIndex].subcategories.filter((_: any, i: number) => i !== subIndex);
    setCategories(newCategories);
  };

  const handleCategoryDelete = (index: number) => {
    setCategories(categories.filter((_, i) => i !== index));
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6 w-full">
      {categories.map((category, index) => (
        <CategoryNode
          key={index}
          category={category}
          onEdit={(name) => handleCategoryEdit(index, name)}
          onDelete={() => handleCategoryDelete(index)}
          onAddSubCategory={() => handleAddSubCategory(index)}
          onSubCategoryEdit={(subIndex, value) =>
            handleSubCategoryEdit(index, subIndex, value)}
          onSubCategoryDelete={(subIndex) =>
            handleSubCategoryDelete(index, subIndex)}
        />
      ))}
    </div>
  );
}