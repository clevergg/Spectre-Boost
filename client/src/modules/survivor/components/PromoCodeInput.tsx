import { useState, useEffect, useRef } from "react"
import { useSearchParams } from "react-router-dom"
import { validatePromo, type PromoValidation } from "../../../core/api/promo.api"

const PROMO_STORAGE_KEY = "spectre_promo_code"

interface PromoCodeInputProps {
  onApply: (promo: PromoValidation | null) => void
}

export const PromoCodeInput = ({ onApply }: PromoCodeInputProps) => {
  const [searchParams] = useSearchParams()
  const [code, setCode] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [applied, setApplied] = useState<PromoValidation | null>(null)
  const [error, setError] = useState<string | null>(null)
  const initialized = useRef(false)

  useEffect(() => {
    if (initialized.current) return
    initialized.current = true

    const promoFromUrl = searchParams.get("promo")
    const promoFromStorage = localStorage.getItem(PROMO_STORAGE_KEY)
    const codeToCheck = promoFromUrl || promoFromStorage

    if (codeToCheck) {
      setCode(codeToCheck.toUpperCase())
      handleApply(codeToCheck, true)
    }
  }, [])

  const handleApply = async (promoCode?: string, silent: boolean = false) => {
    const codeToValidate = (promoCode || code).trim().toUpperCase()
    if (!codeToValidate) return

    setIsLoading(true)
    setError(null)

    try {
      const result = await validatePromo(codeToValidate)
      setApplied(result)
      setCode(result.code)
      onApply(result)
      localStorage.setItem(PROMO_STORAGE_KEY, result.code)
    } catch (err: any) {
      setApplied(null)
      onApply(null)
      localStorage.removeItem(PROMO_STORAGE_KEY)
      if (!silent) {
        setError(err.message || "Промокод не найден")
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleRemove = () => {
    setCode("")
    setApplied(null)
    setError(null)
    onApply(null)
    localStorage.removeItem(PROMO_STORAGE_KEY)
  }

  return (
    <div className='w-full'>
      {applied ? (
        <div className='flex items-center justify-between bg-green-900/20 border border-green-700/50 rounded-xl px-4 py-3'>
          <p className='text-green-400 font-gilroyMedium text-[clamp(0.9rem,1vw,1rem)]'>
            🏷 {applied.code} — скидка {applied.discount}%
          </p>
          <button
            onClick={handleRemove}
            className='text-red-400 hover:text-red-300 font-gilroy text-[clamp(0.85rem,0.95vw,0.95rem)] transition-colors'
          >
            Убрать
          </button>
        </div>
      ) : (
        <div className='flex flex-col sm:flex-row gap-3 sm:gap-2'>
          <input
            type='text'
            value={code}
            onChange={e => {
              setCode(e.target.value.toUpperCase())
              setError(null)
            }}
            placeholder='Промокод'
            maxLength={20}
            className='flex-1 bg-transparent border border-[#414141] rounded-xl px-4 py-3 text-white font-gilroy text-[clamp(0.9rem,1vw,1rem)] outline-none focus:border-pink-400 uppercase'
          />
          <button
            onClick={() => handleApply()}
            disabled={!code.trim() || isLoading}
            className={`px-5 py-3 rounded-xl font-gilroyMedium text-[clamp(0.85rem,0.95vw,0.95rem)] transition-all shrink-0 ${
              code.trim() && !isLoading
                ? "bg-white/10 text-white hover:bg-white/20 cursor-pointer"
                : "bg-gray-800 text-gray-500 cursor-not-allowed"
            }`}
          >
            {isLoading ? "..." : "Применить"}
          </button>
        </div>
      )}
      {error && (
        <p className='text-red-400 font-gilroy text-[clamp(0.75rem,0.85vw,0.85rem)] mt-1 px-1'>
          {error}
        </p>
      )}
    </div>
  )
}
