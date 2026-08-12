import Card from "../components/Card";
import Icon from "../components/Icon";
import { USERS, timeAgo } from "../data/mockData";

const ROLE_TONE = { Admin: "red", Operator: "active", Forecaster: "green", Viewer: "" };

export default function Users() {
  return (
    <div className="op-page">
      <div className="op-page-head">
        <div>
          <h1>Users</h1>
          <p className="muted" style={{ margin: 0, fontSize: 13.5 }}>
            {USERS.length} accounts with access to the operator console
          </p>
        </div>
        <button className="btn btn-primary">
          <Icon name="plus" size={15} /> Invite user
        </button>
      </div>

      <Card>
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Agency</th>
              <th>Role</th>
              <th>Last active</th>
            </tr>
          </thead>
          <tbody>
            {USERS.map((u) => (
              <tr key={u.id}>
                <td style={{ fontWeight: 700 }}>{u.name}</td>
                <td className="muted">{u.email}</td>
                <td>{u.agency}</td>
                <td>
                  <span className={`badge-neutral${ROLE_TONE[u.role] ? ` badge-neutral--${ROLE_TONE[u.role]}` : ""}`}>{u.role}</span>
                </td>
                <td className="muted">{timeAgo(u.lastActive)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
