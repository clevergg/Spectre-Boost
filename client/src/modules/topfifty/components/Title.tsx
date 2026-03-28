export const Title = ({
  text,
  strong,
  className,
}: {
  text?: string
  strong?: string
  className: string
}) => {
  return (
    <header>
      <h1 className={className}>
        {text} <strong>{strong}</strong>
      </h1>
    </header>
  )
}
