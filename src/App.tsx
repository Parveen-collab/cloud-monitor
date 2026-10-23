
import { useState, useEffect } from 'react';
import type { HealthStatus, ProjectInfo } from 'src/types/monitor';
import { fetchHealth, fetchProjectInfo } from 'src/services/api';
import { HealthCard } from 'src/components/HealthCard';
import { MetricsViewer } from 'src/components/MetricsViewer';
import 'src/App.css';
import { ServiceStatusCard } from './components/ServiceStatusCard';
import { ErrorSimulationCard } from './components/ErrorSimulationCard';
import { LatencySimulationCard } from './components/LatencySimulationCard';
import { HealthToggleCard } from './components/HealthToggleCard';

export default function App() {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [project, setProject] = useState<ProjectInfo | null>(null);

  const [loading, setLoading] = useState<boolean>(true);
  const [projectLoading, setProjectLoading] = useState<boolean>(true);

  const [error, setError] = useState<string | null>(null);
  const [projectError, setProjectError] = useState<string | null>(null);

  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Fetch project information once when the dashboard loads.
  useEffect(() => {
    let isMounted = true;

    const loadProjectInfo = async () => {
      try {
        const data = await fetchProjectInfo();

        if (isMounted) {
          setProject(data);
          setProjectError(null);
        }
      } catch (err) {
        if (isMounted) {
          setProjectError(
            err instanceof Error
              ? err.message
              : 'Failed to fetch project information'
          );
        }
      } finally {
        if (isMounted) {
          setProjectLoading(false);
        }
      }
    };

    void loadProjectInfo();

    return () => {
      isMounted = false;
    };
  }, []);

  // Fetch health immediately and poll every 3 seconds.
  useEffect(() => {
    let isMounted = true;

    const loadHealth = async () => {
      try {
        const data = await fetchHealth();

        if (isMounted) {
          setHealth(data);
          setError(null);
          setLastUpdated(new Date());
        }
      } catch (err) {
        if (isMounted) {
          setError(
            err instanceof Error
              ? err.message
              : 'Failed to reach /health endpoint'
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    void loadHealth();

    const intervalId = setInterval(() => {
      void loadHealth();
    }, 3000);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, []);

  const apiBase =
    import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

  return (
    <div className="app-shell">
      <header className="app-header">
        <h1
          style={{
            color: '#eceff4',
            fontSize: '2rem',
            marginBottom: '8px',
          }}
        >
          {project?.project ?? 'Cloud Monitor Dashboard'}
        </h1>

        <p style={{ color: '#81a1c1', margin: 0 }}>
          {project?.description ??
            'Real-time telemetry, SRE controls, and infrastructure health'}
        </p>

        {project && (
          <p style={{ color: '#a3be8c', marginTop: '10px' }}>
            Version {project.version}
          </p>
        )}
      </header>

      <main className="app-main">
        {projectLoading && (
          <p style={{ color: '#eceff4' }}>
            Loading project information...
          </p>
        )}

        {projectError && (
          <p role="alert" style={{ color: '#bf616a' }}>
            Project information unavailable: {projectError}
          </p>
        )}

        {project && (
          <section className="project-endpoints">
            <h2 style={{ marginTop: 0 }}>Backend Endpoints</h2>

            <ul style={{ lineHeight: 2 }}>
              <li>
                <a href={`${apiBase}${project.docs_url}`} target="_blank" rel="noreferrer">
                  API Documentation
                </a>
              </li>
              <li>
                <a href={`${apiBase}${project.metrics_url}`} target="_blank" rel="noreferrer">
                  Prometheus Metrics
                </a>
              </li>
              <li>
                <a href={`${apiBase}${project.health_url}`} target="_blank" rel="noreferrer">
                  Health Endpoint
                </a>
              </li>
            </ul>
          </section>
        )}

        <ServiceStatusCard />

        <HealthCard
          health={health}
          loading={loading}
          error={error}
          lastUpdated={lastUpdated}
        />

        <ErrorSimulationCard />

        <LatencySimulationCard />

        <HealthToggleCard />

        <MetricsViewer />
      </main>
    </div>
  );
}

