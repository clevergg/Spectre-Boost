import { useEffect } from "react"
import { createPortal } from "react-dom"
import { FrameAnimation } from "../../../shared/ui/FrameAnimation"
import type { ReactNode } from "react"

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  children: ReactNode
  type?: string
}

const CreatePortalModal = ({ isOpen, onClose, children, type = "default" }: AuthModalProps) => {
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent): void => {
      if (isOpen && event.key === "Escape") onClose()
    }

    if (isOpen) {
      document.addEventListener("keydown", handleEscape)
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }

    return () => {
      document.removeEventListener("keydown", handleEscape)
      document.body.style.overflow = "unset"
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return createPortal(
    <FrameAnimation className='fixed inset-0 z-50 flex items-center justify-center min-w-[360px] bg-black/90 bg-opacity-70'>
      <div className='absolute inset-0' onClick={onClose} aria-hidden='true' />
      <div
        className={`relative bg-black border border-gray-dark rounded-lg text-center ${type !== "default" ? "min-w-[310px] max-w-3/4 lgx:max-w-1/2" : "max-w-[325px]"} w-full p-5`}
      >
        {children}
      </div>
    </FrameAnimation>,
    document.body
  )
}

export default CreatePortalModal
