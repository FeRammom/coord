'use client'

import { Button } from '@/components/ui/button'
import { applyToEventAction } from '@/app/actions/applications'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'

export function ApplyButton({ eventId }: { eventId: number }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleApply = async () => {
    setLoading(true)
    const result = await applyToEventAction(eventId)
    setLoading(false)
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success(result.success)
      router.refresh()
    }
  }

  return (
    <Button size="sm" onClick={handleApply} disabled={loading}>
      {loading ? 'Отправка...' : 'Подать заявку'}
    </Button>
  )
}
