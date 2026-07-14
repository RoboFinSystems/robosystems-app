// Mock for @monaco-editor/react (aliased in vitest.config.ts).
//
// Renders a plain <textarea data-testid="monaco-editor"> wired to onChange,
// and hands onMount a stub editor whose model speaks enough of the Monaco
// surface (offsets/positions, executeEdits, selection) for the
// MarkdownEditor toolbar to be exercised in tests: a full-range
// executeEdits is reported back through onChange.
const React = require('react')
const PropTypes = require('prop-types')

function positionAt(text, offset) {
  const before = text.slice(0, offset).split('\n')
  return {
    lineNumber: before.length,
    column: before[before.length - 1].length + 1,
  }
}

function offsetAt(text, position) {
  const lines = text.split('\n')
  let offset = 0
  for (let i = 0; i < position.lineNumber - 1; i++) {
    offset += lines[i].length + 1
  }
  return offset + position.column - 1
}

function Editor(props) {
  const propsRef = React.useRef(props)
  propsRef.current = props

  const stubRef = React.useRef(null)
  if (!stubRef.current) {
    let selection = {
      startLineNumber: 1,
      startColumn: 1,
      endLineNumber: 1,
      endColumn: 1,
    }
    const currentValue = () => propsRef.current.value ?? ''
    const model = {
      getValue: currentValue,
      getOffsetAt: (position) => offsetAt(currentValue(), position),
      getPositionAt: (offset) => positionAt(currentValue(), offset),
      getFullModelRange: () => ({}),
    }
    stubRef.current = {
      getModel: () => model,
      getSelection: () => selection,
      setSelection: (next) => {
        selection = next
      },
      executeEdits: (_source, edits) => {
        if (propsRef.current.onChange) {
          propsRef.current.onChange(edits[0].text)
        }
      },
      focus: () => {},
    }
  }

  React.useEffect(() => {
    if (propsRef.current.onMount) {
      propsRef.current.onMount(stubRef.current, {})
    }
  }, [])

  return React.createElement('textarea', {
    'data-testid': 'monaco-editor',
    value: props.value ?? '',
    onChange: (e) => props.onChange && props.onChange(e.target.value),
  })
}

Editor.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func,
  onMount: PropTypes.func,
}

module.exports = Editor
module.exports.default = Editor
