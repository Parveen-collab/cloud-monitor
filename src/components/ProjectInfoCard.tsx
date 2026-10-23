
import { useEffect, useState } from "react";
import type { ProjectInfo } from "src/types/monitor";
import { fetchProjectInfo } from "src/services/api";

export default function ProjectInfoCard() {
    const [project, setProject] = useState<ProjectInfo | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadProjectInfo = async () => {
            try {
                const data = await fetchProjectInfo();
                setProject(data);
            } catch (err) {
                setError(
                    err instanceof Error
                        ? err.message
                        : "Failed to load project information"
                );
            } finally {
                setLoading(false);
            }
        };

        void loadProjectInfo();
    }, []);

    if (loading) return <p>Loading project information...</p>;
    if (error) return <p role="alert">{error}</p>;
    if (!project) return null;

    const apiBase =
        import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

    return (
        <section>
            <h2>{project.project}</h2>
            <p>{project.description}</p>
            <p>Version: {project.version}</p>

            <h3>Backend Endpoints</h3>
            <ul>
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
    );
}
