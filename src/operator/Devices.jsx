import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Card from "../components/Card";
import StatusBadge from "../components/StatusBadge";
import Icon from "../components/Icon";
import { DEVICES, BASINS, SITES, timeAgo } from "../data/mockData";
import { useLanguage } from "../i18n/LanguageContext";

export default function Devices() {
  const { locale } = useLanguage();
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
          <h1>{locale === "id" ? "Perangkat" : "Devices"}</h1>
          <p className="muted" style={{ margin: 0, fontSize: 13.5 }}>
            {DEVICES.length} {locale === "id" ? "node di" : "nodes at"} {SITES.length} {locale === "id" ? "titik pada" : "sites across"} {BASINS.length} {locale === "id" ? "DAS" : "watersheds"}
          </p>
        </div>
      </div>

      <div className="op-toolbar">
        <div className="field" style={{ minWidth: 240 }}>
          <label className="field-label">{locale === "id" ? "Cari" : "Search"}</label>
          <input className="text-input" placeholder={locale === "id" ? "Serial, titik, atau tipe..." : "Serial, site, or type..."} value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <div className="field">
          <label className="field-label">{locale === "id" ? "Status" : "Status"}</label>
          <select className="select" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="all">{locale === "id" ? "Semua status" : "All statuses"}</option>
            <option value="green">{locale === "id" ? "Aman" : "Normal"}</option>
            <option value="yellow">{locale === "id" ? "Waspada" : "Watch"}</option>
            <option value="orange">{locale === "id" ? "Siaga" : "Alert"}</option>
            <option value="red">{locale === "id" ? "Awas" : "Danger"}</option>
            <option value="black">{locale === "id" ? "Tidak Ada Sinyal" : "No Signal"}</option>
          </select>
        </div>
      </div>

      <Card>
        <table className="data-table data-table--clickable">
          <thead>
            <tr>
              <th>{locale === "id" ? "Serial" : "Serial"}</th>
              <th>{locale === "id" ? "Titik" : "Site"}</th>
              <th>{locale === "id" ? "Tipe" : "Type"}</th>
              <th>{locale === "id" ? "Status" : "Status"}</th>
              <th>{locale === "id" ? "Kontak terakhir" : "Last contact"}</th>
              <th>{locale === "id" ? "Baterai" : "Battery"}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((d) => (
              <tr key={d.id} onClick={() => navigate(`/operator/devices/${d.id}`)}>
                <td style={{ fontWeight: 700 }}>{d.serial}</td>
                <td>{d.site}</td>
                <td className="muted">{d.type}</td>
                <td>
                  <StatusBadge level={d.status} locale={locale} size="sm" />
                </td>
                <td>{timeAgo(d.lastContact, locale)}</td>
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
                  <div className="empty-state">{locale === "id" ? "Tidak ada perangkat yang sesuai dengan filter." : "No devices match the filter."}</div>
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
