import { useEffect } from "react"
import { HelmetProvider } from "react-helmet-async"
import { MainRouter } from "./app/routers"
import { initAuth } from "./core/stores/authStore"

function App() {
  useEffect(() => {
    initAuth()
  }, [])

  return (
    <HelmetProvider>
      <MainRouter />
    </HelmetProvider>
  )
}

export default App
