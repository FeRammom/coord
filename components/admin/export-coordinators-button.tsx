'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Download, Loader2 } from 'lucide-react'

interface CoordinatorData {
  id: number
  full_name: string
  direction: string
  group_name: string
  phone: string
  residence: string
  avg_rating: number | null
  ratings_count: number
}

interface RatingDetail {
  event_id: number
  event_title: string
  event_date: string
  score: number
  admin_full_name: string
}

export function ExportCoordinatorsButton({
  coordinators,
  ratingsByUser,
}: {
  coordinators: CoordinatorData[]
  ratingsByUser: Record<number, RatingDetail[]>
}) {
  const [loading, setLoading] = useState(false)

  async function handleExport() {
    setLoading(true)
    try {
      const response = await fetch('/api/export/coordinators', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ coordinators, ratingsByUser }),
      })
      if (!response.ok) throw new Error('Export failed')
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'coordinators.xlsx'
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      // silently fail
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button onClick={handleExport} variant="outline" size="sm" disabled={loading}>
      {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
      Выгрузить в Excel
    </Button>
  )
}
