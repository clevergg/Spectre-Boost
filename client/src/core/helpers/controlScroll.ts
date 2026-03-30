let countScroll = 0

export const lockScroll = () => {
  countScroll++
  document.documentElement.classList.add("no-scroll")
}

export const unlockScroll = () => {
  countScroll = Math.max(0, countScroll - 1)
  if (countScroll === 0) {
    document.documentElement.classList.remove("no-scroll")
  }
}
