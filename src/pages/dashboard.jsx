import { useState } from "react";

export default function Dashboard() {
    const [topic, setTopic] = useState("");
    const [result, setResult] = useState("");
    const [loading, setLoading] = useState(false);

    const handleExplain = async (e) => {
        e.preventDefault();
        if (!topic.trim()) return;

        setLoading(true);
        setResult("");

        try {
            const res = await fetch("http://127.0.0.1:8000/api/tutor", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ topic }),
            });
            const data = await res.json();
            setResult(data.explanation || "No response received.");
        } catch (err) {
            setResult("Error connecting to backend server.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: "2rem", fontFamily: "sans-serif", backgroundColor: "#0f172a", color: "#fff", minHeight: "100vh" }}>
            <div style={{ maxWidth: "40rem", margin: "0 auto", background: "#1e293b", padding: "2rem", borderRadius: "1rem" }}>
                <h2>AI Tutor Concept Explainer</h2>
                <form onSubmit={handleExplain} style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
                    <input
                        type="text"
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        placeholder="Enter any topic (e.g., Python, FastAPI)..."
                        style={{ flex: 1, padding: "0.75rem", borderRadius: "0.5rem", border: "1px solid #334155", background: "#0f172a", color: "#fff" }}
                    />
                    <button type="submit" style={{ padding: "0.75rem 1.5rem", background: "#4f46e5", color: "#fff", border: "none", borderRadius: "0.5rem", cursor: "pointer" }}>
                        {loading ? "Loading..." : "Explain"}
                    </button>
                </form>

                {result && (
                    <div style={{ marginTop: "1.5rem", padding: "1rem", background: "#0f172a", borderRadius: "0.5rem", whiteSpace: "pre-line", lineHeight: "1.5" }}>
                        {result}
                    </div>
                )}
            </div>
        </div>
    );
}