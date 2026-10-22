import React from 'react';
import { Activity, CheckCircle2, AlertTriangle, XCircle, Clock, Server, Cpu, Radio } from 'lucide-react';
import type { HealthStatus } from 'src/types/monitor';

interface HealthCardProps {
    health: HealthStatus | null;
    loading: boolean;
    error: string | null;
    lastUpdated: Date | null;
}

// Utility to format seconds into readable uptime (e.g., 2h 15m 30s)
const formatUptime = (totalSeconds: number): string => {
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = Math.floor(totalSeconds % 60);

    const parts = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    parts.push(`${seconds}s`);

    return parts.join(' ');
};

export const HealthCard: React.FC<HealthCardProps> = ({ health, loading, error, lastUpdated }) => {
    const getStatusColor = (status?: string) => {
        switch (status?.toLowerCase()) {
            case 'healthy':
            case 'ok':
            case 'up':
                return {
                    bg: '#052e16',
                    border: '#16a34a',
                    text: '#4ade80',
                    dot: '#22c55e',
                    icon: <CheckCircle2 size={18} className="text-green-400" />,
                };
            case 'degraded':
                return {
                    bg: '#451a03',
                    border: '#d97706',
                    text: '#fcd34d',
                    dot: '#f59e0b',
                    icon: <AlertTriangle size={18} className="text-amber-400" />,
                };
            default:
                return {
                    bg: '#450a0a',
                    border: '#dc2626',
                    text: '#f87171',
                    dot: '#ef4444',
                    icon: <XCircle size={18} className="text-red-400" />,
                };
        }
    };

    const overallStyle = getStatusColor(health?.status);

    return (
        <div
            style={{
                background: '#1a1d24',
                borderRadius: '12px',
                border: `1px solid ${health ? overallStyle.border : '#2e3440'}`,
                padding: '24px',
                color: '#eceff4',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.35)',
                textAlign: 'left',
                maxWidth: '800px',
                margin: '20px auto',
            }}
        >
            {/* Header Bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Activity size={22} color="#88c0d0" />
                    <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600 }}>System Health Status</h2>
                </div>

                {/* Global Status Pill */}
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        background: overallStyle.bg,
                        border: `1px solid ${overallStyle.border}`,
                        padding: '6px 14px',
                        borderRadius: '20px',
                        color: overallStyle.text,
                        fontWeight: 600,
                        fontSize: '0.875rem',
                        textTransform: 'uppercase',
                    }}
                >
                    <span
                        style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            backgroundColor: overallStyle.dot,
                            boxShadow: `0 0 8px ${overallStyle.dot}`,
                        }}
                    />
                    {error ? 'UNREACHABLE' : health?.status || (loading ? 'CONNECTING...' : 'UNKNOWN')}
                </div>
            </div>

            {error ? (
                <div style={{ background: '#3b1212', border: '1px solid #7f1d1d', padding: '12px', borderRadius: '8px', color: '#fca5a5' }}>
                    {error}
                </div>
            ) : (
                <>
                    {/* Metadata Row: Service, Environment, Uptime */}
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                            gap: '12px',
                            marginBottom: '20px',
                            background: '#242933',
                            padding: '12px 16px',
                            borderRadius: '8px',
                        }}
                    >
                        <div>
                            <span style={{ fontSize: '0.75rem', color: '#81a1c1', textTransform: 'uppercase' }}>Service</span>
                            <p style={{ margin: '4px 0 0', fontWeight: 500 }}>{health?.service || 'cloud-monitor'}</p>
                        </div>
                        <div>
                            <span style={{ fontSize: '0.75rem', color: '#81a1c1', textTransform: 'uppercase' }}>Environment</span>
                            <p style={{ margin: '4px 0 0', fontWeight: 500 }}>{health?.environment || 'production'}</p>
                        </div>
                        <div>
                            <span style={{ fontSize: '0.75rem', color: '#81a1c1', textTransform: 'uppercase' }}>Version</span>
                            <p style={{ margin: '4px 0 0', fontWeight: 500 }}>v{health?.version || '1.0.0'}</p>
                        </div>
                        <div>
                            <span style={{ fontSize: '0.75rem', color: '#81a1c1', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <Clock size={12} /> Live Uptime
                            </span>
                            <p style={{ margin: '4px 0 0', fontWeight: 600, color: '#88c0d0' }}>
                                {health?.uptime_seconds !== undefined ? formatUptime(health.uptime_seconds) : '--'}
                            </p>
                        </div>
                    </div>

                    {/* Component Health Badges */}
                    <div>
                        <h4 style={{ margin: '0 0 12px', fontSize: '0.9rem', color: '#d8dee9', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            Component Health
                        </h4>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                            {/* API Badge */}
                            <ComponentBadge
                                name="API Gateway"
                                status={health?.components?.api}
                                icon={<Server size={18} />}
                            />

                            {/* Metrics Exporter Badge */}
                            <ComponentBadge
                                name="Metrics Exporter"
                                status={health?.components?.metrics_exporter}
                                icon={<Radio size={18} />}
                            />

                            {/* Engine Badge */}
                            <ComponentBadge
                                name="Engine Worker"
                                status={health?.components?.engine}
                                icon={<Cpu size={18} />}
                            />
                        </div>
                    </div>
                </>
            )}

            {/* Polling Footer Indicator */}
            <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#6e7786' }}>
                <span>Polling interval: 3s</span>
                <span>{lastUpdated ? `Last updated: ${lastUpdated.toLocaleTimeString()}` : 'Waiting for telemetry...'}</span>
            </div>
        </div>
    );
};

interface ComponentBadgeProps {
    name: string;
    status?: string;
    icon: React.ReactNode;
}

const ComponentBadge: React.FC<ComponentBadgeProps> = ({ name, status, icon }) => {
    const isHealthy = status?.toLowerCase() === 'healthy' || status?.toLowerCase() === 'ok' || status?.toLowerCase() === 'up';

    return (
        <div
            style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 14px',
                borderRadius: '8px',
                backgroundColor: '#242933',
                border: '1px solid #3b4252',
            }}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: '#81a1c1' }}>{icon}</span>
                <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>{name}</span>
            </div>
            <span
                style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '2px 8px',
                    borderRadius: '12px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    background: isHealthy ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                    color: isHealthy ? '#4ade80' : '#f87171',
                    border: `1px solid ${isHealthy ? '#16a34a' : '#dc2626'}`,
                }}
            >
                <span
                    style={{
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        backgroundColor: isHealthy ? '#22c55e' : '#ef4444',
                    }}
                />
                {status || 'Unknown'}
            </span>
        </div>
    );
};
