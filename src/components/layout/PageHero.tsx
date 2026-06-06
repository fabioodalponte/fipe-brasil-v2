import type { ReactNode } from 'react'

type PageHeroProps = {
  eyebrow?: string
  title: string
  subtitle?: string
  children?: ReactNode
}

export function PageHero({ eyebrow, title, subtitle, children }: PageHeroProps) {
  return (
    <section className="min-w-0 rounded border border-slate-200 bg-white p-5">
      {eyebrow ? (
        <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">{eyebrow}</p>
      ) : null}
      <h1 className="mt-2 break-words text-3xl font-bold text-slate-950 md:text-4xl">{title}</h1>
      {subtitle ? <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{subtitle}</p> : null}
      {children ? <div className="mt-4">{children}</div> : null}
    </section>
  )
}
