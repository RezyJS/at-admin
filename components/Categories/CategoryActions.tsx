import { Button } from "../ui/button";

export default function CategoryActions({
  onSave,
  onAddCategory
}: {
  onSave: () => void
  onAddCategory: () => void
}) {
  return (
    <div className="flex gap-2">
      <Button
        onClick={onSave}
        className="bg-primary hover:bg-primary/90"
      >
        Сохранить
      </Button>
      <Button
        onClick={onAddCategory}
        variant="secondary"
        className="bg-emerald-600 hover:bg-emerald-700 text-white"
      >
        + Категория
      </Button>
    </div>
  );
}