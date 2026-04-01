'use client'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Trash2, ShieldCheck, Shield } from 'lucide-react'
import { AdminFormDialog } from './admin-form-dialog'
import { deleteAdminAction } from '@/app/actions/admins'
import type { User } from '@/lib/types'

interface AdminsTableProps {
  admins: User[]
}

export function AdminsTable({ admins }: AdminsTableProps) {
  return (
    <Card className="py-0 gap-0">
      <CardContent className="p-0">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <span className="text-sm text-muted-foreground">
            Всего: {admins.length}
          </span>
          <AdminFormDialog mode="create" />
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ФИО</TableHead>
                <TableHead>Логин</TableHead>
                <TableHead>Тип</TableHead>
                <TableHead>Дата создания</TableHead>
                <TableHead className="w-24 text-right">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {admins.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                    Нет администраторов
                  </TableCell>
                </TableRow>
              ) : (
                admins.map((admin) => (
                  <TableRow key={admin.id}>
                    <TableCell className="font-medium">{admin.full_name}</TableCell>
                    <TableCell className="text-muted-foreground">{admin.login}</TableCell>
                    <TableCell>
                      {admin.is_super === 1 ? (
                        <Badge variant="default" className="gap-1">
                          <ShieldCheck className="h-3 w-3" />
                          Главный
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="gap-1">
                          <Shield className="h-3 w-3" />
                          Младший
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(admin.created_at).toLocaleDateString('ru-RU')}
                    </TableCell>
                    <TableCell>
                      {admin.is_super !== 1 && (
                        <div className="flex items-center justify-end gap-1">
                          <AdminFormDialog mode="edit" admin={admin} />
                          <form action={deleteAdminAction.bind(null, admin.id)}>
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
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
