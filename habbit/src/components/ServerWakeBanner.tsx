import { useEffect, useState } from 'react'

const API = import.meta.env.VITE_API_URL || 'http://localhost:7001'
const isProductionApi = !API.includes('localhost') && !API.includes('127.0.0.1')

export default function ServerWakeBanner() {
    const [waking, setWaking] = useState(isProductionApi)

    useEffect(() => {
        if (!isProductionApi) return

        let cancelled = false

        fetch(`${API}/health`)
            .then(() => {
                if (!cancelled) setWaking(false)
            })
            .catch(() => {
                if (!cancelled) setWaking(false)
            })

        return () => {
            cancelled = true
        }
    }, [])

    if (!waking) return null

    return (
        <div className="server-wake-banner" role="status">
            Connecting to server… First load can take up to 30 seconds on the free hosting plan.
        </div>
    )
}
