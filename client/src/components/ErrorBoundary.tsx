import { Component } from "react"
import type { ErrorInfo, ReactNode } from "react"
import { routes } from "../app/config/routes"

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("ErrorBoundary caught:", error, info.componentStack)
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div className='flex flex-col items-center justify-center min-h-screen gap-4 text-white'>
            <p className='font-gilroyMedium text-[clamp(1.1rem,1.25vw,1.25rem)]'>
              Что-то пошло не так
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false })
                window.location.href = routes.home
              }}
              className='px-5 py-2 rounded-xl border border-violet text-white font-gilroy hover:border-pink-gradient1 transition-colors'
            >
              Вернуться на главную страницу
            </button>
          </div>
        )
      )
    }

    return this.props.children
  }
}
