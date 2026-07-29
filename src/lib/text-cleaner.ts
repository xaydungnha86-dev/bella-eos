/**
 * Utility to strip raw Markdown symbols (#, *, **, ***, ---, ```, etc.) 
 * to provide a clean, executive-ready display for CEO and C-Suite readers.
 */
export function cleanMarkdownForExecutive(text: string): string {
  if (!text) return '';

  return text
    // Remove markdown codeblock syntax (```json or ```)
    .replace(/```[a-z]*\n?/gi, '')
    .replace(/```/g, '')
    // Remove headers (#, ##, ###, ####, etc.) at line starts
    .replace(/^[ \t]*#+[ \t]*/gm, '')
    // Remove bold and italic markers (***, **, *)
    .replace(/\*{1,3}/g, '')
    // Remove horizontal rule dividers (--- or ___)
    .replace(/^[ \t]*[-*_]{3,}[ \t]*$/gm, '')
    // Clean multiple consecutive blank lines
    .replace(/\n{3,}/g, '\n\n')
    // Clean trailing/double spaces
    .replace(/[ \t]{2,}/g, ' ')
    .trim();
}
