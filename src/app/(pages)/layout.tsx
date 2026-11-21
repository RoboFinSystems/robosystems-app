import Footer from '@/components/landing/Footer'
import Header from '@/components/landing/Header'

// Pages built to be found wear the marketing header and footer, like the blog. They render
// on the server with no gate in front, so a crawler gets the whole page in the first response.
export default function ProductPagesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-black">
      <Header />
      <div className="pt-24">{children}</div>
      <Footer />
    </div>
  )
}
