type behaviorType = "smooth" | "instant"

const scrollToTop = (behavior: behaviorType = "smooth"): void => {
  window.scrollTo({
    top: 0,
    behavior: behavior,
  })
}

export default scrollToTop
