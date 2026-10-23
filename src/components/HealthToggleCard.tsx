
import { useState } from "react";
import { toggleHealth } from "src/services/api";

export function HealthToggleCard() {
    const [loading, setLoading] = useState(false);
    const [isHealthy, setIsHealthy] = useState<boolean | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);

    const handleToggle = async (status: boolean) => {
        setLoading(true);
        setError(null);
        setMessage(null);

        try {
            const response = await toggleHealth(status);

            setIsHealthy(response.is_healthy);
            setMessage(
                `Application marked as ${response.is_healthy ? "healthy" : "unhealthy"
                }.`
            );
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Unable to update application health."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="health-toggle-card">
            <div className="health-toggle-header">
                <div>
                    <p className="health-toggle-eyebrow">FAULT INJECTION</p>
                    <h2>Health Status Control</h2>
                    <p>
                        Simulate healthy or unhealthy application states
                        to test monitoring and alert detection.
                    </p>
                </div>

                <span
                    className={`health-toggle-badge ${isHealthy === null
                        ? "health-unknown"
                        : isHealthy
                            ? "health-good"
                            : "health-bad"
                        }`}
                >
                    {isHealthy === null
                        ? "Awaiting action"
                        : isHealthy
                            ? "Healthy"
                            : "Unhealthy"}
                </span>
            </div>

            <div className="health-toggle-actions">
                <button
                    type="button"
                    className="health-button health-button-good"
                    onClick={() => handleToggle(true)}
                    disabled={loading || isHealthy === true}
                >
                    {loading ? "Updating..." : "Set Healthy"}
                </button>

                <button
                    type="button"
                    className="health-button health-button-bad"
                    onClick={() => handleToggle(false)}
                    disabled={loading || isHealthy === false}
                >
                    {loading ? "Updating..." : "Set Unhealthy"}
                </button>
            </div>

            {message && (
                <p className="health-toggle-success" role="status">
                    {message}
                </p>
            )}

            {error && (
                <p className="health-toggle-error" role="alert">
                    {error}
                </p>
            )}

            <p className="health-toggle-note">
                The displayed status reflects the last successful toggle
                response. Your health polling component should fetch
                /health again to reflect the backend's current state.
            </p>
        </section>
    );
}
