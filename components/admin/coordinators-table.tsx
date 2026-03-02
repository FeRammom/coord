'use client'

import { useState } from 'react'
import type { User } from '@/lib/types'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Trash2, ArrowUpDown } from 'lucide-react'
import { deleteCoordinatorAction } from '@/app/actions/coordinators'
import { CoordinatorFormDialog } from './coordinator-form-dialog'

export function CoordinatorsTable({ coordinators }: { coordinators: User[] }) {
  const [search, setSearch] = useState('')
  const [sortKey, setSortKey] = useState<'full_name' | 'email' | 'organization'>('full_name')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')

  const toggleSort = (key: typeof sortKey) => {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  const filtered = coordinators
    .filter((c) =>
      c.full_name.toLowerCase().includes(search.toLowerCase()) ||
      (c.email && c.email.toLowerCase().includes(search.toLowerCase())) ||
      (c.organization && c.organization.toLowerCase().includes(search.toLowerCase()))
    )
    .sort((a, b) => {
      const aVal = a[sortKey] ?? ''
      const bVal = b[sortKey] ?? ''
      const cmp = String(aVal).localeCompare(String(bVal))
      return sortDir === 'asc' ? cmp : -cmp
    })

  return (
    <div className="flex flex-col gap-4">
      <Input
        placeholder="Поиск по имени, email, организации..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-sm"
      />
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <button onClick={() => toggleSort('full_name')} className="flex items-center gap-1 font-medium">
                  ФИО <ArrowUpDown className="h-3 w-3" />
                </button>
              </TableHead>
              <TableHead>Логин</TableHead>
              <TableHead>
                <button onClick={() => toggleSort('email')} className="flex items-center gap-1 font-medium">
                  Email <ArrowUpDown className="h-3 w-3" />
                </button>
              </TableHead>
              <TableHead>Телефон</TableHead>
              <TableHead>
                <button onClick={() => toggleSort('organization')} className="flex items-center gap-1 font-medium">
                  Организация <ArrowUpDown className="h-3 w-3" />
                </button>
              </TableHead>
              <TableHead>Дата регистрации</TableHead>
              <TableHead className="text-right">Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                  Координаторов не найдено
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((coord) => (
                <TableRow key={coord.id}>
                  <TableCell className="font-medium">{coord.full_name}</TableCell>
                  <TableCell className="text-muted-foreground">{coord.login}</TableCell>
                  <TableCell>{coord.email || '—'}</TableCell>
                  <TableCell>{coord.phone || '—'}</TableCell>
                  <TableCell>{coord.organization || '—'}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(coord.created_at).toLocaleDateString('ru-RU')}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <CoordinatorFormDialog mode="edit" coordinator={coord} />
                      <form
                        action={async () => {
                          'use server'
                          await deleteCoordinatorAction(coord.id)
                        }}
                      >
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className="text-destructive hover:text-destructive"
                          title="Удалить"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </form>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
