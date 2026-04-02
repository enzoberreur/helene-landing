import { useInView } from '../hooks/useInView'

export default function Showcase() {
  const { ref, inView } = useInView(0.1)

  return (
    <section
      ref={ref as React.RefObject<HTMLElement>}
      className={`py-6 lg:py-10 bg-white ${inView ? 'section-visible' : ''}`}
    >
      <div className="max-w-[1200px] mx-auto px-6 lg:px-12">
        <div className="img-reveal rounded-[20px] lg:rounded-[28px] overflow-hidden" style={{ aspectRatio: '16/7' }}>
          <img
            src="https://images.unsplash.com/photo-1543269865-cbf427effbad?w=1600&q=80"
            alt="Women together"
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </section>
  )
}
