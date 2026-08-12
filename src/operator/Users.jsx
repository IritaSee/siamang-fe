import Card from "../components/Card";
import Icon from "../components/Icon";
import { USERS, timeAgo } from "../data/mockData";

const ROLE_TONE = { Admin: "red", Operator: "active", Forecaster: "green", Viewer: "" };
const ROLE_LABEL = { Admin: "Admin", Operator: "Operator", Forecaster: "Prakirawan", Viewer: "Pemantau" };

export default function Users() {
  return (
    <div className="op-page">
      <div className="op-page-head">
        <div>
          <h1>Pengguna</h1>
          <p className="muted" style={{ margin: 0, fontSize: 13.5 }}>
            {USERS.length} akun dengan akses ke konsol operator
          </p>
        </div>
        <button className="btn btn-primary">
          <Icon name="plus" size={15} /> Undang pengguna
        </button>
      </div>

      <Card>
        <table className="data-table">
          <thead>
            <tr>
              <th>Nama</th>
              <th>Email</th>
              <th>Instansi</th>
              <th>Peran</th>
              <th>Terakhir aktif</th>
            </tr>
          </thead>
          <tbody>
            {USERS.map((u) => (
              <tr key={u.id}>
                <td style={{ fontWeight: 700 }}>{u.name}</td>
                <td className="muted">{u.email}</td>
                <td>{u.agency}</td>
                <td>
                  <span className={`badge-neutral${ROLE_TONE[u.role] ? ` badge-neutral--${ROLE_TONE[u.role]}` : ""}`}>{ROLE_LABEL[u.role] ?? u.role}</span>
                </td>
                <td className="muted">{timeAgo(u.lastActive, "id")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
