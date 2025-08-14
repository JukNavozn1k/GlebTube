import {Link} from 'react-router-dom'
import { Button } from "@/components/ui/button"

export function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white text-blue-700 p-4">
      
      <h2 className="text-4xl font-semibold mb-4">404 - Страница не найдена</h2>
      <p className="text-lg text-center mb-8 max-w-md">
        К сожалению, видео, которое вы ищете, не существует или было перемещено.
      </p>
      <Link to="/">
        <Button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-full text-lg font-medium shadow-lg transition-colors duration-300">
          Вернуться на главную
        </Button>
      </Link>
    </div>
  )
}