export default function Loading() {
  return (
    <div className="pt-2 sm:pt-4 animate-fade-in">
      <div className="mx-4 sm:mx-6 lg:mx-8 h-52 sm:h-64 md:h-72 lg:h-80 rounded-2xl skeleton" />
      <div className="mt-6 space-y-8 px-4 sm:px-6 lg:px-8">
        {[1,2,3].map(i=>(
          <div key={i}>
            <div className="h-5 w-32 skeleton rounded mb-3" />
            <div className="flex gap-3 sm:gap-4 overflow-hidden">
              {Array.from({length:6}).map((_,j)=><div key={j} className="shrink-0 w-32 sm:w-44"><div className="aspect-[3/4] skeleton rounded-xl" /><div className="h-3 skeleton rounded mt-2" /></div>)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
