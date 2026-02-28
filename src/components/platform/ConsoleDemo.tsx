'use client'

import { useEffect, useRef, useState } from 'react'

// Progressive text component
function ProgressiveText({
  text,
  onComplete,
  speed = 1,
}: {
  text: string
  onComplete?: () => void
  speed?: number
}) {
  const [displayedText, setDisplayedText] = useState('')
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(text.slice(0, currentIndex + 1))
        setCurrentIndex(currentIndex + 1)
      }, speed)
      return () => clearTimeout(timeout)
    } else if (onComplete) {
      onComplete()
    }
  }, [currentIndex, text, speed, onComplete])

  return <span>{displayedText}</span>
}

// Demo messages defined outside component to avoid re-creation on each render
const DEMO_MESSAGES = [
  {
    type: 'system' as const,
    content: `RoboSystems Console v1 - Graph: RFS LLC (kg9c3d6)
═══════════════════════════════════════════════════════════════
Claude powered interactive graph database console
USAGE:
  Natural Language (default):
    "What entity is in the graph?"
    "How many facts are in the latest report?"
  Direct Cypher Queries:
    /query MATCH (n) RETURN count(n) as node_count
    /query MATCH (e:Entity) RETURN e.name, e.identifier LIMIT 10
COMMANDS:
  /query      - Execute a Cypher query
  /mcp        - Show MCP connection setup
  /help       - Show this help message
  /clear      - Clear console history
  /examples   - Show example queries

How can I help you today?`,
    timestamp: '10:30:15',
  },
  {
    type: 'user' as const,
    content: 'Show me the most recent SEC filings with their report types',
    timestamp: '10:30:22',
  },
  {
    type: 'system' as const,
    content: `Found recent SEC filings from 5 public companies.

═══════════════════════════════════════════════════════════════
Agent: financial
Mode: quick
Execution time: 1247ms
Tokens used: 2341 (prompt: 1205, completion: 1136)
Confidence: 94.2%
Credits used: 0.03
Results: 5 rows

Generated Cypher:
MATCH (e:Entity)-[:ENTITY_HAS_REPORT]->(r:Report)
RETURN e.ticker, e.name, r.form,
       r.report_date, r.filing_date
ORDER BY r.filing_date DESC
LIMIT 5`,
    timestamp: '10:30:24',
    data: [
      {
        ticker: 'AAPL',
        company: 'Apple Inc.',
        form_type: '10-Q',
        report_date: '2025-09-30',
        filing_date: '2025-11-02',
      },
      {
        ticker: 'MSFT',
        company: 'Microsoft Corporation',
        form_type: '10-Q',
        report_date: '2025-09-30',
        filing_date: '2025-10-30',
      },
      {
        ticker: 'GOOGL',
        company: 'Alphabet Inc.',
        form_type: '10-K',
        report_date: '2025-06-30',
        filing_date: '2025-10-28',
      },
      {
        ticker: 'AMZN',
        company: 'Amazon.com Inc.',
        form_type: '10-Q',
        report_date: '2025-09-30',
        filing_date: '2025-10-27',
      },
      {
        ticker: 'TSLA',
        company: 'Tesla Inc.',
        form_type: '10-Q',
        report_date: '2025-09-30',
        filing_date: '2025-10-25',
      },
    ],
  },
  {
    type: 'user' as const,
    content:
      '/query MATCH (f:Fact)--(e:Element) OPTIONAL MATCH (f)-[:FACT_HAS_PERIOD]->(p:Period) RETURN e.name, f.value, p.start_date, p.end_date LIMIT 10',
    timestamp: '10:30:45',
  },
  {
    type: 'system' as const,
    content: `Query completed in 156ms
Rows returned: 10
Credits used: 0`,
    timestamp: '10:30:45',
    data: [
      {
        element: 'Revenue',
        value: '487250.00',
        start_date: '2024-01-01',
        end_date: '2024-03-31',
      },
      {
        element: 'Cost of Revenue',
        value: '245100.00',
        start_date: '2024-01-01',
        end_date: '2024-03-31',
      },
      {
        element: 'Gross Profit',
        value: '242150.00',
        start_date: '2024-01-01',
        end_date: '2024-03-31',
      },
      {
        element: 'Operating Expenses',
        value: '128450.00',
        start_date: '2024-01-01',
        end_date: '2024-03-31',
      },
      {
        element: 'Net Income',
        value: '85200.00',
        start_date: '2024-01-01',
        end_date: '2024-03-31',
      },
      {
        element: 'Total Assets',
        value: '1250000.00',
        start_date: null,
        end_date: '2024-03-31',
      },
      {
        element: 'Total Liabilities',
        value: '425000.00',
        start_date: null,
        end_date: '2024-03-31',
      },
      {
        element: 'Stockholders Equity',
        value: '825000.00',
        start_date: null,
        end_date: '2024-03-31',
      },
      {
        element: 'Cash and Equivalents',
        value: '175000.00',
        start_date: null,
        end_date: '2024-03-31',
      },
      {
        element: 'Accounts Receivable',
        value: '95000.00',
        start_date: null,
        end_date: '2024-03-31',
      },
    ],
  },
]

