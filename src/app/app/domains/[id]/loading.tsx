export default function DomainDetailLoading() {
  return (
    <>
      {/* Sidebar skeleton — matches actual light sidebar */}
      <div
        className="hidden lg:flex flex-col flex-shrink-0 w-64 py-8 px-4"
        style={{ background: '#FFF0E8' }}
      >
        <div className="mb-10 px-4">
          <div className="h-6 w-24 rounded animate-pulse" style={{ background: 'rgba(131,40,0,0.15)' }} />
          <div className="h-3 w-16 rounded animate-pulse mt-2" style={{ background: 'rgba(131,40,0,0.08)' }} />
        </div>
        <nav className="flex-1 space-y-1">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="h-11 rounded-lg animate-pulse"
              style={{ background: i === 1 ? 'rgba(255,255,255,0.55)' : 'transparent' }}
            />
          ))}
        </nav>
      </div>

      {/* Main content */}
      <main className="flex-1 flex flex-col overflow-hidden" style={{ background: '#fdf8f5' }}>
        {/* TopBar skeleton */}
        <div
          className="flex items-center px-4 md:px-8 h-16 flex-shrink-0"
          style={{ borderBottom: '0.5px solid rgba(222,192,183,0.2)' }}
        >
          <div className="flex items-center gap-2">
            <div className="w-14 h-3.5 rounded animate-pulse" style={{ background: 'rgba(139,114,106,0.3)' }} />
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: 'rgba(222,192,183,0.4)' }} />
            <div className="w-14 h-3.5 rounded animate-pulse" style={{ background: 'rgba(139,114,106,0.3)' }} />
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: 'rgba(222,192,183,0.4)' }} />
            <div className="w-28 h-3.5 rounded animate-pulse" style={{ background: 'rgba(139,114,106,0.3)' }} />
          </div>
        </div>

        <section className="flex-1 overflow-y-auto px-4 md:px-12 py-6 md:py-12">
          <div className="max-w-5xl mx-auto">
            {/* Breadcrumb skeleton */}
            <div className="flex items-center gap-2 mb-6">
              <div className="w-14 h-3 rounded animate-pulse" style={{ background: 'rgba(139,114,106,0.25)' }} />
              <div className="w-3 h-3 rounded-full" style={{ background: 'rgba(222,192,183,0.3)' }} />
              <div className="w-20 h-3 rounded animate-pulse" style={{ background: 'rgba(139,114,106,0.25)' }} />
            </div>

            {/* Domain heading */}
            <div className="mb-12">
              <div className="h-12 w-72 rounded-lg animate-pulse mb-4" style={{ background: 'rgba(28,28,26,0.15)' }} />
              <div className="flex items-center gap-3">
                <div className="h-7 w-24 rounded-full animate-pulse" style={{ background: 'rgba(244,223,203,0.8)' }} />
                <div className="h-4 w-36 rounded animate-pulse" style={{ background: 'rgba(139,114,106,0.22)' }} />
              </div>
            </div>

            {/* Main grid */}
            <div className="grid grid-cols-12 gap-6 md:gap-10">
              {/* Status card */}
              <div className="col-span-12 lg:col-span-5">
                <div className="p-8 rounded-2xl animate-pulse" style={{ background: '#ffffff', boxShadow: '0 4px 24px rgba(28,28,26,0.06)' }}>
                  <div className="w-12 h-12 rounded-xl mb-6" style={{ background: 'rgba(244,223,203,0.6)' }} />
                  <div className="h-6 w-40 rounded mb-4" style={{ background: 'rgba(28,28,26,0.15)' }} />
                  <div className="flex flex-col gap-2">
                    <div className="h-3.5 rounded" style={{ width: '90%', background: 'rgba(28,28,26,0.12)' }} />
                    <div className="h-3.5 rounded" style={{ width: '75%', background: 'rgba(28,28,26,0.12)' }} />
                    <div className="h-3.5 rounded" style={{ width: '60%', background: 'rgba(28,28,26,0.12)' }} />
                  </div>
                </div>
              </div>

              {/* DNS records panel */}
              <div className="col-span-12 lg:col-span-7">
                <div className="p-6 rounded-2xl" style={{ outline: '0.5px solid rgba(222,192,183,0.2)', background: 'rgba(252,249,246,0.5)' }}>
                  <div className="flex items-center justify-between mb-6">
                    <div className="h-5 w-36 rounded animate-pulse" style={{ background: 'rgba(28,28,26,0.15)' }} />
                    <div className="h-3 w-24 rounded animate-pulse" style={{ background: 'rgba(139,114,106,0.22)' }} />
                  </div>
                  <div className="flex flex-col gap-2">
                    {[...Array(3)].map((_, i) => (
                      <div
                        key={i}
                        className="h-14 rounded-xl animate-pulse"
                        style={{ background: 'rgba(252,249,246,0.8)' }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  )
}
