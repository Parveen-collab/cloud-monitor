import { useState, useEffect } from 'react';
import type { HealthStatus } from 'src/types/monitor';
import { fetchHealth } from 'src/services/api';
import { HealthCard } from 'src/components/HealthCard';
import 'src/App.css';

function App() {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadHealth = async () => {
      try {
        const data = await fetchHealth();
        if (isMounted) {
          setHealth(data);
          setError(null);
          setLastUpdated(new Date());
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to reach /health endpoint');
          setLoading(false);
        }
      }
    };

    // 1. Initial immediate fetch
    loadHealth();

    // 2. Poll every 3 seconds
    const intervalId = setInterval(loadHealth, 3000);

    // 3. Cleanup on unmount
    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, []);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0f1115', padding: '40px 20px', fontFamily: 'sans-serif' }}>
      <header style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h1 style={{ color: '#eceff4', fontSize: '2rem', marginBottom: '8px' }}>Cloud Monitor Dashboard</h1>
        <p style={{ color: '#81a1c1', margin: 0 }}>Real-time telemetry, SRE controls, and infrastructure health</p>
      </header>

      <main>
        <HealthCard
          health={health}
          loading={loading}
          error={error}
          lastUpdated={lastUpdated}
        />
      </main>
    </div>
  );
}

export default App;
