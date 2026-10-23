
import { useState } from "react";
import { simulateError } from "src/services/api";

type SimulationResult = {
    status: number;
    detail: string;
};

export function ErrorSimulationCard() {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<SimulationResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleSimulateError = async () => {
        setLoading(true);
        setResult(null);
        setError(null);

        try {
            const data = await simulateError();
            setResult(data);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Unable to trigger error simulation."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="error-simulation-card">
            <div className="error-simulation-header">
                <div>
                    <p className="error-simulation-eyebrow">SRE TESTING</p>
                    <h2>Error Simulation</h2>
                    <p>
                        Generate a simulated HTTP 500 response to test
                        error monitoring and alerting.
                    </p>
                </div>

                <span className="error-simulation-code">POST · 500</span>
            </div>

            <button
                type="button"
                className="error-simulation-button"
                onClick={handleSimulateError}
                disabled={loading}
            >
                {loading ? "Triggering simulation..." : "Simulate Server Error"}
            </button>

            {result && (
                <div className="simulation-result simulation-result-success" role="status">
                    <strong>
                        Simulation triggered · HTTP {result.status}
                    </strong>
                    <p>{result.detail}</p>
                    <small>
                        Check your Prometheus metrics and alerting rules
                        to verify that the error was recorded.
                    </small>
                </div>
            )}

            {error && (
                <div className="simulation-result simulation-result-error" role="alert">
                    <strong>Simulation could not be verified</strong>
                    <p>{error}</p>
                </div>
            )}
        </section>
    );
}
