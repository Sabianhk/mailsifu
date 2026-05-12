'use client'

export default function AppError({ error }: { error: Error & { digest?: string } }) {
  // Log to console so it appears in Vercel function logs
  console.error('App error:', error.message, error.digest, error.stack)

  return (
    <main className="flex-1 flex items-center justify-center p-8">
      <div className="text-center max-w-md">
        <h2 className="text-xl font-semibold mb-2" style={{ color: '#1c1c1a' }}>Something went wrong</h2>
        <p className="text-sm mb-4" style={{ color: '#5f5e58' }}>{error.message}</p>
        <p className="text-xs" style={{ color: '#8b726a' }}>Digest: {error.digest}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 rounded-lg text-white text-sm"
          style={{ background: '#832800' }}
        >
          Try again
        </button>
      </div>
    </main>
  )
}
