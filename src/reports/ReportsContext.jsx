import { createContext, useContext, useMemo, useState } from "react";
import { CITIZEN_REPORTS, nearestSite, NOW_ISO } from "../data/mockData";

const ReportsContext = createContext(null);

// Shared between the Operator Console and the Public Platform (mounted around
// the whole route tree in App.jsx, unlike PublicAuthProvider which only wraps
// /public) so a report submitted on the public side appears on the operator
// side within the same session, without a page reload.
export function ReportsProvider({ children }) {
  const [reports, setReports] = useState(CITIZEN_REPORTS);

  const value = useMemo(
    () => ({
      reports: [...reports].sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt)),
      addReport: (draft) => {
        const geolocation = draft.geolocation ?? { status: "unavailable", lat: null, lng: null, accuracyMeters: null };
        const nearest = nearestSite(geolocation.lat, geolocation.lng);
        const report = {
          id: `cr-${crypto.randomUUID()}`,
          reporter: draft.reporter ?? null,
          locationDetail: draft.locationDetail,
          description: draft.description,
          photos: draft.photos ?? [],
          nearestSiteId: nearest?.site.id ?? null,
          nearestSiteDistanceKm: nearest?.distanceKm ?? null,
          deviceMeta: {
            geolocation,
            connection: draft.connection ?? { supported: false, effectiveType: null, downlinkMbps: null, saveData: null },
            battery: draft.battery ?? { simulated: true, levelPercent: null },
          },
          workflowStatus: "new",
          escalatedWarningId: null,
          reviewedBy: null,
          reviewedAt: null,
          reviewNote: null,
          // Frozen fixture clock, not live Date.now() — timeAgo()/formatDateTime()
          // elsewhere in the app render relative to NOW, not real wall-clock time.
          submittedAt: NOW_ISO,
        };
        setReports((prev) => [report, ...prev]);
        return report;
      },
      updateReportStatus: (id, status, { reviewedBy = null, reviewNote = null } = {}) => {
        setReports((prev) =>
          prev.map((r) =>
            r.id === id
              ? {
                  ...r,
                  workflowStatus: status,
                  reviewedBy: reviewedBy ?? r.reviewedBy,
                  reviewNote: reviewNote ?? r.reviewNote,
                  reviewedAt: NOW_ISO,
                }
              : r
          )
        );
      },
      reportById: (id) => reports.find((r) => r.id === id),
    }),
    [reports]
  );

  return <ReportsContext.Provider value={value}>{children}</ReportsContext.Provider>;
}

export function useReports() {
  const ctx = useContext(ReportsContext);
  if (!ctx) throw new Error("useReports must be used within ReportsProvider");
  return ctx;
}
