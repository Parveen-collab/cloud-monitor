1. to implement /health endpoint

To implement **Live Health Polling** with component health badges and uptime, here are the relevant file paths:

### 1. Primary Component / Implementation Paths
* **Component File**: [HealthCard.tsx] *(or renamed to `HealthCard.tsx`)*
  * **Role**: Component displaying the real-time status, uptime, and health badges for `api`, `metrics_exporter`, and `engine`.
* **Main Dashboard Layout**: [App.tsx]
  * **Role**: Orchestrates the polling interval (`useEffect` with `setInterval`), holds the health state, and renders the card.
* *(Optional / Header display)*: [Header.tsx]
  * **Role**: If you prefer showing live uptime in the top navigation header alongside the card.

---

### 2. Supporting Files (Already Configured)
* **API Service**: [api.ts](file:///c:/Users/Parveen%20kumar/miniprojectfrontend/cloudmonitor-frontend/src/services/api.ts#L26-L31)
  * Exports [fetchHealth](file:///c:/Users/Parveen%20kumar/miniprojectfrontend/cloudmonitor-frontend/src/services/api.ts#L26-L31) which queries `/health`.
* **TypeScript Types**: [monitor.ts](file:///c:/Users/Parveen%20kumar/miniprojectfrontend/cloudmonitor-frontend/src/types/monitor.ts#L1-L12)
  * Defines the [HealthStatus](file:///c:/Users/Parveen%20kumar/miniprojectfrontend/cloudmonitor-frontend/src/types/monitor.ts#L1-L12) interface containing `status`, `uptime_seconds`, and `components`.