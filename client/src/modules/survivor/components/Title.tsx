interface TitleProps {
  text?: string
  strong?: string
  className?: string
}

export const Title = ({ text, strong, className }: TitleProps) => {
  return (
    <h2 className={className}>
      {text} {strong && <strong>{strong}</strong>}
    </h2>
  )
}
