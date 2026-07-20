'use client'

import { Text } from '@portal/ui'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export interface SectionTab {
  label: string
  href: string
}

export interface SectionTabsProps {
  tabs: SectionTab[]
  className?: string
}

export function SectionTabs({ tabs, className }: SectionTabsProps) {
  const pathname = usePathname()
  
  const activeHref = tabs
    .map((tab) => tab.href)
    .filter((href) => pathname === href || pathname.startsWith(`${href}/`))
    .sort((a, b) => b.length - a.length)[0]

  return (
    <nav
      aria-label="Seções"
      className={['border-b border-border-default', className].filter(Boolean).join(' ')}
    >
      <ul role="list" className="flex gap-6">
        {tabs.map((tab) => {
          const isActive = tab.href === activeHref

          return (
            <li key={tab.href}>
              <Link
                href={tab.href}
                aria-current={isActive ? 'page' : undefined}
                className={[
                  '-mb-px block border-b-2 pb-3 pt-1 transition-colors lg:pb-4',
                  isActive ? 'border-interactive-default' : 'border-transparent hover:border-border-default',
                ].join(' ')}
              >
                <Text
                  as="span"
                  variant={isActive ? 'label-md-emphasis' : 'label-md'}
                  tone={isActive ? 'brand' : 'secondary'}
                >
                  {tab.label}
                </Text>
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
