import { Suspense } from 'react'
import { getDashboardData, DashboardPage } from 'pages/dashboard'
import Loading from '../../loading'

async function DashboardContent() {
  const data = await getDashboardData()
  return <DashboardPage data={data} />
}

export default function Page() {
  return (
    <Suspense fallback={<Loading />}>
      <DashboardContent />
    </Suspense>
  )
}
