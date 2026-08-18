import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./Landing.jsx";
import OperatorLayout from "./layouts/OperatorLayout.jsx";
import PublicLayout from "./layouts/PublicLayout.jsx";
import { PublicAuthProvider } from "./public/PublicAuthContext.jsx";
import { ReportsProvider } from "./reports/ReportsContext.jsx";

import Dashboard from "./operator/Dashboard.jsx";
import OperatorMap from "./operator/OperatorMap.jsx";
import SiteDetail from "./operator/SiteDetail.jsx";
import Warnings from "./operator/Warnings.jsx";
import WarningDetail from "./operator/WarningDetail.jsx";
import Devices from "./operator/Devices.jsx";
import DeviceDetail from "./operator/DeviceDetail.jsx";
import Users from "./operator/Users.jsx";
import CitizenReports from "./operator/CitizenReports.jsx";
import CitizenReportDetail from "./operator/CitizenReportDetail.jsx";

import PublicHome from "./public/PublicHome.jsx";
import PublicMap from "./public/PublicMap.jsx";
import PublicSiteDetail from "./public/PublicSiteDetail.jsx";
import PublicAlerts from "./public/PublicAlerts.jsx";
import PublicSettings from "./public/PublicSettings.jsx";
import PublicReport from "./public/PublicReport.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <ReportsProvider>
        <Routes>
          <Route path="/" element={<Landing />} />

          <Route path="/operator" element={<OperatorLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="map" element={<OperatorMap />} />
            <Route path="sites/:siteId" element={<SiteDetail />} />
            <Route path="warnings" element={<Warnings />} />
            <Route path="warnings/:warningId" element={<WarningDetail />} />
            <Route path="reports" element={<CitizenReports />} />
            <Route path="reports/:reportId" element={<CitizenReportDetail />} />
            <Route path="devices" element={<Devices />} />
            <Route path="devices/:deviceId" element={<DeviceDetail />} />
            <Route path="users" element={<Users />} />
          </Route>

          <Route
            path="/public"
            element={
              <PublicAuthProvider>
                <PublicLayout />
              </PublicAuthProvider>
            }
          >
            <Route index element={<PublicHome />} />
            <Route path="map" element={<PublicMap />} />
            <Route path="sites/:siteId" element={<PublicSiteDetail />} />
            <Route path="alerts" element={<PublicAlerts />} />
            <Route path="settings" element={<PublicSettings />} />
            <Route path="report" element={<PublicReport />} />
          </Route>

          <Route path="*" element={<Landing />} />
        </Routes>
      </ReportsProvider>
    </BrowserRouter>
  );
}
