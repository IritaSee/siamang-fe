import { Link, useParams } from "react-router-dom";
import Card from "../components/Card";
import StatusBadge from "../components/StatusBadge";
import Icon from "../components/Icon";
import MiniLineChart from "../components/MiniLineChart";
import { DEVICES, DEVICE_HEALTH, siteById, timeAgo } from "../data/mockData";

export default function DeviceDetail() {
  const { deviceId } = useParams();
  const device = DEVICES.find((d) => d.id === deviceId);

  if (!device) {
    return (
      <div className="op-page">
        <p>Device not found.</p>
        <Link to="/operator/devices" className="btn btn-outline btn-sm">Back to devices</Link>
      </div>
    );
  }

  const site = siteById(device.siteId);
  const health = DEVICE_HEALTH[device.id];
  const labels = health.map((p) => new Date(p.t).toLocaleDateString("en-GB", { day: "2-digit", month: "short" }));

  return (
    <div className="op-page">
      <div className="op-breadcrumb">
        <Link to="/operator/devices">Devices</Link>
        <Icon name="chevron-right" size={12} />
        <span>{device.serial}</span>
      </div>

      <Card className="op-site-header">
        <div className="op-site-header__left">
          <h1>{device.serial}</h1>
          <div className="op-site-header__meta">
            <span className="badge-neutral"><Icon name="cpu" size={12} /> {device.type}</span>
            <Link to={`/operator/sites/${device.siteId}`} className="muted">{site?.name}</Link>
            <span className="muted">Last contact {timeAgo(device.lastContact)}</span>
          </div>
        </div>
        <StatusBadge level={device.status} size="lg" />
      </Card>

      {device.status === "black" ? (
        <div className="op-inline-notice">
          <Icon name="wifi-off" size={16} /> No heartbeat received recently. Signal and battery trend below may indicate the
          cause — check for power loss or physical damage before assuming a severe reading at this node.
        </div>
      ) : null}

      <div className="op-grid-2">
        <Card className="op-panel">
          <div className="section-header">
            <span className="section-title">Battery, last 14 days</span>
            <span className="muted" style={{ fontSize: 12.5 }}>{device.battery}% now</span>
          </div>
          <MiniLineChart labels={labels} values={health.map((p) => p.battery)} color="#0d9488" unit="%" />
        </Card>
        <Card className="op-panel">
          <div className="section-header">
            <span className="section-title">Signal strength, last 14 days</span>
            <span className="muted" style={{ fontSize: 12.5 }}>{health[health.length - 1].signal}% now</span>
          </div>
          <MiniLineChart labels={labels} values={health.map((p) => p.signal)} color="#0f4c81" unit="%" />
        </Card>
      </div>

      <Card className="op-panel">
        <div className="section-header">
          <span className="section-title">Device info</span>
        </div>
        <div className="op-kv-grid">
          <div>
            <div className="field-label">Serial</div>
            <div>{device.serial}</div>
          </div>
          <div>
            <div className="field-label">Type</div>
            <div>{device.type}</div>
          </div>
          <div>
            <div className="field-label">Site</div>
            <div>{site?.name}</div>
          </div>
          <div>
            <div className="field-label">Position</div>
            <div style={{ textTransform: "capitalize" }}>{site?.position}</div>
          </div>
          <div>
            <div className="field-label">Basin</div>
            <div>{site?.basin}</div>
          </div>
          <div>
            <div className="field-label">Province</div>
            <div>{site?.province}</div>
          </div>
        </div>
      </Card>
    </div>
  );
}
