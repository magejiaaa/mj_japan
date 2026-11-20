import { Facebook, Instagram } from "lucide-react"

export default function QuoteSocialLinks({ className }: { className: string }) {
  return (
    <div className={className}>
      <a
        href="https://www.instagram.com/mjj_japan?utm_source=ig_web_button_share_sheet"
        target="_blank"
        rel="noopener noreferrer"
        className="social-link-btn"
      >
        <Instagram /> Instagram
      </a>
      <a href="https://www.facebook.com/mjJapan/" target="_blank" rel="noopener noreferrer" className="social-link-btn">
        <Facebook /> Facebook
      </a>
    </div>
  )
}
