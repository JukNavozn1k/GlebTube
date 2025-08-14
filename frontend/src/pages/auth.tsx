
import type React from "react"
import { useState, useEffect } from "react"
import { useNavigate, useLocation, Link } from "react-router-dom"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Eye, EyeOff, LogIn, UserPlus, ArrowLeft } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/contexts/auth-context"
import { GlebTubeLogo } from "@/components/logo"

export function AuthPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { auth, login, register } = useAuth()
  const [activeTab, setActiveTab] = useState("login")
  const [loginData, setLoginData] = useState({ username: "", password: "" })
  const [registerData, setRegisterData] = useState({ username: "", password: "", confirmPassword: "" })
  const [showPassword, setShowPassword] = useState({ login: false, register: false, confirm: false })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const returnUrl = location.state?.returnUrl || "/"

  // Если уже авторизован, перенаправляем
  useEffect(() => {
    if (auth.loggedIn) {
      navigate(returnUrl)
    }
  }, [auth.loggedIn, navigate, returnUrl])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})

    if (!loginData.username.trim()) {
      setErrors({ username: "Введите имя пользователя" })
      return
    }
    if (!loginData.password) {
      setErrors({ password: "Введите пароль" })
      return
    }

    setLoading(true)
    try {
      await login({ username: loginData.username.trim(), password: loginData.password })
      navigate(returnUrl)
    } catch (err) {
      console.error('Login failed', err)
      // try to read structured http error
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const anyErr = err as any
      const msg = anyErr?.detail || anyErr?.message || "Не удалось войти. Проверьте данные и попробуйте снова."
      if (typeof msg === 'string') setErrors({ general: msg })
      else setErrors({ general: JSON.stringify(msg) })
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})

    if (!registerData.username.trim()) {
      setErrors({ username: "Введите имя пользователя" })
      return
    }
    if (!registerData.password) {
      setErrors({ password: "Введите пароль" })
      return
    }
    if (registerData.password !== registerData.confirmPassword) {
      setErrors({ confirmPassword: "Пароли не совпадают" })
      return
    }

    setLoading(true)
    try {
      await register({ username: registerData.username.trim(), password: registerData.password })
      navigate(returnUrl)
    } catch (err) {
      console.error('Register failed', err)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const anyErr = err as any
      const msg = anyErr?.detail || anyErr?.message || "Не удалось зарегистрировать аккаунт. Попробуйте позже."
      if (typeof msg === 'string') setErrors({ general: msg })
      else setErrors({ general: JSON.stringify(msg) })
    } finally {
      setLoading(false)
    }
  }

  if (auth.loggedIn) {
    return null // Не показываем ничего пока идет редирект
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex flex-col">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="mx-auto max-w-6xl px-4 py-4">
          <div className="flex items-center justify-between">
            <GlebTubeLogo />
            <Link to="/">
              <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
                <ArrowLeft className="h-4 w-4 mr-2" />
                На главную
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Добро пожаловать!</h1>
            <p className="text-gray-600">Войдите в свой аккаунт или создайте новый</p>
          </div>

          <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
            <CardHeader className="space-y-1 pb-4">
              <div className="flex items-center justify-center mb-4">
                <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <LogIn className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="login" className="flex items-center gap-2">
                    <LogIn className="h-4 w-4" />
                    Вход
                  </TabsTrigger>
                  <TabsTrigger value="register" className="flex items-center gap-2">
                    <UserPlus className="h-4 w-4" />
                    Регистрация
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="login" className="space-y-4">
                  {errors.general && (
                    <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-md text-sm">
                      {errors.general}
                    </div>
                  )}
                  <div className="text-center mb-4">
                    <CardTitle className="text-xl">Войти в аккаунт</CardTitle>
                    <CardDescription className="mt-1">Введите свои данные для входа</CardDescription>
                  </div>

                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="login-username">Имя пользователя</Label>
                      <Input
                        id="login-username"
                        type="text"
                        value={loginData.username}
                        onChange={(e) => setLoginData((prev) => ({ ...prev, username: e.target.value }))}
                        placeholder="Введите имя пользователя"
                        className={cn(
                          "focus-visible:ring-blue-600",
                          errors.username && "border-red-500 focus-visible:ring-red-500",
                        )}
                        disabled={loading}
                      />
                      {errors.username && <p className="text-sm text-red-600">{errors.username}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="login-password">Пароль</Label>
                      <div className="relative">
                        <Input
                          id="login-password"
                          type={showPassword.login ? "text" : "password"}
                          value={loginData.password}
                          onChange={(e) => setLoginData((prev) => ({ ...prev, password: e.target.value }))}
                          placeholder="Введите пароль"
                          className={cn(
                            "pr-10 focus-visible:ring-blue-600",
                            errors.password && "border-red-500 focus-visible:ring-red-500",
                          )}
                          disabled={loading}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((prev) => ({ ...prev, login: !prev.login }))}
                          className="absolute inset-y-0 right-2 flex items-center text-gray-500 hover:text-gray-700"
                          disabled={loading}
                        >
                          {showPassword.login ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      {errors.password && <p className="text-sm text-red-600">{errors.password}</p>}
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <div className="h-4 w-4 mr-2 border border-white/30 border-t-white rounded-full animate-spin" />
                          Вход...
                        </>
                      ) : (
                        <>
                          <LogIn className="h-4 w-4 mr-2" />
                          Войти
                        </>
                      )}
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="register" className="space-y-4">
                  {errors.general && (
                    <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-md text-sm">
                      {errors.general}
                    </div>
                  )}
                  <div className="text-center mb-4">
                    <CardTitle className="text-xl">Создать аккаунт</CardTitle>
                    <CardDescription className="mt-1">Заполните форму для регистрации</CardDescription>
                  </div>

                  <form onSubmit={handleRegister} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="register-username">Имя пользователя</Label>
                      <Input
                        id="register-username"
                        type="text"
                        value={registerData.username}
                        onChange={(e) => setRegisterData((prev) => ({ ...prev, username: e.target.value }))}
                        placeholder="Выберите имя пользователя"
                        className={cn(
                          "focus-visible:ring-blue-600",
                          errors.username && "border-red-500 focus-visible:ring-red-500",
                        )}
                        disabled={loading}
                      />
                      {errors.username && <p className="text-sm text-red-600">{errors.username}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="register-password">Пароль</Label>
                      <div className="relative">
                        <Input
                          id="register-password"
                          type={showPassword.register ? "text" : "password"}
                          value={registerData.password}
                          onChange={(e) => setRegisterData((prev) => ({ ...prev, password: e.target.value }))}
                          placeholder="Создайте пароль"
                          className={cn(
                            "pr-10 focus-visible:ring-blue-600",
                            errors.password && "border-red-500 focus-visible:ring-red-500",
                          )}
                          disabled={loading}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((prev) => ({ ...prev, register: !prev.register }))}
                          className="absolute inset-y-0 right-2 flex items-center text-gray-500 hover:text-gray-700"
                          disabled={loading}
                        >
                          {showPassword.register ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      {errors.password && <p className="text-sm text-red-600">{errors.password}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="register-confirm">Подтвердите пароль</Label>
                      <div className="relative">
                        <Input
                          id="register-confirm"
                          type={showPassword.confirm ? "text" : "password"}
                          value={registerData.confirmPassword}
                          onChange={(e) => setRegisterData((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                          placeholder="Повторите пароль"
                          className={cn(
                            "pr-10 focus-visible:ring-blue-600",
                            errors.confirmPassword && "border-red-500 focus-visible:ring-red-500",
                          )}
                          disabled={loading}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((prev) => ({ ...prev, confirm: !prev.confirm }))}
                          className="absolute inset-y-0 right-2 flex items-center text-gray-500 hover:text-gray-700"
                          disabled={loading}
                        >
                          {showPassword.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      {errors.confirmPassword && <p className="text-sm text-red-600">{errors.confirmPassword}</p>}
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <div className="h-4 w-4 mr-2 border border-white/30 border-t-white rounded-full animate-spin" />
                          Регистрация...
                        </>
                      ) : (
                        <>
                          <UserPlus className="h-4 w-4 mr-2" />
                          Зарегистрироваться
                        </>
                      )}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>

              <div className="mt-6 text-center">
                <p className="text-xs text-gray-500">Это демо-версия. Данные сохраняются только локально.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}