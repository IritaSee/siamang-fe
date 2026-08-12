import Card from "../components/Card";
import Icon from "../components/Icon";
import { USERS, timeAgo } from "../data/mockData";
import { useLanguage } from "../i18n/LanguageContext";

const ROLE_TONE = { Admin: "red", Operator: "active", Forecaster: "green", Viewer: "" };
const ROLE_LABEL = { Admin: { id: "Admin", en: "Admin" }, Operator: { id: "Operator", en: "Operator" }, Forecaster: { id: "Prakirawan", en: "Forecaster" }, Viewer: { id: "Pemantau", en: "Viewer" } };

export default function Users() {
  const { locale } = useLanguage();
  return (
    <div className="op-page">
      <div className="op-page-head">
        <div>
          <h1>{locale === "id" ? "Pengguna" : "Users"}</h1>
          <p className="muted" style={{ margin: 0, fontSize: 13.5 }}>
            {USERS.length} {locale === "id" ? "akun dengan akses ke konsol operator" : "accounts with access to the operator console"}
          </p>
        </div>
        <button className="btn btn-primary">
          <Icon name="plus" size={15} /> {locale === "id" ? "Undang pengguna" : "Invite user"}
        </button>
      </div>

      <Card>
        <table className="data-table">
          <thead>
            <tr>
              <th>{locale === "id" ? "Nama" : "Name"}</th>
              <th>Email</th>
              <th>{locale === "id" ? "Instansi" : "Agency"}</th>
              <th>{locale === "id" ? "Peran" : "Role"}</th>
              <th>{locale === "id" ? "Terakhir aktif" : "Last active"}</th>
            </tr>
          </thead>
          <tbody>
            {USERS.map((u) => (
              <tr key={u.id}>
                <td style={{ fontWeight: 700 }}>{u.name}</td>
                <td className="muted">{u.email}</td>
                <td>{u.agency}</td>
                <td>
                  <span className={`badge-neutral${ROLE_TONE[u.role] ? ` badge-neutral--${ROLE_TONE[u.role]}` : ""}`}>{ROLE_LABEL[u.role]?.[locale] ?? u.role}</span>
                </td>
                <td className="muted">{timeAgo(u.lastActive, locale)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
