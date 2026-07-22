import { PageAccountActivation } from '@portal/core'

interface ActivateAccountPageProps {
  searchParams: Promise<{ token?: string | string[] }>
}

export default async function ActivateAccountPage({ searchParams }: ActivateAccountPageProps) {
  const { token } = await searchParams

  return typeof token === 'string'
    ? <PageAccountActivation token={token} />
    : <PageAccountActivation />
}
