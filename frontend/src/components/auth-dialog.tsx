
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Eye, EyeOff } from "lucide-react"
import { cn } from "@/lib/utils"

type AuthDialogProps = {
  open?: boolean
  onOpenChange?: (v: boolean) => void
  onLogin?: (username: string) => void
  onRegister?: (username: string) => void
}

export function AuthDialog({
  open = false,
  onOpenChange = () => {},
  onLogin = () => {},
  onRegister = () => {},
}: AuthDialogProps) {
  const [mode, setMode] = useState<"login" | "register">("login")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showPass, setShowPass] = useState(false)
  const isLogin = mode === "login"

  function submit() {
    if (!username.trim()) return
    if (isLogin) onLogin(username.trim())
    else onRegister(username.trim())
    setUsername("")
    setPassword("")
    setShowPass(false)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isLogin ? "Вход" : "Регистрация"}</DialogTitle>
          <DialogDescription>
            {isLogin
              ? "Введите имя пользователя и пароль. Это заглушка — данные нигде не проверяются."
              : "Создайте учётную запись. Это заглушка — никаких подтверждений не требуется."}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="auth-username">Имя пользователя</Label>
            <Input
              id="auth-username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="username"
              className="focus-visible:ring-blue-600"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="auth-password">Пароль</Label>
            <div className="relative">
              <Input
                id="auth-password"
                type={showPass ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="password"
                className="pr-10 focus-visible:ring-blue-600"
              />
              <button
                type="button"
                onClick={() => setShowPass((v) => !v)}
                aria-pressed={showPass}
                aria-label={showPass ? "Скрыть пароль" : "Показать пароль"}
                className={cn(
                  "absolute inset-y-0 right-2 my-auto grid place-items-center text-gray-500 hover:text-gray-800",
                )}
              >
                {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <Button
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            onClick={submit}
            disabled={!username.trim() || !password}
          >
            {isLogin ? "Войти" : "Зарегистрироваться"}
          </Button>

          <div className="text-sm text-center text-muted-foreground">
            {isLogin ? (
              <>
                {"Нет аккаунта? "}
                <button type="button" className="text-blue-700 hover:underline" onClick={() => setMode("register")}>
                  Зарегистрироваться
                </button>
              </>
            ) : (
              <>
                {"Уже есть аккаунт? "}
                <button type="button" className="text-blue-700 hover:underline" onClick={() => setMode("login")}>
                  Войти
                </button>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
