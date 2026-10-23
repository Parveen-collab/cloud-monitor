
import { useState } from "react";
import { simulateLatency } from "src/services/api";
import type { LatencyResponse } from "src/types/monitor";

export function LatencySimulationCard() {
    const [delay, setDelay] = useState("1");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<LatencyResponse | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleSimulate = async () => {
        const seconds = Number(delay);

        if (delay.trim() === "" || !Number.isFinite(seconds) ||
            seconds < 0 || seconds > 10) {
            setError("Enter a delay between 0 and 10 seconds.");
            setResult(null);
            return;
        }

        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const data = await simulateLatency(seconds);
            setResult(data);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Unable to simulate latency."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="latency-simulation-card">
            <div className="latency-simulation-header">
                <div>
                    <p className="latency-eyebrow">SLO TESTING</p>
                    <h2>Latency Simulation</h2>
                    <p>
                        Introduce an artificial delay to test response
                        time measurements and alert thresholds.
                    </p>
                </div>

                <span className="latency-method">GET · /simulate/latency</span>
            </div>

            <div className="latency-controls">
                <label htmlFor="latency-delay">
                    Delay duration
                    <span className="latency-input-hint">
                        Choose a value from 0 to 10 seconds
                    </span>
                </label>

                <div className="latency-input-row">
                    <input
                        id="latency-delay"
                        type="number"
                        min="0"
                        max="10"
                        step="0.5"
                        value={delay}
                        disabled={loading}
                        onChange={(event) => setDelay(event.target.value)}
                    />

                    <span className="latency-unit">seconds</span>

                    <button
                        type="button"
                        className="latency-run-button"
                        onClick={handleSimulate}
                        disabled={loading}
                    >
                        {loading ? "Simulating..." : "Simulate Latency"}
                    </button>
                </div>
            </div>

            {loading && (
                <p className="latency-message" role="status">
                    Waiting for the backend response...
                </p>
            )}

            {result && (
                <div className="latency-result" role="status">
                    <span className="latency-result-label">Simulation completed</span>
                    <strong>{result.delayed_by} seconds</strong>
                    <p>{result.message}</p>
                    <small>
                        Check the Prometheus telemetry viewer for updated
                        latency measurements.
                    </small>
                </div>
            )}

            {error && (
                <div className="latency-error" role="alert">
                    {error}
                </div>
            )}
        </section>
    );
}
