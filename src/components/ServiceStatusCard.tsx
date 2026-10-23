
import { useEffect, useState } from 'react';
import type { ServiceStatus } from 'src/types/monitor';
import { fetchStatus } from 'src/services/api';

export function ServiceStatusCard() {
    const [status, setStatus] = useState<ServiceStatus | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let isMounted = true;

        const loadStatus = async () => {
            try {
                const data = await fetchStatus();

                if (isMounted) {
                    setStatus(data);
                    setError(null);
                }
            } catch (err) {
                if (isMounted) {
                    setError(
                        err instanceof Error
                            ? err.message
                            : 'Unable to fetch service status'
                    );
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        void loadStatus();

        const intervalId = window.setInterval(() => {
            void loadStatus();
        }, 5000);

        return () => {
            isMounted = false;
            window.clearInterval(intervalId);
        };
    }, []);

    const isOperational =
        status?.status.toLowerCase() === 'operational';

    const updatedAt = status
        ? new Date(status.timestamp * 1000).toLocaleString()
        : null;

    return (
        <section className="service-status-card">
            <div className="service-status-heading">
                <div>
                    <p className="service-status-eyebrow">BACKEND OVERVIEW</p>
                    <h2>Service Status</h2>
                    <p className="service-status-description">
                        API availability and monitoring configuration
                    </p>
                </div>

                {status && (
                    <span
                        className={`service-status-badge ${isOperational ? 'is-operational' : 'is-degraded'
                            }`}
                    >
                        <span className="status-dot" />
                        {status.status}
                    </span>
                )}
            </div>

            {loading && <p className="service-status-message">Loading service status...</p>}

            {error && (
                <p className="service-status-error" role="alert">
                    {error}
                </p>
            )}

            {status && (
                <>
                    <div className="service-status-grid">
                        <div className="service-status-item">
                            <span className="service-status-label">Service</span>
                            <strong>{status.service}</strong>
                        </div>

                        <div className="service-status-item">
                            <span className="service-status-label">Metrics</span>
                            <strong>
                                {status.monitoring.metrics_enabled ? 'Enabled' : 'Disabled'}
                            </strong>
                        </div>

                        <div className="service-status-item">
                            <span className="service-status-label">Monitoring Target</span>
                            <strong>{status.monitoring.target}</strong>
                        </div>
                    </div>

                    <div className="service-status-footer">
                        <span>Last reported: {updatedAt}</span>
                        <span>Auto-refresh: 5s</span>
                    </div>
                </>
            )}
        </section>
    );
}
