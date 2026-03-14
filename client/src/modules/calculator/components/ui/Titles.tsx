export const Title = () => {
  return (
    <div className='relative flex justify-center text-center'>
      <h1 className='text-[clamp(1.8rem,4.8vw,5rem)]/[115%] font-black font-unbounded md:pb-7 text-white text-balance'>
        ПРОКАЧАЙТЕ СВОЙ АККАУНТ В PUBG
      </h1>
    </div>
  )
}

export const SecondCardTitle = () => {
  return (
    <header>
      <h2 className='text-[clamp(1.5rem,3vw,2rem)] xl:px-6 pt-12 lg:pt-20 text-center text-gradient-purple-blue font-unbounded '>
        Итого к оплате
      </h2>
    </header>
  )
}

export const FirstCardTitle = () => {
  return (
    <header>
      <h2 className='text-[clamp(1.55rem,2.7vw,2rem)] text-center text-gradient-purple-blue max-lg:px-[calc(1rem+2vw)] [&_strong]:text-white font-unbounded '>
        Рассчитайте стоимость <strong>буста</strong>
      </h2>
    </header>
  )
}
