import React, { useEffect } from "react";
import Prism from "prismjs";
import "./ReadOnlyCode.VSTheme.css";

interface ReadOnlyCodeProps {
  code: string;
  language: string;
}

// Prism-based syntax highlighting for read-only code blocks (generic languages
// like rust/javascript/shell — Cedar-specific highlighting now lives in Monaco).
export default function ReadOnlyCode(props: ReadOnlyCodeProps) {
  const { code, language } = props;
  useEffect(() => Prism.highlightAll(), [code]);
  return (
    <pre>
      <code className={`language-${language}`}>{code}</code>
    </pre>
  );
}
