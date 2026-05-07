import { getDashboardData } from 'pages/dashboard'
import { DashboardPage } from 'pages/dashboard'

export default async function Page() {
  const data = await getDashboardData()
  return <DashboardPage data={data} />
}
