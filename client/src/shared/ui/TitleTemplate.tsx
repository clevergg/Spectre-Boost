interface TitleProps {
  text?: string
  strong?: string
  className?: string
}

export const TitleTemplate = ({ text, strong, className }: TitleProps) => {
  return (
    <h2 className={`${className} font-unbounded z-1 text-white text-balance text-center`}>
      {text && text} {strong && <strong>{strong}</strong>}
    </h2>
  )
}
