import { usePublicAuth } from "./PublicAuthContext";
import Icon from "../components/Icon";

export default function LoginPromptModal() {
  const { loginPromptOpen, closeLoginPrompt, login } = usePublicAuth();
  if (!loginPromptOpen) return null;

  return (
    <div className="pub-modal-backdrop" onClick={closeLoginPrompt}>
      <div className="pub-modal" onClick={(e) => e.stopPropagation()}>
        <button className="pub-modal__close" onClick={closeLoginPrompt} aria-label="Tutup">
          <Icon name="x" size={18} />
        </button>
        <div className="pub-modal__icon">
          <Icon name="star" size={26} />
        </div>
        <h3>Masuk untuk menyimpan favorit</h3>
        <p>Buat akun atau masuk agar kamu bisa menyimpan lokasi pemantauan dan menerima notifikasi khusus untuk lokasi favoritmu.</p>
        <button
          className="btn btn-primary"
          style={{ width: "100%" }}
          onClick={() => {
            login();
            closeLoginPrompt();
          }}
        >
          Masuk (mock)
        </button>
        <button className="btn btn-ghost" style={{ width: "100%", marginTop: 8 }} onClick={closeLoginPrompt}>
          Nanti saja
        </button>
      </div>
    </div>
  );
}