export default function ConsoleDemo() {
  const [messages, setMessages] = useState<
    Array<{
      type: 'system' | 'user'
      content: string
      timestamp: string
      data?: any[]
      isAnimating?: boolean
    }>
  >([])
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0)
  const [inputValue, setInputValue] = useState('')
  const [isVisible, setIsVisible] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Intersection Observer to detect when component is in viewport
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        // Trigger animation when component is at least 20% visible
        if (entry.isIntersecting && entry.intersectionRatio > 0.2) {
          setIsVisible(true)
        }
      },
      {
        threshold: 0.2, // Trigger when 20% visible
      }
    )

    const currentElement = containerRef.current
    if (currentElement) {
      observer.observe(currentElement)
    }

    return () => {
      if (currentElement) {
        observer.unobserve(currentElement)
      }
    }
  }, [])

  // Auto-play messages with animation (only when visible)
  useEffect(() => {
    if (isVisible && currentMessageIndex < DEMO_MESSAGES.length) {
      const timeout = setTimeout(
        () => {
          setMessages((prev) => [
            ...prev,
            { ...DEMO_MESSAGES[currentMessageIndex], isAnimating: true },
          ])
        },
        currentMessageIndex === 0 ? 500 : 1500
      )
      return () => clearTimeout(timeout)
    }
  }, [currentMessageIndex, isVisible])

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleAnimationComplete = (index: number) => {
    setMessages((prev) =>
      prev.map((msg, i) => (i === index ? { ...msg, isAnimating: false } : msg))
    )
    // Move to next message after a short pause
    if (index === messages.length - 1) {
      setTimeout(() => {
        setCurrentMessageIndex((prev) => prev + 1)
      }, 800)
    }
  }

  return (
    <div
      ref={containerRef}
      className="relative mb-12 overflow-hidden rounded-2xl border border-gray-800 bg-gray-950 shadow-2xl"
    >
      {/* Floating background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="animate-float-slow absolute top-10 left-10 h-32 w-32 rounded-full bg-cyan-500/10 blur-3xl"></div>
        <div className="animate-float-slower absolute right-10 bottom-10 h-48 w-48 rounded-full bg-blue-500/10 blur-3xl"></div>
        <div className="animate-float absolute top-1/2 left-1/2 h-40 w-40 rounded-full bg-purple-500/10 blur-3xl"></div>
      </div>

      {/* Terminal */}
      <div className="relative bg-gray-950/80">
        <div
          ref={scrollRef}
          className="h-[500px] overflow-y-auto p-6 font-mono text-sm"
        >
          {messages.map((message, idx) => (
            <div key={idx} className="mb-4">
              <div className="mb-1 flex items-center gap-2 text-xs text-gray-700">
                <span>{message.timestamp}</span>
                <span>•</span>
                <span className="tracking-wider uppercase">{message.type}</span>
              </div>
              <div
                className={`leading-relaxed break-words whitespace-pre-wrap ${
                  message.type === 'system' ? 'text-cyan-400' : 'text-green-400'
                }`}
              >
                {message.type === 'user' && (
                  <span className="mr-2 text-green-500">$</span>
                )}
                {message.isAnimating ? (
                  <ProgressiveText
                    text={message.content}
                    speed={message.type === 'user' ? 30 : 3}
                    onComplete={() => handleAnimationComplete(idx)}
                  />
                ) : (
                  message.content
                )}
              </div>

              {/* Data table - only show after animation completes */}
              {message.data &&
                message.data.length > 0 &&
                !message.isAnimating && (
                  <div className="mt-4 overflow-x-auto rounded border border-gray-800">
                    <table className="w-full border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-gray-800 bg-gray-900">
                          {Object.keys(message.data[0]).map((key) => (
                            <th
                              key={key}
                              className="px-4 py-2 text-left font-semibold text-cyan-400"
                            >
                              {key}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {message.data.map((row: any, ridx: number) => (
                          <tr
                            key={ridx}
                            className="border-b border-gray-900 hover:bg-gray-900/50"
                          >
                            {Object.values(row).map((value: any, vidx) => (
                              <td
                                key={vidx}
                                className="px-4 py-2 text-gray-400"
                              >
                                {typeof value === 'object'
                                  ? JSON.stringify(value)
                                  : String(value)}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
            </div>
          ))}
        </div>

        {/* Input area */}
        <div className="flex items-center gap-3 border-t border-gray-700 bg-gray-950 px-4 py-3">
          <span className="font-mono text-sm text-green-500">$</span>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && inputValue.trim()) {
                // Just clear the input, don't execute anything
                setInputValue('')
              }
            }}
            placeholder="Type a question, /query <cypher>, or /help... (demo only)"
            className="flex-1 border-none bg-transparent font-mono text-sm text-gray-300 outline-none placeholder:text-gray-700"
            autoComplete="off"
          />
        </div>
      </div>
    </div>
  )
}
