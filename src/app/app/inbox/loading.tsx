export default function InboxLoading() {
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
              className="h-11 rounded-lg animate-pulse"
              style={{ background: i === 0 ? 'rgba(255,255,255,0.55)' : 'transparent' }}
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
          <div className="w-10 h-4 rounded animate-pulse" style={{ background: 'rgba(139,114,106,0.3)' }} />
        </div>

        {/* Inbox two-panel layout */}
        <div className="flex flex-1 overflow-hidden">
          {/* Message list */}
          <div
            className="w-full md:w-[380px] flex-shrink-0 flex flex-col overflow-hidden"
            style={{ background: '#f6f3f0' }}
          >
            <div className="p-4">
              <div className="h-10 rounded-lg animate-pulse" style={{ background: '#e5e2da' }} />
            </div>
            <div className="flex-1 overflow-y-auto px-3 space-y-1">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="px-4 py-4 rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <div
                      className="h-3 rounded animate-pulse"
                      style={{ width: `${50 + (i % 3) * 20}%`, background: 'rgba(28,28,26,0.18)' }}
                    />
                    <div className="w-10 h-2.5 rounded animate-pulse" style={{ background: 'rgba(139,114,106,0.22)' }} />
                  </div>
                  <div className="h-3 rounded animate-pulse mt-1" style={{ width: '80%', background: 'rgba(28,28,26,0.12)' }} />
                  <div className="h-2.5 rounded animate-pulse mt-1" style={{ width: '60%', background: 'rgba(28,28,26,0.08)' }} />
                </div>
              ))}
            </div>
          </div>

          {/* Message detail */}
          <div className="flex-1 hidden md:flex flex-col overflow-hidden p-8 gap-5">
            <div className="flex flex-col gap-3">
              <div className="h-6 w-3/4 rounded animate-pulse" style={{ background: 'rgba(28,28,26,0.15)' }} />
              <div className="h-4 w-1/2 rounded animate-pulse" style={{ background: 'rgba(139,114,106,0.22)' }} />
            </div>
            <div
              className="w-24 h-12 rounded-xl animate-pulse"
              style={{ background: 'rgba(131,40,0,0.15)' }}
            />
            <div className="flex flex-col gap-2 mt-2">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="h-3 rounded animate-pulse"
                  style={{ width: `${90 - i * 8}%`, background: 'rgba(28,28,26,0.1)' }}
                />
              ))}
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
