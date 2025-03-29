import { Star, NotebookPen, Copy, Send, Store, Package } from "lucide-react"

export default function Footer() {
  return (
    <footer className="mt-12 py-6 text-center text-sm bg-[#c76a6a3b] rounded-lg">
      <div className="text-[#FFF] mt-2 text-left">
        <div className="w-2/3 mx-auto">
          <h2 className="text-center text-lg my-2 font-bold">代購流程</h2>
          <ul className="grid grid-cols-5 gap-6 list-decimal pl-4">
            <li><NotebookPen className="mx-auto w-10 h-10 mb-2" />填寫下方表單，盡量填寫完整，避免多次來回耽誤您的時間</li>
            <li><Copy className="mx-auto w-10 h-10 mb-2" />點擊右側計算結果最下方「一鍵複製」</li>
            <li><Send className="mx-auto w-10 h-10 mb-2" />將訊息傳送至我們的 IG 或 FB</li>
            <li><Store className="mx-auto w-10 h-10 mb-2" />收到後會為您開設賣貨便或 iOPEN Mall 賣場（擇一）供您下單</li>
            <li><Package className="mx-auto w-10 h-10 mb-2" />下單完成後，耐心等待商品送達</li>
          </ul>
        </div>
      </div>
      <div className="flex items-center justify-center space-x-2 opacity-70 mt-8">
        <Star className="h-3 w-3" />
        <span>秘境日本代購 © {new Date().getFullYear()}</span>
        <Star className="h-3 w-3" />
      </div>
    </footer>
  )
}

