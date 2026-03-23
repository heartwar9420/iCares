export default function HeroSections() {
  return (
    <section className="relative min-h-[80vh] flex items-center justify-between py-12 md:py-20 bg-[url('/HeroSection.jpg')] bg-cover bg-center rounded-2xl overflow-hidden">
      {/* 半透明遮罩 */}
      <div className="absolute inset-0 bg-black/60 z-0"></div>

      <div className="relative z-10 flex-1 flex flex-col md:flex-row items-center justify-between w-full px-5 md:px-12 gap-8 md:gap-12">
        <div className="flex-1 space-y-4 md:space-y-6 text-center md:text-left">
          <h1 className="text-xl sm:text-4xl  md:text-5xl font-bold leading-tight text-white tracking-wide">
            重拾深度專注，
            <span className="block mt-4">從學會「科學休息」開始</span>
          </h1>

          {/* 內文 */}
          <p className="text-slate-200 text-sm max-w-md md:text-lg lg:max-w-3xl leading-relaxed">
            不僅是計時器，更是你的數位健康管家。
            <span className="block mt-4">透過科學化的理論與20-20-20 護眼原則，</span>
            <span className="block mt-4">我們幫你奪回專注力，同時守護長時間用眼的健康。</span>
            <span className="block mt-4">在這裡，讓每一次的專注，都成為下一次專注的動力。</span>
          </p>
        </div>
      </div>
    </section>
  );
}
