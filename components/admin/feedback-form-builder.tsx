'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { PageHeader } from '@/components/page-header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Plus, Save } from 'lucide-react'
import { createFeedbackTemplateAction, updateFeedbackTemplateAction } from '@/app/actions/feedback'
import { SortableField } from './sortable-field'
import { toast } from 'sonner'
import type { Event, FeedbackTemplate } from '@/lib/types'

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

export function FeedbackFormBuilder({
  events,
  template,
}: {
  events: Event[]
  template?: FeedbackTemplate
}) {
  const router = useRouter()
  const [title, setTitle] = useState(template?.title || '')
  const [eventId, setEventId] = useState(template?.event_id?.toString() || '')
  const [isActive, setIsActive] = useState(template?.is_active === 1 || template?.is_active === undefined)
  const [fields, setFields] = useState<FieldItem[]>(
    template?.fields?.map((f, i) => ({
      tempId: `field-${i}-${Date.now()}`,
      field_type: f.field_type,
      label: f.label,
      options: f.options || '',
      is_required: f.is_required === 1,
    })) || []
  )
  const [saving, setSaving] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const addField = () => {
    setFields([
      ...fields,
      {
        tempId: `field-${Date.now()}`,
        field_type: 'text',
        label: '',
        options: '',
        is_required: false,
      },
    ])
  }

  const removeField = (tempId: string) => {
    setFields(fields.filter((f) => f.tempId !== tempId))
  }

  const updateField = (tempId: string, updates: Partial<FieldItem>) => {
    setFields(fields.map((f) => (f.tempId === tempId ? { ...f, ...updates } : f)))
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (over && active.id !== over.id) {
      setFields((items) => {
        const oldIndex = items.findIndex((i) => i.tempId === active.id)
        const newIndex = items.findIndex((i) => i.tempId === over.id)
        return arrayMove(items, oldIndex, newIndex)
      })
    }
  }

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error('Введите название формы')
      return
    }
    if (!eventId) {
      toast.error('Выберите мероприятие')
      return
    }
    if (fields.length === 0) {
      toast.error('Добавьте хотя бы одно поле')
      return
    }
    const emptyLabel = fields.find((f) => !f.label.trim())
    if (emptyLabel) {
      toast.error('Заполните названия всех полей')
      return
    }

    setSaving(true)

    const fieldData = fields.map((f, i) => ({
      field_type: f.field_type,
      label: f.label,
      options: f.options || null,
      is_required: f.is_required ? 1 : 0,
      sort_order: i,
    }))

    try {
      if (template) {
        await updateFeedbackTemplateAction({
          id: template.id,
          title,
          is_active: isActive ? 1 : 0,
          fields: fieldData,
        })
        toast.success('Форма обновлена')
      } else {
        await createFeedbackTemplateAction({
          event_id: parseInt(eventId),
          title,
          fields: fieldData,
        })
        toast.success('Форма создана')
      }
      router.push('/admin/feedback')
    } catch {
      toast.error('Ошибка при сохранении')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <PageHeader
        title={template ? 'Редактировать форму' : 'Новая форма обратной связи'}
        description="Конструктор формы с перетаскиванием полей"
      >
        <Button onClick={handleSave} disabled={saving}>
          <Save className="h-4 w-4" />
          {saving ? 'Сохранение...' : 'Сохранить'}
        </Button>
      </PageHeader>
      <div className="flex-1 p-6">
        <div className="mx-auto max-w-3xl flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Основные настройки</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="title">Название формы *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Например: Обратная связь по мероприятию"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="event">Мероприятие *</Label>
                <Select value={eventId} onValueChange={setEventId} disabled={!!template}>
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите мероприятие" />
                  </SelectTrigger>
                  <SelectContent>
                    {events.map((e) => (
                      <SelectItem key={e.id} value={e.id.toString()}>
                        {e.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {template && (
                <div className="flex items-center gap-3">
                  <Switch
                    id="is_active"
                    checked={isActive}
                    onCheckedChange={setIsActive}
                  />
                  <Label htmlFor="is_active">Форма активна</Label>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Поля формы</CardTitle>
              <Button size="sm" variant="outline" onClick={addField}>
                <Plus className="h-4 w-4" />
                Добавить поле
              </Button>
            </CardHeader>
            <CardContent>
              {fields.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  Добавьте поля формы, нажав кнопку выше
                </p>
              ) : (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={fields.map((f) => f.tempId)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="flex flex-col gap-3">
                      {fields.map((field) => (
                        <SortableField
                          key={field.tempId}
                          field={field}
                          onUpdate={(updates) => updateField(field.tempId, updates)}
                          onRemove={() => removeField(field.tempId)}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}
