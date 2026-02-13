import Sidebar from './Sidebar'

interface PageWrapperProps {
  children: React.ReactNode
  title: string
  subtitle?: string
  actions?: React.ReactNode
}

export default function PageWrapper({ children, title, subtitle, actions }: PageWrapperProps) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 ml-60 min-h-screen">
        {/* Header */}
        <header
          className="sticky top-0 z-20 px-8 py-4 flex items-center justify-between"
          style={{
            background: 'rgba(5, 5, 8, 0.85)',
            backdropFilter: 'blur(16px)',
            borderBottom: '1px solid rgba(99, 99, 160, 0.15)',
          }}
        >
          <div>
            <h1 className="font-display text-xl font-bold" style={{ color: '#e8e8f0' }}>
              {title}
            </h1>
            {subtitle && (
              <p className="text-sm mt-0.5" style={{ color: '#5a5a78' }}>
                {subtitle}
              </p>
            )}
          </div>
          {actions && <div className="flex items-center gap-3">{actions}</div>}
        </header>

        {/* Content */}
        <div className="px-8 py-6">{children}</div>
      </main>
    </div>
  )
}
