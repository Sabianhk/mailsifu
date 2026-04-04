export default function MessageDetailLoading() {
  return (
    <div className="flex-1 flex flex-col overflow-hidden" style={{ background: '#fcf9f6' }}>
      <section className="flex-1 overflow-y-auto px-4 md:px-12 py-6 md:py-12">
        <div className="max-w-3xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-full" style={{ background: '#e5e2da' }} />
              <div className="space-y-2">
                <div className="h-4 w-32 rounded" style={{ background: '#e5e2da' }} />
                <div className="h-3 w-24 rounded" style={{ background: '#e5e2da' }} />
              </div>
            </div>
            <div className="h-8 w-3/4 rounded" style={{ background: '#e5e2da' }} />
            <div className="space-y-3 pt-4">
              <div className="h-4 w-full rounded" style={{ background: '#e5e2da' }} />
              <div className="h-4 w-5/6 rounded" style={{ background: '#e5e2da' }} />
              <div className="h-4 w-4/6 rounded" style={{ background: '#e5e2da' }} />
              <div className="h-4 w-full rounded" style={{ background: '#e5e2da' }} />
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
