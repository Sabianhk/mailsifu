export default function DomainsLoading() {
  return (
    <>
      {/* Sidebar skeleton — matches actual light sidebar */}
      <div
        className="hidden lg:flex flex-col flex-shrink-0 w-64 py-8 px-4"
        style={{ background: '#FFF0E8' }}
      >
        <div className="mb-10 px-4">
          <div className="h-6 w-24 rounded animate-pulse" style={{ background: 'rgba(131,40,0,0.22)' }} />
          <div className="h-3 w-16 rounded animate-pulse mt-2" style={{ background: 'rgba(131,40,0,0.12)' }} />
        </div>
        <nav className="flex-1 space-y-1">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="h-11 rounded-lg animate-pulse mx-0 px-4"
              style={{ background: i === 1 ? 'rgba(255,255,255,0.55)' : 'transparent' }}
            />
          ))}
        </nav>
      </div>

      {/* Main content */}
      <main className="flex-1 flex flex-col overflow-hidden" style={{ background: '#fcf9f6' }}>
        {/* TopBar skeleton */}
        <div
          className="flex items-center px-4 md:px-8 h-16 flex-shrink-0"
          style={{ borderBottom: '0.5px solid rgba(222,192,183,0.2)' }}
        >
          <div className="flex items-center gap-2">
            <div className="w-16 h-3.5 rounded animate-pulse" style={{ background: 'rgba(139,114,106,0.3)' }} />
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: 'rgba(222,192,183,0.4)' }} />
            <div className="w-14 h-3.5 rounded animate-pulse" style={{ background: 'rgba(139,114,106,0.3)' }} />
          </div>
        </div>

        <section className="flex-1 overflow-y-auto px-4 md:px-10 py-6 md:py-12">
          <div className="max-w-6xl mx-auto">
            {/* Header skeleton */}
            <div className="mb-12">
              <div className="h-10 w-64 rounded-lg animate-pulse mb-3" style={{ background: 'rgba(28,28,26,0.15)' }} />
              <div className="h-4 w-80 rounded animate-pulse" style={{ background: 'rgba(139,114,106,0.22)' }} />
            </div>

            {/* Domain cards grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="rounded-xl p-6 flex flex-col gap-4 animate-pulse"
                  style={{ background: '#ffffff', boxShadow: '0 2px 12px rgba(28,28,26,0.06)' }}
                >
                  <div className="flex flex-col gap-2">
                    <div className="h-5 rounded" style={{ width: '70%', background: 'rgba(28,28,26,0.15)' }} />
                    <div className="h-3 rounded" style={{ width: '50%', background: 'rgba(139,114,106,0.18)' }} />
                  </div>
                  <div className="flex items-center justify-between mt-auto pt-4" style={{ borderTop: '1px solid rgba(222,192,183,0.2)' }}>
                    <div className="h-6 w-24 rounded-full" style={{ background: 'rgba(244,223,203,0.8)' }} />
                    <div className="h-3 w-20 rounded" style={{ background: 'rgba(139,114,106,0.15)' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </>
  )
}
