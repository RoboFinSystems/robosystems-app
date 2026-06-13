export default function FloatingElements() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className="animate-float-slow bg-secondary-500/20 absolute top-20 left-10 h-64 w-64 rounded-full blur-3xl"></div>
      <div className="animate-float-slower bg-primary-500/20 absolute right-10 bottom-20 h-96 w-96 rounded-full blur-3xl"></div>
      <div className="animate-float bg-accent-500/20 absolute top-1/2 left-1/2 h-80 w-80 rounded-full blur-3xl"></div>
    </div>
  )
}
