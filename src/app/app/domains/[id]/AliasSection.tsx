'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createAlias, deleteAlias } from './actions'

type Alias = {
  id: string
  address: string
  label: string | null
  createdAt: string
}

export function AliasSection({
  mailDomainId,
  domain,
  aliases: initialAliases,
}: {
  mailDomainId: string
  domain: string
  aliases: Alias[]
}) {
  const router = useRouter()
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [label, setLabel] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [deletingId, setDeletingId] = useState<string | null>(null)

  function handleCreate() {
    setError(null)
    startTransition(async () => {
      const result = await createAlias(mailDomainId, name, label || undefined)
      if (result.error) {
        setError(result.error)
      } else {
        setName('')
        setLabel('')
        setShowForm(false)
        router.refresh()
      }
    })
  }

  function handleDelete(aliasId: string) {
    setDeletingId(aliasId)
    startTransition(async () => {
      await deleteAlias(mailDomainId, aliasId)
      setDeletingId(null)
      router.refresh()
    })
  }

  return (
    <div className="col-span-12 mt-6">
      <div
        className="glass-panel p-4 md:p-8 rounded-2xl"
        style={{ outline: '0.5px solid rgba(222,192,183,0.2)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6 md:mb-8">
          <h3
            className="italic"
            style={{
              fontFamily: 'var(--font-newsreader)',
              fontSize: '1.25rem',
              color: '#1c1c1a',
              fontWeight: 600,
            }}
          >
            Aliases
          </h3>
          <button
            type="button"
            onClick={() => {
              setShowForm(!showForm)
              setError(null)
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl transition-all hover:opacity-80"
            style={{
              fontFamily: 'var(--font-manrope)',
              fontSize: '0.8125rem',
              fontWeight: 700,
              color: '#832800',
              background: '#f4dfcb',
            }}
          >
            <span
              className="material-symbols-outlined"
              style={{ fontSize: '18px' }}
            >
              {showForm ? 'close' : 'add'}
            </span>
            {showForm ? 'Cancel' : 'Add Alias'}
          </button>
        </div>

        {/* Add Alias Form */}
        {showForm && (
          <div
            className="mb-6 p-5 rounded-xl"
            style={{ background: 'rgba(252,249,246,0.8)' }}
          >
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <label
                  className="block mb-1.5 uppercase tracking-widest"
                  style={{
                    fontFamily: 'var(--font-manrope)',
                    fontSize: '0.625rem',
                    fontWeight: 700,
                    color: '#5f5e58',
                  }}
                >
                  Alias Name
                </label>
                <div className="flex items-center rounded-lg overflow-hidden" style={{ border: '1px solid rgba(222,192,183,0.4)' }}>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. hello"
                    className="flex-1 px-3 py-2.5 bg-white text-sm outline-none"
                    style={{
                      fontFamily: 'var(--font-manrope)',
                      color: '#1c1c1a',
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && name.trim()) handleCreate()
                    }}
                  />
                  <span
                    className="px-3 py-2.5 text-sm flex-shrink-0"
                    style={{
                      fontFamily: 'var(--font-manrope)',
                      color: '#8b726a',
                      background: 'rgba(229,226,218,0.4)',
                    }}
                  >
                    @{domain}
                  </span>
                </div>
              </div>
              <div className="sm:w-48">
                <label
                  className="block mb-1.5 uppercase tracking-widest"
                  style={{
                    fontFamily: 'var(--font-manrope)',
                    fontSize: '0.625rem',
                    fontWeight: 700,
                    color: '#5f5e58',
                  }}
                >
                  Label <span style={{ fontWeight: 400, opacity: 0.6 }}>(optional)</span>
                </label>
                <input
                  type="text"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  placeholder="e.g. Support"
                  className="w-full px-3 py-2.5 rounded-lg bg-white text-sm outline-none"
                  style={{
                    fontFamily: 'var(--font-manrope)',
                    color: '#1c1c1a',
                    border: '1px solid rgba(222,192,183,0.4)',
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && name.trim()) handleCreate()
                  }}
                />
              </div>
              <div className="flex items-end">
                <button
                  type="button"
                  onClick={handleCreate}
                  disabled={isPending || !name.trim()}
                  className="premium-gradient text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 soft-elevation active:scale-95 transition-all disabled:opacity-60"
                  style={{
                    fontFamily: 'var(--font-manrope)',
                    fontSize: '0.875rem',
                  }}
                >
                  {isPending ? 'Creating…' : 'Create'}
                </button>
              </div>
            </div>
            {error && (
              <p
                className="mt-3 text-xs"
                style={{ fontFamily: 'var(--font-manrope)', color: '#ba1a1a' }}
              >
                {error}
              </p>
            )}
          </div>
        )}

        {/* Alias List */}
        {initialAliases.length > 0 ? (
          <div className="space-y-1">
            {/* Table header — desktop only */}
            <div
              className="hidden md:grid grid-cols-12 px-4 py-3 uppercase tracking-widest"
              style={{
                fontFamily: 'var(--font-manrope)',
                fontSize: '0.625rem',
                color: '#5f5e58',
                fontWeight: 700,
              }}
            >
              <div className="col-span-5">Address</div>
              <div className="col-span-3">Label</div>
              <div className="col-span-3">Created</div>
              <div className="col-span-1" />
            </div>

            {initialAliases.map((alias) => (
              <div
                key={alias.id}
                className="grid grid-cols-1 md:grid-cols-12 items-center px-4 py-4 rounded-xl transition-all group gap-2 md:gap-0"
                style={{ background: 'rgba(252,249,246,0.5)' }}
              >
                {/* Address */}
                <div className="md:col-span-5 flex items-center gap-2">
                  <span
                    className="text-[10px] font-bold uppercase tracking-widest md:hidden"
                    style={{
                      color: '#8b726a',
                      fontFamily: 'var(--font-manrope)',
                      minWidth: '4rem',
                    }}
                  >
                    Address
                  </span>
                  <span
                    className="text-sm font-medium"
                    style={{
                      color: '#1c1c1a',
                      fontFamily: 'var(--font-manrope)',
                    }}
                  >
                    {alias.address}
                  </span>
                </div>

                {/* Label */}
                <div className="md:col-span-3 flex items-center gap-2">
                  <span
                    className="text-[10px] font-bold uppercase tracking-widest md:hidden"
                    style={{
                      color: '#8b726a',
                      fontFamily: 'var(--font-manrope)',
                      minWidth: '4rem',
                    }}
                  >
                    Label
                  </span>
                  <span
                    className="text-sm"
                    style={{
                      color: alias.label ? '#5f5e58' : '#dec0b7',
                      fontFamily: 'var(--font-manrope)',
                      fontStyle: alias.label ? 'normal' : 'italic',
                    }}
                  >
                    {alias.label || 'No label'}
                  </span>
                </div>

                {/* Created */}
                <div className="md:col-span-3 flex items-center gap-2">
                  <span
                    className="text-[10px] font-bold uppercase tracking-widest md:hidden"
                    style={{
                      color: '#8b726a',
                      fontFamily: 'var(--font-manrope)',
                      minWidth: '4rem',
                    }}
                  >
                    Created
                  </span>
                  <span
                    className="text-xs"
                    style={{
                      color: '#8b726a',
                      fontFamily: 'var(--font-manrope)',
                    }}
                  >
                    {new Date(alias.createdAt).toLocaleDateString()}
                  </span>
                </div>

                {/* Delete */}
                <div className="md:col-span-1 flex justify-end">
                  <button
                    type="button"
                    onClick={() => handleDelete(alias.id)}
                    disabled={deletingId === alias.id}
                    className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg transition-all hover:bg-red-50"
                    title="Delete alias"
                  >
                    <span
                      className="material-symbols-outlined"
                      style={{
                        fontSize: '18px',
                        color: deletingId === alias.id ? '#dec0b7' : '#8b726a',
                      }}
                    >
                      {deletingId === alias.id ? 'hourglass_empty' : 'delete'}
                    </span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          !showForm && (
            <div
              className="text-center py-10"
              style={{ color: '#8b726a' }}
            >
              <span
                className="material-symbols-outlined block mb-3"
                style={{ fontSize: '32px', color: '#dec0b7' }}
              >
                alternate_email
              </span>
              <p
                className="italic"
                style={{
                  fontFamily: 'var(--font-newsreader)',
                  fontSize: '0.9375rem',
                }}
              >
                No aliases yet. Create one to start receiving mail.
              </p>
            </div>
          )
        )}
      </div>
    </div>
  )
}
