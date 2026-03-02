import { PageHeader } from '@/components/page-header'
import { PasswordForm } from '@/components/password-form'

export default function AdminPasswordPage() {
  return (
    <>
      <PageHeader title="Сменить пароль" description="Изменение пароля администратора" />
      <div className="p-6">
        <PasswordForm />
      </div>
    </>
  )
}
