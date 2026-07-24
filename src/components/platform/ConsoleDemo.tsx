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

// Demo messages defined outside component to avoid re-creation on each render.
// Mirrors the real graph-aware console for a RoboLedger entity graph: the AI
// analyst welcome, /search + /recall commands, and operator answers rendered
// as narrative + footer + Generated Cypher panel + data table.
const DEMO_MESSAGES = [
  {
    type: 'system' as const,
    content: `RoboSystems Console v1 - Graph: kg9c3d6
═══════════════════════════════════════════════════════════════

Ask in plain English and an AI analyst queries your ledger — transactions, journal entries, the trial balance, and the financial statements built from them. Every answer comes back with the data and the Cypher behind it.

USAGE:
  Natural Language (default):
    "Show me the trial balance"
    "What are my largest expenses by category?"

  Direct Cypher Queries:
    /query MATCH (e:Entity)-[:ENTITY_HAS_TRANSACTION]->(t:Transaction) WHERE t.is_live RETURN t.date, t.description, t.amount ORDER BY t.date DESC LIMIT 15

COMMANDS:
  /query      - Execute a Cypher query
  /search     - Search documents
  /recall     - Recall semantic memories
  /mcp        - Show MCP connection setup
  /help       - Show this help message
  /clear      - Clear console history
  /examples   - Show example queries

How can I help you today?`,
    timestamp: '10:30:15',
  },
  {
    type: 'user' as const,
    content: 'What are my largest expenses by category?',
    timestamp: '10:30:22',
  },
  {
    type: 'system' as const,
    content: `Your largest expense category this fiscal year is Payroll & Benefits at $412K — roughly 46% of total operating spend — followed by Cloud Infrastructure at $186K. Professional Services, Marketing, and Office & Equipment round out the top five.`,
    timestamp: '10:30:29',
    footer: `Query completed in 7215ms
Rows returned: 5
Credits used: 0.5`,
    cypher: `MATCH (e:Entity)-[:ENTITY_HAS_TRANSACTION]->(t:Transaction)
WHERE t.is_live AND t.category IS NOT NULL
RETURN t.category, count(t) AS transactions, sum(t.amount) AS total
ORDER BY total DESC
LIMIT 5`,
    data: [
      {
        category: 'Payroll & Benefits',
        transactions: 96,
        total: '412,480.00',
      },
      {
        category: 'Cloud Infrastructure',
        transactions: 214,
        total: '186,240.00',
      },
      {
        category: 'Professional Services',
        transactions: 41,
        total: '98,750.00',
      },
      {
        category: 'Marketing',
        transactions: 63,
        total: '74,310.00',
      },
      {
        category: 'Office & Equipment',
        transactions: 38,
        total: '52,190.00',
      },
    ],
  },
  {
    type: 'user' as const,
    content:
      '/query MATCH (en:Entry)-[:ENTRY_HAS_LINE_ITEM]->(li:LineItem)-[:LINE_ITEM_RELATES_TO_ELEMENT]->(el:Element) WHERE li.is_live RETURN el.name AS account, sum(li.debit_amount) AS debits, sum(li.credit_amount) AS credits ORDER BY debits DESC LIMIT 10',
    timestamp: '10:30:45',
  },
  {
    type: 'system' as const,
    content: `Query completed in 156ms
Rows returned: 10`,
    timestamp: '10:30:45',
    data: [
      {
        account: 'Cash and Cash Equivalents',
        debits: '1,254,300.00',
        credits: '1,082,150.00',
      },
      {
        account: 'Accounts Receivable',
        debits: '486,220.00',
        credits: '411,890.00',
      },
      {
        account: 'Payroll Expense',
        debits: '412,480.00',
        credits: '0.00',
      },
      {
        account: 'Accounts Payable',
        debits: '198,450.00',
        credits: '232,760.00',
      },
      {
        account: 'Cloud Infrastructure Expense',
        debits: '186,240.00',
        credits: '3,120.00',
      },
      {
        account: 'Professional Services Expense',
        debits: '98,750.00',
        credits: '0.00',
      },
      {
        account: 'Marketing Expense',
        debits: '74,310.00',
        credits: '1,850.00',
      },
      {
        account: 'Prepaid Expenses',
        debits: '64,500.00',
        credits: '41,200.00',
      },
      {
        account: 'Accrued Liabilities',
        debits: '22,340.00',
        credits: '58,900.00',
      },
      {
        account: 'Revenue',
        debits: '12,400.00',
        credits: '924,880.00',
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
      footer?: string
      cypher?: string
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

              {/* Execution footer - only show after animation completes */}
              {message.footer && !message.isAnimating && (
                <div className="mt-3 text-xs whitespace-pre-wrap text-gray-500">
                  {message.footer}
                </div>
              )}

              {/* Generated Cypher panel - only show after animation completes */}
              {message.cypher && !message.isAnimating && (
                <div className="mt-3 overflow-hidden rounded border border-gray-800 bg-gray-900/40">
                  <div className="flex items-center justify-between border-b border-gray-800 px-3 py-1.5">
                    <span className="text-xs tracking-wider text-gray-500 uppercase">
                      Generated Cypher
                    </span>
                    <span className="rounded bg-cyan-600/90 px-2 py-0.5 text-xs font-medium text-white">
                      Run
                    </span>
                  </div>
                  <pre className="overflow-x-auto px-3 py-2 font-mono text-xs whitespace-pre-wrap text-cyan-300">
                    {message.cypher}
                  </pre>
                </div>
              )}

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
