'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Trash2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface FieldItem {
  tempId: string
  field_type: string
  label: string
  options: string
  is_required: boolean
}

const fieldTypeLabels: Record<string, string> = {
  text: 'Текстовое поле',
  textarea: 'Многострочный текст',
  select: 'Выпадающий список',
  radio: 'Радио-кнопки',
  checkbox: 'Чекбоксы',
  rating: 'Оценка (1-10)',
}

const needsOptions = ['select', 'radio', 'checkbox']

interface SortableFieldProps {
  field: FieldItem
  onUpdate: (updates: Partial<FieldItem>) => void
  onRemove: () => void
}

export function SortableField({ field, onUpdate, onRemove }: SortableFieldProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: field.tempId })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex gap-3 rounded-lg border bg-card p-4"
    >
      <button
        type="button"
        className="mt-1 cursor-grab text-muted-foreground hover:text-foreground active:cursor-grabbing"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-5 w-5" />
      </button>
      <div className="flex flex-1 flex-col gap-3">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs">Название поля</Label>
            <Input
              value={field.label}
              onChange={(e) => onUpdate({ label: e.target.value })}
              placeholder="Введите название"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs">Тип поля</Label>
            <Select value={field.field_type} onValueChange={(v) => onUpdate({ field_type: v })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(fieldTypeLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        {needsOptions.includes(field.field_type) && (
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs">Варианты ответов (через запятую)</Label>
            <Input
              value={field.options}
              onChange={(e) => onUpdate({ options: e.target.value })}
              placeholder="Вариант 1, Вариант 2, Вариант 3"
            />
          </div>
        )}
        <div className="flex items-center gap-3">
          <Switch
            checked={field.is_required}
            onCheckedChange={(v) => onUpdate({ is_required: v })}
          />
          <Label className="text-xs">Обязательное поле</Label>
        </div>
      </div>
      <Button
        variant="ghost"
        size="icon-sm"
        className="mt-1 text-destructive hover:text-destructive"
        onClick={onRemove}
        title="Удалить поле"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  )
}
