import { useEffect } from "react"
import { MainRouter } from "./app/routers"
import { initAuth } from "./core/stores/authStore"

function App() {
  useEffect(() => {
    initAuth()
  }, [])

  return <MainRouter />
}

export default App
