import { Box } from "@cloudscape-design/components";
import React, { useEffect } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Prism from "prismjs";
import { useTranslations } from "../../hooks/useTranslations";

// Blog posts render markdown code fences as <pre><code class="language-xxx">
// which Prism highlights on mount. Generic languages only (rust/shell/js/etc.) —
// Cedar-specific highlighting is not used here.
export default function BlogPost(props: { content: string }) {
  const { t } = useTranslations();
  useEffect(() => {
    document.title = t("pageTitles.blog");
    Prism.highlightAll();
    return () => {
      document.title = t("pageTitles.cedarLang");
    };
  }, []);
  return (
    <Box margin={{ left: "xxxl", vertical: "m" }}>
      <div className="medium-container blogpost">
        <Markdown remarkPlugins={[remarkGfm]}>{props.content}</Markdown>
      </div>
    </Box>
  );
}
