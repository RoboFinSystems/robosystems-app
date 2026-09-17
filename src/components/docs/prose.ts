// The typography for rendered docs prose, shared by the markdown pages and the API
// reference so both read the same on the black page.
//
// Inline code sets its own dark background: the app's typography theme gives `code` a light
// mint one, and prose-invert only swaps colors, so on the black page it rendered as a pale box.
// Code inside a block drops that background and padding again.
export const PROSE =
  'prose prose-invert max-w-none prose-headings:font-heading prose-headings:scroll-mt-28 prose-headings:text-white prose-p:text-gray-300 prose-a:text-cyan-400 prose-a:no-underline hover:prose-a:text-cyan-300 prose-strong:text-white prose-li:text-gray-300 prose-li:marker:text-cyan-500 prose-th:text-white prose-td:text-gray-300 prose-blockquote:border-l-cyan-500 prose-blockquote:text-gray-400 prose-code:text-cyan-300 prose-code:bg-gray-800 prose-code:rounded prose-code:px-1.5 prose-code:py-0.5 prose-code:font-normal prose-code:before:content-none prose-code:after:content-none prose-pre:border prose-pre:border-gray-800 prose-pre:bg-gray-900 prose-pre:text-gray-200 [&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_pre_code]:text-inherit'
