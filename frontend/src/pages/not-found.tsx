import { Button } from "@/components/ui/button"
import { Play, Home, Search, Video, Camera, Film } from "lucide-react"
import {Link} from "react-router-dom"

export function NotFound() {
  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-12 md:h-16 bg-blue-600"></div>
      <div className="absolute bottom-0 left-0 right-0 h-12 md:h-16 bg-blue-600"></div>

      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-16 md:top-20 left-4 md:left-10 text-blue-200 animate-bounce">
          <Camera size={24} className="md:w-8 md:h-8" />
        </div>
        <div className="absolute top-24 md:top-32 right-8 md:right-20 text-blue-300 animate-pulse">
          <Film size={20} className="md:w-7 md:h-7" />
        </div>
        <div className="absolute bottom-24 md:bottom-32 left-8 md:left-20 text-blue-200 animate-bounce delay-300">
          <Video size={18} className="md:w-6 md:h-6" />
        </div>
        <div className="absolute bottom-32 md:bottom-40 right-6 md:right-16 text-blue-300 animate-pulse delay-500">
          <Play size={16} className="md:w-5 md:h-5" />
        </div>
        <div className="absolute top-1/2 left-3 md:left-8 text-blue-200 animate-bounce delay-700">
          <Camera size={16} className="md:w-5 md:h-5" />
        </div>
        <div className="absolute top-1/3 right-4 md:right-12 text-blue-300 animate-pulse delay-200">
          <Film size={18} className="md:w-6 md:h-6" />
        </div>
      </div>

      <div className="flex items-center justify-center min-h-screen px-4 relative z-10">
        <div className="text-center max-w-2xl">
          <div className="relative mb-6 md:mb-8">
            <h1 className="text-6xl sm:text-8xl md:text-9xl lg:text-[12rem] font-bold text-blue-600 leading-none font-sans">
              4
              <span className="relative inline-block">
                0
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg
                    width="60"
                    height="60"
                    viewBox="0 0 100 100"
                    className="text-blue-500 w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20"
                  >
                    {/* Верхний треугольник */}
                    <polygon points="50,15 35,40 65,40" fill="currentColor" opacity="0.8" />
                    {/* Нижний треугольник */}
                    <polygon points="50,85 35,60 65,60" fill="currentColor" opacity="0.8" />
                  </svg>
                  <Button
                    size="lg"
                    className="absolute bg-white text-blue-600 hover:bg-blue-50 rounded-full w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 p-0 shadow-lg animate-pulse"
                  >
                    <Play className="w-3 h-3 sm:w-4 sm:h-4 md:w-6 md:h-6 ml-0.5" fill="currentColor" />
                  </Button>
                </div>
              </span>
              4
            </h1>
          </div>

          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-blue-800 mb-3 md:mb-4 font-sans">
            Видео не найдено
          </h2>

          <p className="text-base sm:text-lg text-blue-600 mb-6 md:mb-8 font-sans leading-relaxed px-2">
            Похоже, это видео исчезло быстрее, чем вирусный ролик! Возможно, оно было удалено или никогда не
            существовало.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4 mb-6 md:mb-8">
            <div className="bg-blue-50 p-4 md:p-6 rounded-xl border border-blue-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <Home className="w-6 h-6 md:w-8 md:h-8 text-blue-600 mx-auto mb-2 md:mb-3" />
              <h3 className="font-semibold text-blue-800 mb-1 md:mb-2 font-sans text-sm md:text-base">Главная</h3>
              <p className="text-xs md:text-sm text-blue-600 font-sans">Вернуться на главную страницу</p>
            </div>

            <div className="bg-blue-50 p-4 md:p-6 rounded-xl border border-blue-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <Search className="w-6 h-6 md:w-8 md:h-8 text-blue-600 mx-auto mb-2 md:mb-3" />
              <h3 className="font-semibold text-blue-800 mb-1 md:mb-2 font-sans text-sm md:text-base">Поиск</h3>
              <p className="text-xs md:text-sm text-blue-600 font-sans">Найти другие видео</p>
            </div>

            <div className="bg-blue-50 p-4 md:p-6 rounded-xl border border-blue-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <Video className="w-6 h-6 md:w-8 md:h-8 text-blue-600 mx-auto mb-2 md:mb-3" />
              <h3 className="font-semibold text-blue-800 mb-1 md:mb-2 font-sans text-sm md:text-base">Популярное</h3>
              <p className="text-xs md:text-sm text-blue-600 font-sans">Смотреть трендовые видео</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center">
            <Button
              asChild
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 md:px-8 py-2.5 md:py-3 rounded-full font-semibold transition-all duration-300 hover:scale-105 font-sans text-sm md:text-base"
            >
              <Link to="/">
                <Home className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                На главную
              </Link>
            </Button>

            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white px-6 md:px-8 py-2.5 md:py-3 rounded-full font-semibold transition-all duration-300 hover:scale-105 font-sans bg-transparent text-sm md:text-base"
            >
              <Link to="/search">
                <Search className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                Поиск видео
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
