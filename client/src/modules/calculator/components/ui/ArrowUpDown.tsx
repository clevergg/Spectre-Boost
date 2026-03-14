export const ArrowUpDown = ({ isOpenSelect }: { isOpenSelect?: boolean }) => {
  return (
    <svg
      className={`w-5 h-5 text-gray-400 transition-transform ${isOpenSelect ? "rotate-180" : null}`}
      fill='none'
      stroke='currentColor'
      viewBox='0 0 24 24'
    >
      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 9l-7 7-7-7' />
    </svg>
  )
}
