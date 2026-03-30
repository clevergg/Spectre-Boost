import { BgShining } from "./BackgroundShining"
import type { BgShiningProps } from "./types"

interface BgShiningGroupProps {
  items: BgShiningProps[]
}

export const BgShiningGroup = ({ items }: BgShiningGroupProps) => (
  <>
    {items.map((props, i) => (
      <BgShining key={i} {...props} />
    ))}
  </>
)
