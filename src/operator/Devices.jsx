import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Card from "../components/Card";
import StatusBadge from "../components/StatusBadge";
import Icon from "../components/Icon";
import { DEVICES, BASINS, SITES, timeAgo } from "../data/mockData";

export default function Devices() {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");

  const rows = useMemo(() => {
    return DEVICES.filter((d) => (status === "all" ? true : d.status === status)).filter((d) =>
      q.trim() ? (d.serial + d.site + d.type).toLowerCase().includes(q.toLowerCase()) : true
    );
  }, [q, status]);

  return (
    <div className="op-page">
      <div className="op-page-head">
        <div>
          <h1>Perangkat</h1>
          <p className="muted" style={{ margin: 0, fontSize: 13.5 }}>
            {DEVICES.length} node di {SITES.length} titik pada {BASINS.length} DAS
          </p>
        </div>
      </div>

      <div className="op-toolbar">
        <div className="field" style={{ minWidth: 240 }}>
          <label className="field-label">Cari</label>
          <input className="text-input" placeholder="Serial, titik, atau tipe..." value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <div className="field">
          <label className="field-label">Status</label>
          <select className="select" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="all">Semua status</option>
            <option value="green">Aman</option>
            <option value="yellow">Waspada</option>
            <option value="orange">Siaga</option>
            <option value="red">Awas</option>
            <option value="black">Tidak Ada Sinyal</option>
          </select>
        </div>
      </div>

      <Card>
        <table className="data-table data-table--clickable">
          <thead>
            <tr>
              <th>Serial</th>
              <th>Titik</th>
              <th>Tipe</th>
              <th>Status</th>
              <th>Kontak terakhir</th>
              <th>Baterai</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((d) => (
              <tr key={d.id} onClick={() => navigate(`/operator/devices/${d.id}`)}>
                <td style={{ fontWeight: 700 }}>{d.serial}</td>
                <td>{d.site}</td>
                <td className="muted">{d.type}</td>
                <td>
                  <StatusBadge level={d.status} locale="id" size="sm" />
                </td>
                <td>{timeAgo(d.lastContact, "id")}</td>
                <td>
                  <span className="op-battery">
                    <Icon name="battery" size={14} className={d.battery < 20 ? "op-battery--low" : "muted"} />
                    {d.battery}%
                  </span>
                </td>
              </tr>
            ))}
            {rows.length === 0 ? (
              <tr>
                <td colSpan={6}>
                  <div className="empty-state">Tidak ada perangkat yang sesuai dengan filter.</div>
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
