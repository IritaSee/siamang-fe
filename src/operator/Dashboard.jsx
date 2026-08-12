import { Link } from "react-router-dom";
import StatCard from "../components/StatCard";
import StatusBadge from "../components/StatusBadge";
import Card from "../components/Card";
import Icon from "../components/Icon";
import { RISK_LEVELS, sortBySeverity } from "../theme/riskLevels";
import { SITES, WARNINGS, DEVICES, timeAgo } from "../data/mockData";

export default function Dashboard() {
  const counts = Object.fromEntries(Object.keys(RISK_LEVELS).map((k) => [k, SITES.filter((s) => s.status === k).length]));
  const activeWarnings = sortBySeverity(
    WARNINGS.filter((w) => !w.resolved),
    (w) => w.status
  );
  const silentSites = SITES.filter((s) => s.status === "black");
  const staleDevices = DEVICES.filter((d) => d.status === "black").sort((a, b) => new Date(a.lastContact) - new Date(b.lastContact));

  return (
    <div className="op-page">
      <div className="op-page__intro">
        <h1>Situation Overview</h1>
        <p className="muted">Live status across 15 monitoring sites in 6 pilot river basins.</p>
      </div>

      <div className="op-stat-grid">
        <StatCard label={RISK_LEVELS.green.en} value={counts.green} sub="sites" tone="green" />
        <StatCard label={RISK_LEVELS.yellow.en} value={counts.yellow} sub="sites" tone="yellow" />
        <StatCard label={RISK_LEVELS.orange.en} value={counts.orange} sub="sites" tone="orange" />
        <StatCard label={RISK_LEVELS.red.en} value={counts.red} sub="sites" tone="red" />
      </div>

      <Card className="op-black-panel">
        <div className="op-black-panel__left">
          <div className="op-black-panel__icon">
            <Icon name="wifi-off" size={20} />
          </div>
          <div>
            <div className="op-black-panel__title">No Signal — needs attention</div>
            <div className="muted" style={{ fontSize: 12.5 }}>
              These sites have gone silent. This is an unknown state, not a confirmed severe reading — dispatch a check.
            </div>
          </div>
        </div>
        <div className="op-black-panel__list">
          {silentSites.map((s) => (
            <Link key={s.id} to={`/operator/sites/${s.id}`} className="op-black-chip">
              <StatusBadge level="black" size="sm" />
              <span>{s.name}</span>
              <span className="muted" style={{ fontSize: 11 }}>{timeAgo(s.lastUpdated)}</span>
            </Link>
          ))}
        </div>
      </Card>

      <div className="op-grid-2">
        <Card className="op-panel">
          <div className="section-header">
            <span className="section-title">Active Warnings, worst first</span>
            <Link to="/operator/warnings" className="btn btn-ghost btn-sm">
              View all <Icon name="chevron-right" size={14} />
            </Link>
          </div>
          <ul className="op-warning-list">
            {activeWarnings.map((w) => {
              const site = SITES.find((s) => s.id === w.siteId);
              return (
                <li key={w.id}>
                  <Link to={`/operator/warnings/${w.id}`} className="op-warning-row">
                    <StatusBadge level={w.status} size="sm" />
                    <div className="op-warning-row__body">
                      <div className="op-warning-row__site">{site?.name}</div>
                      <div className="muted" style={{ fontSize: 11.5 }}>
                        {w.source.replace("_", " ")} &middot; triggered {timeAgo(w.triggeredAt)}
                      </div>
                    </div>
                    <Icon name="chevron-right" size={16} className="muted" />
                  </Link>
                </li>
              );
            })}
            {activeWarnings.length === 0 ? <div className="empty-state">No active warnings.</div> : null}
          </ul>
        </Card>

        <Card className="op-panel">
          <div className="section-header">
            <span className="section-title">Currently Silent Nodes</span>
            <Link to="/operator/devices" className="btn btn-ghost btn-sm">
              View all <Icon name="chevron-right" size={14} />
            </Link>
          </div>
          <ul className="op-warning-list">
            {staleDevices.map((d) => (
              <li key={d.id}>
                <Link to={`/operator/devices/${d.id}`} className="op-warning-row">
                  <StatusBadge level="black" size="sm" />
                  <div className="op-warning-row__body">
                    <div className="op-warning-row__site">{d.serial}</div>
                    <div className="muted" style={{ fontSize: 11.5 }}>
                      {d.site} &middot; last contact {timeAgo(d.lastContact)}
                    </div>
                  </div>
                  <Icon name="chevron-right" size={16} className="muted" />
                </Link>
              </li>
            ))}
            {staleDevices.length === 0 ? <div className="empty-state">All nodes reporting normally.</div> : null}
          </ul>
        </Card>
      </div>
    </div>
  );
}
