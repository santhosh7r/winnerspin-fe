export const OurAppliances = () => {
  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-black text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            Our Home Appliances
          </h2>
          <p className="mt-4 text-lg text-gray-400 mt-4">
            Take a closer look at the incredible range of high-quality home
            appliances waiting to be won. From state-of-the-art kitchen
            gadgets to essential home comforts, our selection is designed to
            upgrade your lifestyle. See for yourself what you could be taking
            home.
          </p>
        </div>
        <div className="mt-12 sm:mt-24">
          <div className="relative aspect-video">
            <iframe
              className="absolute inset-0 h-full w-full rounded-lg"
              src="https://www.youtube.com/embed/0WzqoFi6XJc?si=QEQzw6udUUt44-tx" // TODO: Replace VIDEO_ID with your actual YouTube video ID
              title="Our Appliances"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            ></iframe>
          </div>
        </div>
      </div>
    </section>
  );
};