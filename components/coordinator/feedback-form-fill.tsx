'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { submitFeedbackAction } from '@/app/actions/feedback'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import type { FeedbackTemplate, FeedbackField } from '@/lib/types'

export function FeedbackFormFill({
  template,
  fields,
}: {
  template: FeedbackTemplate & { event_title: string }
  fields: FeedbackField[]
}) {
  const router = useRouter()
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({})
  const [submitting, setSubmitting] = useState(false)

  const updateAnswer = (fieldId: number, value: string | string[]) => {
    setAnswers((prev) => ({ ...prev, [fieldId.toString()]: value }))
  }

  const handleSubmit = async () => {
    // Validate required fields
    for (const field of fields) {
      if (field.is_required) {
        const val = answers[field.id.toString()]
        if (!val || (Array.isArray(val) && val.length === 0) || val === '') {
          toast.error(`Заполните поле: ${field.label}`)
          return
        }
      }
    }

    setSubmitting(true)
    const result = await submitFeedbackAction(template.id, answers)
    setSubmitting(false)

    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success(result.success)
      router.push('/dashboard/feedback')
    }
  }

  const renderField = (field: FeedbackField) => {
    const fieldKey = field.id.toString()
    const options = field.options ? field.options.split(',').map((o) => o.trim()).filter(Boolean) : []

    switch (field.field_type) {
      case 'text':
        return (
          <Input
            value={(answers[fieldKey] as string) || ''}
            onChange={(e) => updateAnswer(field.id, e.target.value)}
            placeholder="Введите ответ"
          />
        )
      case 'textarea':
        return (
          <Textarea
            value={(answers[fieldKey] as string) || ''}
            onChange={(e) => updateAnswer(field.id, e.target.value)}
            placeholder="Введите ответ"
            rows={3}
          />
        )
      case 'select':
        return (
          <Select value={(answers[fieldKey] as string) || ''} onValueChange={(v) => updateAnswer(field.id, v)}>
            <SelectTrigger>
              <SelectValue placeholder="Выберите вариант" />
            </SelectTrigger>
            <SelectContent>
              {options.map((opt) => (
                <SelectItem key={opt} value={opt}>{opt}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )
      case 'radio':
        return (
          <RadioGroup
            value={(answers[fieldKey] as string) || ''}
            onValueChange={(v) => updateAnswer(field.id, v)}
          >
            {options.map((opt) => (
              <div key={opt} className="flex items-center gap-2">
                <RadioGroupItem value={opt} id={`${fieldKey}-${opt}`} />
                <Label htmlFor={`${fieldKey}-${opt}`} className="font-normal">{opt}</Label>
              </div>
            ))}
          </RadioGroup>
        )
      case 'checkbox':
        return (
          <div className="flex flex-col gap-2">
            {options.map((opt) => {
              const current = (answers[fieldKey] as string[]) || []
              return (
                <div key={opt} className="flex items-center gap-2">
                  <Checkbox
                    id={`${fieldKey}-${opt}`}
                    checked={current.includes(opt)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        updateAnswer(field.id, [...current, opt])
                      } else {
                        updateAnswer(field.id, current.filter((v) => v !== opt))
                      }
                    }}
                  />
                  <Label htmlFor={`${fieldKey}-${opt}`} className="font-normal">{opt}</Label>
                </div>
              )
            })}
          </div>
        )
      case 'rating':
        return (
          <div className="flex items-center gap-1">
            {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => updateAnswer(field.id, n.toString())}
                className={`flex h-9 w-9 items-center justify-center rounded-md border text-sm font-medium transition-colors ${
                  (answers[fieldKey] as string) === n.toString()
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-input bg-card hover:bg-accent'
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        )
      default:
        return null
    }
  }

  return (
    <>
      <h1 className="text-xl font-bold">{template.title}</h1>
      <p className="mt-1 text-sm text-muted-foreground">{template.event_title}</p>

      <Card className="mt-6 max-w-2xl">
        <CardContent className="flex flex-col gap-6 pt-6">
          {fields.map((field) => (
            <div key={field.id} className="flex flex-col gap-2">
              <Label>
                {field.label}
                {field.is_required === 1 && <span className="ml-1 text-destructive">*</span>}
              </Label>
              {renderField(field)}
            </div>
          ))}
          <Button onClick={handleSubmit} disabled={submitting} className="self-start">
            {submitting ? 'Отправка...' : 'Отправить'}
          </Button>
        </CardContent>
      </Card>
    </>
  )
}
