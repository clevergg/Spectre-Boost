import { SEO } from "../core/components/SEO"

const NotFoundPage = () => {
  return (
    <>
      <SEO
        title='404 — Страница не найдена'
        description='Сомневаюсь что такая страница существует'
      />
      <section className='bg-bgblack' aria-labelledby='error-title'>
        <div className='px-4 flex items-center min-h-screen justify-center flex-col w-full lg:px-6'>
          <h1 id='error-title' className='text-white text-[clamp(7rem,9vw,9rem)] font-bold'>
            404
          </h1>
          <p className='mb-4 text-center text-[clamp(1.5rem,3vw,3rem)] text-balance font-medium text-white'>
            Сомневаюсь что такая страница существует
          </p>
          <button
            onClick={() => (window.location.href = "/")}
            className='inline-flex border cursor-pointer text-white hover:bg-white/10 font-medium rounded-[11px] text-md px-6 py-4 text-center my-4 transition-colors'
            type='button'
          >
            Вернуться на главную
          </button>
        </div>
      </section>
    </>
  )
}

export default NotFoundPage
