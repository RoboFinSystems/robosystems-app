'use client'

import Image from 'next/image'
import type { ReactNode } from 'react'
import { Component } from 'react'

interface Props {
  children: ReactNode
  fallbackImage?: string
  fallbackAlt?: string
}

interface State {
  hasError: boolean
}

class VideoErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Video loading error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      const { fallbackImage, fallbackAlt } = this.props

      if (fallbackImage) {
        return (
          <div className="relative h-full w-full">
            <Image
              src={fallbackImage}
              alt={fallbackAlt || 'Video fallback image'}
              fill
              className="object-cover"
            />
          </div>
        )
      }

      return (
        <div className="flex h-full w-full items-center justify-center bg-gray-800">
          <p className="text-gray-400">Unable to load video</p>
        </div>
      )
    }

    return this.props.children
  }
}

export default VideoErrorBoundary
