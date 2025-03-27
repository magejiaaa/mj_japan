import { Leaf, Star } from "lucide-react"

export default function Footer() {
  return (
    <footer className="mt-12 py-6 text-center text-sm opacity-70">
      <div className="flex items-center justify-center space-x-2">
        <Leaf className="h-3 w-3" />
        <span>秘境好物分享 © {new Date().getFullYear()}</span>
        <Star className="h-3 w-3" />
      </div>
    </footer>
  )
}

