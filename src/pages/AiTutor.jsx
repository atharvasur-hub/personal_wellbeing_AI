import { useState } from "react";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL !== undefined 
  ? import.meta.env.VITE_BACKEND_URL 
  : (import.meta.env.DEV ? 'http://localhost:8000' : '');

export default function AiTutor() {
    const [topic, setTopic] = useState("");
    const [explanation, setExplanation] = useState("");
    const [loading, setLoading] = useState(false);

    const handleFetchTutor = async (e) => {
        e.preventDefault();
        if (!topic.trim()) return;

        setLoading(true);
        setExplanation("");

        try {
            const response = await fetch(`${BACKEND_URL}/api/tutor`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ topic }),
            });

            const data = await response.json();

            if (data && data.explanation) {
                setExplanation(data.explanation);
            } else {
                setExplanation("Received empty response from server.");
            }
        } catch (err) {
            console.error("Fetch error:", err);
            setExplanation("Failed to connect to the backend server. Make sure FastAPI is running on port 8000.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ backgroundColor: "white", padding: "2rem", borderRadius: "1.5rem", border: "1px solid #f3f4f6", marginTop: "2rem", fontFamily: "sans-serif" }}>
            <h2 style={{ fontSize: "1.25rem", fontWeight: "bold", color: "#1f2937", marginBottom: "0.5rem" }}>AI Tutor & Concept Explainer</h2>
            <p style={{ color: "#6b7280", fontSize: "0.875rem", marginBottom: "1.5rem" }}>Enter any academic or technical topic to get an instant step-down breakdown.</p>

            <form onSubmit={handleFetchTutor} style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem" }}>
                <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="e.g., Java, Python, Recursion..."
                    style={{ flex: 1, padding: "0.75rem 1rem", borderRadius: "0.75rem", border: "1px solid #d1d5db", outline: "none", fontSize: "0.875rem" }}
                />
                <button
                    type="submit"
                    style={{ padding: "0.75rem 1.5rem", backgroundColor: "#4f46e5", color: "white", fontWeight: "600", borderRadius: "0.75rem", border: "none", cursor: "pointer", fontSize: "0.875rem" }}
                >
                    {loading ? "Analyzing..." : "Explain Topic"}
                </button>
            </form>

            {loading && (
                <p style={{ color: "#6b7280", fontSize: "0.875rem", fontStyle: "italic" }}>Generating explanation...</p>
            )}

            {explanation && (
                <div style={{ padding: "1.5rem", backgroundColor: "#f9fafb", borderRadius: "0.75rem", border: "1px solid #e5e7eb", whiteSpace: "pre-line", color: "#374151", fontSize: "0.875rem", lineHeight: "1.6" }}>
                    {explanation}
                </div>
            )}
        </div>
    );
}