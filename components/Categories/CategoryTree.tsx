import { Trash2 } from "lucide-react";
import { Dispatch, SetStateAction } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Category {
  name: string,
  subcategories: Array<string>
}

export default function CategoryTree({
  categories,
  setCategories,
  handleDeleteCategory,
  handleAddSubCategory,
  handleDeleteSubCategory
}: {
  categories: Category[],
  setCategories: Dispatch<SetStateAction<Category[]>>,
  handleDeleteCategory: (id: number) => void,
  handleAddSubCategory: (id: number) => void,
  handleDeleteSubCategory: (id: number, idx: number) => void
}) {
  return (
    <>
      {categories.map(({ name, subcategories }, categoryIdx) => (
        <div key={`category-${categoryIdx}`} className="flex flex-col gap-3">
          <div className="flex gap-2">
            <Button
              onClick={() => handleDeleteCategory(categoryIdx)}
              variant={'ghost'}
            >
              <Trash2 />
            </Button>
            <Input
              value={name}
              onChange={(e) => {
                setCategories(prev =>
                  prev.map((cat, idx) =>
                    idx === categoryIdx
                      ? { ...cat, name: e.target.value }
                      : cat
                  )
                );
              }}
            />
          </div>

          <div className="flex flex-col pl-8 gap-2">
            {subcategories.map((item, subIdx) => (
              <div
                key={`subCat-${categoryIdx}-${subIdx}`}
                className="flex gap-2"
              >
                <Button
                  onClick={() => handleDeleteSubCategory(categoryIdx, subIdx)}
                  variant={'ghost'}
                >
                  <Trash2 />
                </Button>
                <Input
                  value={item}
                  onChange={(e) => {
                    setCategories(prev =>
                      prev.map((cat, idx) =>
                        idx === categoryIdx
                          ? {
                            ...cat,
                            subcategories: cat.subcategories.map((sub, j) =>
                              j === subIdx ? e.target.value : sub
                            )
                          }
                          : cat
                      )
                    );
                  }}
                />
              </div>
            ))}
          </div>

          <Button
            onClick={() => handleAddSubCategory(categoryIdx)}
            className="w-max self-end"
            variant={'ghost'}
          >
            Добавить подкатегорию
          </Button>
        </div>
      ))}
    </>
  );
}