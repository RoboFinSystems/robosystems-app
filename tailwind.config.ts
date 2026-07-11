import tailwindcssTypography from '@tailwindcss/typography'
import flowbiteReact from 'flowbite-react/plugin/tailwindcss'
import flowbitePlugin from 'flowbite/plugin'

const config = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
    './app/**/*.{ts,tsx,mdx}',
    './components/**/*.{ts,tsx,mdx}',
    'node_modules/flowbite-react/**/*.{js,jsx,ts,tsx}',
    'node_modules/@robosystems/core/**/*.js',
    '.flowbite-react/class-list.json',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // RoboSystems Brand Colors
        primary: {
          50: '#EFF6FF', // Lightest blue for backgrounds
          100: '#DBEAFE', // Light blue for hover states
          200: '#BFDBFE', // Soft blue for borders
          300: '#93BBFD', // Medium light blue
          400: '#6098FA', // Medium blue
          500: '#3B7AF5', // Bright blue
          600: '#2563EB', // Strong blue
          700: '#1D4ED8', // Deep blue
          800: '#1B3A57', // Brand primary (dark blue)
          900: '#1E3A8A', // Darker blue
          950: '#172E47', // Darkest blue
        },
        secondary: {
          50: '#ECFEFF', // Lightest cyan
          100: '#CFFAFE', // Very light cyan
          200: '#A5F3FC', // Light cyan
          300: '#67E8F9', // Soft cyan
          400: '#22D3EE', // Bright cyan
          500: '#06B6D4', // Brand secondary (cyan)
          600: '#0891B2', // Medium cyan
          700: '#0E7490', // Deep cyan
          800: '#155E75', // Darker cyan
          900: '#164E63', // Very dark cyan
          950: '#083344', // Darkest cyan
        },
        accent: {
          // Indigo — a blue-leaning accent for RoboSystems. Deliberately NOT
          // violet (#8B5CF6), which is RoboLedger's primary; indigo keeps the
          // "bluish purple" hint while staying clearly distinct from RoboLedger.
          50: '#EEF2FF', // Lightest indigo
          100: '#E0E7FF', // Very light indigo
          200: '#C7D2FE', // Light indigo
          300: '#A5B4FC', // Soft indigo
          400: '#818CF8', // Medium indigo
          500: '#6366F1', // Brand accent (indigo)
          600: '#4F46E5', // Strong indigo
          700: '#4338CA', // Deep indigo
          800: '#3730A3', // Dark indigo
          900: '#312E81', // Very dark indigo
          950: '#1E1B4B', // Darkest indigo
        },
        // Shared semantic amber (decoupled from brand accent so `warning`
        // stays amber across all apps regardless of the per-app accent hue).
        amber: {
          50: '#FFF5F0',
          100: '#FFE6D9',
          200: '#FFD4C1',
          300: '#FFBFA6',
          400: '#FFA589',
          500: '#FF6B35',
          600: '#F54E17',
          700: '#DC4313',
          800: '#B93810',
          900: '#962D0D',
          950: '#731F08',
        },
        graph: {
          node: {
            primary: '#00D4AA', // Primary nodes
            secondary: '#3B7AF5', // Secondary nodes
            accent: '#FF6B35', // Important/highlight nodes
            inactive: '#94A3B8', // Inactive nodes
          },
          edge: {
            primary: '#93BBFD', // Primary relationships
            secondary: '#7FFFE6', // Secondary relationships
            highlight: '#FFA589', // Highlighted paths
            inactive: '#CBD5E1', // Inactive edges
          },
          cluster: {
            bg: 'rgba(59, 122, 245, 0.05)', // Cluster backgrounds
            border: '#BFDBFE', // Cluster borders
          },
        },
        semantic: {
          success: '#00D4AA', // teal-green — app-invariant semantic, not a token
          warning: '#FF6B35', // orange — app-invariant; matches the amber-* scale
          error: '#DC2626', // Red for errors
          info: '#3B7AF5', // Using primary blue
        },
        gray: {
          50: '#F9FAFB',
          100: '#F3F4F6',
          200: '#E5E7EB',
          300: '#D1D5DB',
          400: '#9CA3AF',
          500: '#6B7280',
          600: '#4B5563',
          700: '#374151',
          800: '#1F2937',
          900: '#111827',
          950: '#030712',
        },
      },
      animation: {
        float: 'float 6s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      typography: {
        DEFAULT: {
          css: {
            color: '#374151',
            h1: {
              color: '#1B3A57',
              fontSize: '2.25rem',
              fontWeight: '800',
            },
            h2: {
              color: '#1B3A57',
              fontSize: '1.875rem',
              fontWeight: '700',
            },
            h3: {
              color: '#1B3A57',
              fontSize: '1.5rem',
              fontWeight: '600',
            },
            h4: {
              color: '#1B3A57',
              fontSize: '1.25rem',
              fontWeight: '600',
            },
            a: {
              color: '#3B7AF5',
              '&:hover': {
                color: '#2563EB',
              },
            },
            code: {
              color: '#00D4AA',
              backgroundColor: '#E6FFFA',
              padding: '0.125rem 0.25rem',
              borderRadius: '0.25rem',
              fontWeight: '500',
            },
            pre: {
              backgroundColor: '#1B3A57',
              color: '#E6FFFA',
            },
            blockquote: {
              borderLeftColor: '#00D4AA',
              color: '#4B5563',
            },
          },
        },
        dark: {
          css: {
            color: '#D1D5DB',
            h1: {
              color: '#F9FAFB',
            },
            h2: {
              color: '#F9FAFB',
            },
            h3: {
              color: '#F9FAFB',
            },
            h4: {
              color: '#F9FAFB',
            },
            h5: {
              color: '#F9FAFB',
            },
            h6: {
              color: '#F9FAFB',
            },
            strong: {
              color: '#F9FAFB',
            },
            a: {
              color: '#6098FA',
              '&:hover': {
                color: '#93BBFD',
              },
            },
            code: {
              color: '#1AFFD1',
              backgroundColor: 'rgba(0, 212, 170, 0.1)',
            },
            pre: {
              backgroundColor: '#111827',
              color: '#E5E7EB',
            },
            blockquote: {
              borderLeftColor: '#00D4AA',
              color: '#9CA3AF',
            },
            'ol > li::marker': {
              color: '#9CA3AF',
            },
            'ul > li::marker': {
              color: '#9CA3AF',
            },
            hr: {
              borderColor: '#374151',
            },
            thead: {
              color: '#F9FAFB',
              borderBottomColor: '#4B5563',
            },
            'tbody tr': {
              borderBottomColor: '#374151',
            },
          },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
    fontFamily: {
      body: [
        'Space Grotesk',
        'ui-sans-serif',
        'system-ui',
        '-apple-system',
        'system-ui',
        'Segoe UI',
        'Roboto',
        'Helvetica Neue',
        'Arial',
        'Noto Sans',
        'sans-serif',
        'Apple Color Emoji',
        'Segoe UI Emoji',
        'Segoe UI Symbol',
        'Noto Color Emoji',
      ],
      sans: [
        'Space Grotesk',
        'ui-sans-serif',
        'system-ui',
        '-apple-system',
        'system-ui',
        'Segoe UI',
        'Roboto',
        'Helvetica Neue',
        'Arial',
        'Noto Sans',
        'sans-serif',
        'Apple Color Emoji',
        'Segoe UI Emoji',
        'Segoe UI Symbol',
        'Noto Color Emoji',
      ],
      heading: [
        'Orbitron',
        'Space Grotesk',
        'ui-sans-serif',
        'system-ui',
        'sans-serif',
      ],
      mono: [
        'JetBrains Mono',
        'ui-monospace',
        'SFMono-Regular',
        'SF Mono',
        'Menlo',
        'Consolas',
        'Liberation Mono',
        'monospace',
      ],
    },
  },
  plugins: [flowbitePlugin, flowbiteReact, tailwindcssTypography],
}

export default config
