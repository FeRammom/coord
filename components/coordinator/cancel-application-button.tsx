'use client'

import { Button } from '@/components/ui/button'
import { cancelApplicationAction } from '@/app/actions/applications'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'
import { X } from 'lucide-react'

export function CancelApplicationButton({ applicationId }: { applicationId: number }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleCancel = async () => {
    setLoading(true)
    const result = await cancelApplicationAction(applicationId)
    setLoading(false)
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success(result.success)
      router.refresh()
    }
  }

  return (
    <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={handleCancel} disabled={loading} title="Отменить заявку">
      <X className="h-4 w-4" />
      {loading ? 'Отмена...' : 'Отменить'}
    </Button>
  )
}
