import { Copy, NotebookPen, Package, Send, Star, Store } from "lucide-react"

const steps = [
  {
    icon: NotebookPen,
    text: "填寫下方表單，盡量填寫完整，避免多次來回耽誤您的時間",
  },
  {
    icon: Copy,
    text: "點擊估計算的出貨結果下方「一鍵複製」",
  },
  {
    icon: Send,
    text: "將訊息傳送至我們的 IG 或 FB",
  },
  {
    icon: Store,
    text: "收到後會為您開設賣貨便或 iOPEN Mall 賣場（擇一）供您下單",
  },
  {
    icon: Package,
    text: "下單完成後，耐心等待商品送達",
  },
]

export default function Footer() {
  return (
    <footer className="mt-8">
      <section
        id="order-process"
        className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-card)] mx-4 px-5 py-6 shadow-[var(--shadow-soft)]"
      >
        <h2 className="mb-6 text-center text-xl font-bold text-[var(--color-primary-hover)]">代購流程</h2>
        <ol className="grid gap-5 text-sm leading-7 text-[var(--text-secondary)] md:grid-cols-5">
          {steps.map((step, index) => {
            const Icon = step.icon
            return (
              <li key={step.text} className="relative flex flex-col items-center text-center">
                <Icon className="mb-3 h-11 w-11 text-[var(--color-primary-hover)]" strokeWidth={1.8} />
                <p>
                  {index + 1}. {step.text}
                </p>
                {index < steps.length - 1 && (
                  <span className="pointer-events-none absolute right-[-18px] top-5 hidden text-2xl text-[var(--color-primary)] md:block">
                    →
                  </span>
                )}
              </li>
            )
          })}
        </ol>
      </section>

      <div className="mt-6 flex items-center justify-center gap-3 bg-[var(--bg-footer)] py-5 text-sm tracking-wide text-white">
        <Star className="h-3.5 w-3.5" />
        <span>秘境日本代購 © {new Date().getFullYear()}</span>
        <Star className="h-3.5 w-3.5" />
      </div>
    </footer>
  )
}
