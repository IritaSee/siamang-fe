import { usePublicAuth } from "./PublicAuthContext";
import Icon from "../components/Icon";
import { useLanguage } from "../i18n/LanguageContext";

export default function LoginPromptModal() {
  const { loginPromptOpen, closeLoginPrompt, login } = usePublicAuth();
  const { locale } = useLanguage();
  if (!loginPromptOpen) return null;

  return (
    <div className="pub-modal-backdrop" onClick={closeLoginPrompt}>
      <div className="pub-modal" onClick={(e) => e.stopPropagation()}>
        <button className="pub-modal__close" onClick={closeLoginPrompt} aria-label={locale === "id" ? "Tutup" : "Close"}>
          <Icon name="x" size={18} />
        </button>
        <div className="pub-modal__icon">
          <Icon name="star" size={26} />
        </div>
        <h3>{locale === "id" ? "Masuk untuk menyimpan favorit" : "Sign in to save favorites"}</h3>
        <p>{locale === "id" ? "Buat akun atau masuk agar kamu bisa menyimpan lokasi pemantauan dan menerima notifikasi khusus untuk lokasi favoritmu." : "Create an account or sign in so you can save monitoring sites and get notifications for your favorite locations."}</p>
        <button
          className="btn btn-primary"
          style={{ width: "100%" }}
          onClick={() => {
            login();
            closeLoginPrompt();
          }}
        >
          {locale === "id" ? "Masuk (sebagai Akun Warga Contoh)" : "Sign in (sample citizen account)"}
        </button>
        <button className="btn btn-ghost" style={{ width: "100%", marginTop: 8 }} onClick={closeLoginPrompt}>
          {locale === "id" ? "Nanti saja" : "Maybe later"}
        </button>
      </div>
    </div>
  );
}
