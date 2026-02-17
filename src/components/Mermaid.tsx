"use client";
import React, { useEffect, useRef, useState } from "react";
import mermaid from "mermaid";

export default function Mermaid({ chart }: { chart: string }) {
    const ref = useRef<HTMLDivElement>(null);
    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        // Check system preference
        const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
        setIsDark(mediaQuery.matches);

        const handler = (e: MediaQueryListEvent) => setIsDark(e.matches);
        mediaQuery.addEventListener("change", handler);
        return () => mediaQuery.removeEventListener("change", handler);
    }, []);

    useEffect(() => {
        const themeVariables = isDark
            ? {
                // Dark Mode Variables - Ultra High Contrast
                primaryColor: "#1e293b", // slate-800
                primaryTextColor: "#ffffff", // Pure white
                primaryBorderColor: "#38bdf8", // sky-400
                lineColor: "#cbd5e1", // slate-300 (brighter lines)
                secondaryColor: "#0f172a", // slate-900
                tertiaryColor: "#334155", // slate-700
            }
            : {
                // Light Mode Variables
                primaryColor: "#ffffff", // white
                primaryTextColor: "#0f172a", // slate-900
                primaryBorderColor: "#0ea5e9", // sky-500
                lineColor: "#475569", // slate-600
                secondaryColor: "#f8fafc", // slate-50
                tertiaryColor: "#e2e8f0", // slate-200
            };

        mermaid.initialize({
            startOnLoad: false,
            theme: "base",
            themeVariables: {
                ...themeVariables,
                fontFamily: "var(--font-sans)",
                fontSize: "14px", // Slightly smaller to prevent overflow
            },
            flowchart: {
                htmlLabels: true,
                useMaxWidth: false, // Prevent aggressive scaling shrinking the chart
                padding: 20,
            },
            securityLevel: "loose",
            fontFamily: "var(--font-sans)",
        });
    }, [isDark]);

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

    }, [chart, isDark]);

    return (
        <div className="w-full overflow-x-auto my-6 text-center">
            <div className="mermaid inline-block min-w-full md:min-w-0" ref={ref} />
        </div>
    );
}
