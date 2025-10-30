import React, { useEffect, useState } from 'react'
import AzureKarnatakaMap from './components/AzureKarnatakaMap'
import DistrictInfoPanel from './components/DistrictInfoPanel'

interface MonthlyMetric {
  fin_year?: string
  month?: string
  people_worked?: number
  wages?: number
  total_expenditure?: number
  works_completed?: number
}

interface District {
  id: number
  name: string
  name_kn?: string
}

import React, { useEffect, useState } from 'react'
import AzureKarnatakaMap from './components/AzureKarnatakaMap'
import DistrictInfoPanel from './components/DistrictInfoPanel'

interface MonthlyMetric {
  fin_year?: string
  month?: string
  people_worked?: number
  wages?: number
  total_expenditure?: number
  works_completed?: number
}

interface District {
  id: number
  name: string
  name_kn?: string
}

export default function App() {
  const [selectedDistrict, setSelectedDistrict] = useState<District | null>(null)
  const [latestMetric, setLatestMetric] = useState<MonthlyMetric | null>(null)
  const [monthlyMetrics, setMonthlyMetrics] = useState<MonthlyMetric[] | null>(null)
  const [useKannada, setUseKannada] = useState(true)

  useEffect(() => {
    if (!selectedDistrict) return
    const mock: MonthlyMetric[] = []
    for (let i = 5; i >= 0; i--) {
      mock.push({
        fin_year: '2024-25',
        month: `M-${i}`,
        people_worked: Math.round(10000 + Math.random() * 90000),
        wages: Math.round(50000 + Math.random() * 150000),
        total_expenditure: Math.round(200000 + Math.random() * 800000),
        works_completed: Math.round(10 + Math.random() * 90),
      })
    }
    setMonthlyMetrics(mock)
    setLatestMetric(mock[mock.length - 1])
  }, [selectedDistrict])

  const handleDistrictClick = (d: { id: number; name: string; name_kn?: string }) => {
    setSelectedDistrict({ id: d.id, name: d.name, name_kn: d.name_kn })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-karnataka-red/10 via-white to-karnataka-yellow/10 p-6">
      <header className="max-w-7xl mx-auto mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{useKannada ? 'MGNREGA ಕರ್ನಾಟಕ' : 'MGNREGA Karnataka'}</h1>
          <p className="text-sm text-gray-600">{useKannada ? 'ಮಾಸಿಕ ವರದಿ' : 'Monthly dashboard'}</p>
        </div>
        <div>
          <button className="px-3 py-1 rounded bg-white shadow" onClick={() => setUseKannada((s) => !s)}>
            {useKannada ? 'English' : 'ಕನ್ನಡ'}
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto">
        <div className="grid" style={{ gridTemplateColumns: '55% 40%', gap: '1rem' }}>
          <div>
            <div className="bg-white rounded-xl shadow-lg p-4" style={{ height: 420 }}>
              <h2 className="font-semibold mb-2">{useKannada ? 'ನಕ್ಷೆ' : 'Map'}</h2>
              <AzureKarnatakaMap onDistrictClick={handleDistrictClick} selectedDistrictId={selectedDistrict?.id ?? null} />
            </div>
          </div>

          <div>
            <DistrictInfoPanel selectedDistrict={selectedDistrict} latestMetric={latestMetric} monthlyMetrics={monthlyMetrics} useKannada={useKannada} />
          </div>
        </div>
      </main>
    </div>
  )
}
export default function App() {
