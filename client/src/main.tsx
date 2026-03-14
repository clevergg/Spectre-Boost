import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import "./core/styles/global.css"
import "swiper/css"
import App from "./App.tsx"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
)
