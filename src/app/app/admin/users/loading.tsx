export default function AdminUsersLoading() {
  return (
    <div className="flex-1 flex flex-col overflow-hidden" style={{ background: '#fcf9f6' }}>
      <section className="flex-1 overflow-y-auto px-4 md:px-10 py-6 md:py-12">
        <div className="max-w-4xl mx-auto space-y-12">
          <div className="animate-pulse">
            <div className="h-8 w-48 rounded mb-4" style={{ background: '#dcdad7' }} />
            <div className="h-4 w-64 rounded" style={{ background: '#dcdad7' }} />
          </div>
          <div className="animate-pulse space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 rounded-xl" style={{ background: '#dcdad7' }} />
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
