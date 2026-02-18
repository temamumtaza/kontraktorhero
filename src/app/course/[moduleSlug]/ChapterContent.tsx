"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import dynamic from "next/dynamic";
import type { Components } from "react-markdown";

const Mermaid = dynamic(() => import("@/components/Mermaid"), { ssr: false });

export default function ChapterContent({ content }: { content: string }) {
    return (
        <article
            className="prose prose-lg max-w-none
      prose-headings:font-bold prose-headings:text-text
      prose-h1:text-3xl prose-h1:border-b prose-h1:border-border prose-h1:pb-4 prose-h1:mb-6
      prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-4 prose-h2:text-accent-light
      prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3
      prose-p:text-text-muted prose-p:leading-relaxed
      prose-strong:text-text
      prose-a:text-accent prose-a:no-underline hover:prose-a:text-accent-light
      prose-blockquote:border-l-accent prose-blockquote:bg-accent/5 prose-blockquote:rounded-r-lg prose-blockquote:py-1 prose-blockquote:px-4
      prose-table:border-collapse
      prose-th:bg-surface-light prose-th:text-text prose-th:font-semibold prose-th:text-left prose-th:px-4 prose-th:py-2.5 prose-th:border prose-th:border-border
      prose-td:px-4 prose-td:py-2.5 prose-td:border prose-td:border-border prose-td:text-text-muted
      prose-li:text-text-muted
      prose-hr:border-border
      prose-img:rounded-xl
    "
        >
            <ReactMarkdown
                remarkPlugins={[remarkGfm, remarkMath]}
                rehypePlugins={[rehypeKatex]}
                components={{
                    code({ node, inline, className, children, ...props }: any) {
                        const match = /language-(\w+)/.exec(className || "");
                        const lang = match ? match[1] : "";

                        if (!inline && lang === "mermaid") {
                            return <Mermaid chart={String(children).replace(/\n$/, "")} />;
                        }

                        return !inline && match ? (
                            <SyntaxHighlighter
                                style={vscDarkPlus}
                                language={match[1]}
                                PreTag="div"
                                {...props}
                            >
                                {String(children).replace(/\n$/, "")}
                            </SyntaxHighlighter>
                        ) : (
                            <code className={className} {...props}>
                                {children}
                            </code>
                        );
                    },
                }}
            >
                {content}
            </ReactMarkdown>
        </article>
    );
}
