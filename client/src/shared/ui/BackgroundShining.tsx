interface BgShiningProps {
  top?: string | null
  left?: string | null
  blur?: string | null
  brightness?: string | null
  bgColor?: string | null
  animation?: string | null
  className?: string | null
  right?: string | null
  bottom?: string | null
}

export const BgShining = ({
  top = null,
  left = null,
  blur = "blur-[90px]",
  brightness = "brightness-115",
  bgColor = "bg-[#060a16]",
  animation = null,
  className = null,
  right = null,
  bottom = null,
}: BgShiningProps) => {
  return (
    <div
      className={`
        absolute 
        rounded-full 
				${bottom}
        ${top} 
        ${left} 
				${right}
        ${bgColor} 
        ${blur} 
        ${brightness} 
        ${animation} 
        ${className}
      `
        .trim()
        .replace(/\s+/g, " ")}
    />
  )
}
