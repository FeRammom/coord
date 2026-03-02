import { PasswordForm } from '@/components/password-form'

export default function DashboardPasswordPage() {
  return (
    <>
      <h1 className="text-xl font-bold">Сменить пароль</h1>
      <p className="mt-1 text-sm text-muted-foreground">Изменение пароля вашей учётной записи</p>
      <div className="mt-6">
        <PasswordForm />
      </div>
    </>
  )
}
