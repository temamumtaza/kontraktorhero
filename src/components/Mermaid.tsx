"use client";
import React, { useEffect, useRef } from "react";
import mermaid from "mermaid";

export default function Mermaid({ chart }: { chart: string }) {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Always dark theme
        const themeVariables = {
            primaryColor: "#1e293b",
            primaryTextColor: "#ffffff",
            primaryBorderColor: "#38bdf8",
            lineColor: "#cbd5e1",
            secondaryColor: "#0f172a",
            tertiaryColor: "#334155",
        };

        mermaid.initialize({
            startOnLoad: false,
            theme: "base",
            themeVariables: {
                ...themeVariables,
                fontFamily: "var(--font-sans)",
                fontSize: "14px",
            },
            flowchart: {
                htmlLabels: true,
                useMaxWidth: false,
                padding: 20,
            },
            securityLevel: "loose",
            fontFamily: "var(--font-sans)",
        });
    }, []);

    useEffect(() => {
        const renderChart = async () => {
            if (ref.current && chart) {
                try {
                    const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
                    const { svg } = await mermaid.render(id, chart);
                    ref.current.innerHTML = svg;
                } catch (error) {
                    console.error("Mermaid error:", error);
                    // Keep existing content or show error?
                    // ref.current.innerHTML = "Invalid syntax";
                }
            }
        };

        // Small delay to ensure initialization
        setTimeout(() => {
            renderChart();
        }, 100);

    }, [chart]);

    return (
        <div className="w-full overflow-x-auto my-6 text-center">
            <div className="mermaid inline-block min-w-full md:min-w-0" ref={ref} />
        </div>
    );
}
