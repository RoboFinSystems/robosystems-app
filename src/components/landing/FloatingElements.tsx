export default function FloatingElements() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className="animate-float-slow absolute top-20 left-10 h-64 w-64 rounded-full bg-cyan-500/20 blur-3xl"></div>
      <div className="animate-float-slower absolute right-10 bottom-20 h-96 w-96 rounded-full bg-blue-500/20 blur-3xl"></div>
      <div className="animate-float absolute top-1/2 left-1/2 h-80 w-80 rounded-full bg-purple-500/20 blur-3xl"></div>
    </div>
  )
}
