import { useState } from "react";

export default function Dashboard() {
    const [messages, setMessages] = useState([
        {
            sender: "bot",
            text: "Greetings! I am your Synapse AI Growth Architect.\n\nSelect an action below or type any academic or technical topic to begin:",
            actions: ["+ Analyze Aspiration Gap", "+ Generate Focus Sprint", "+ Open Active Recall"]
        }
    ]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSendMessage = async (textToSend) => {
        const query = textToSend || input;
        if (!query.trim()) return;

        const userMessage = { sender: "user", text: query };
        setMessages((prev) => [...prev, userMessage]);
        if (!textToSend) setInput("");
        setLoading(true);

        try {
            // Clean up the query string if it came from an action pill (removes the "+ " prefix)
            const cleanTopic = query.replace(/^\+\s*/, "");

            // Call the backend FastAPI AI tutor endpoint for ALL queries (user input and action pills)
            const response = await fetch("http://127.0.0.1:8000/api/tutor", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ topic: cleanTopic }),
            });

            if (!response.ok) {
                throw new Error(`Server responded with status: ${response.status}`);
            }

            const data = await response.json();
            const responseText = data.explanation || "Received empty explanation from server.";

            setMessages((prev) => [
                ...prev,
                {
                    sender: "bot",
                    text: responseText,
                    actions: ["+ Analyze Aspiration Gap", "+ Generate Focus Sprint", "+ Open Active Recall"]
                }
            ]);
        } catch (err) {
            console.error("Fetch error:", err);
            setMessages((prev) => [
                ...prev,
                {
                    sender: "bot",
                    text: "Failed to connect to the backend server. Make sure FastAPI is running on port 8000."
                }
            ]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ minHeight: "100vh", backgroundColor: "#0f172a", color: "#f8fafc", padding: "2rem", fontFamily: "sans-serif" }}>
            <div style={{ maxWidth: "56rem", margin: "0 auto" }}>

                {/* Dashboard Header */}
                <div style={{ backgroundColor: "#1e293b", padding: "1.5rem", borderRadius: "1rem", border: "1px solid #334155", marginBottom: "2rem" }}>
                    <h1 style={{ fontSize: "1.5rem", fontWeight: "extrabold", color: "#f8fafc", margin: 0 }}>Synapse AI Architecture Workspace</h1>
                    <p style={{ color: "#34d399", fontWeight: "bold", fontSize: "0.75rem", textTransform: "uppercase", marginTop: "0.25rem", letterSpacing: "0.05em" }}>● Systems Active</p>
                </div>

                {/* Chat Feed Container */}
                <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", marginBottom: "6rem" }}>
                    {messages.map((msg, index) => (
                        <div key={index} style={{ display: "flex", flexDirection: "column", alignItems: msg.sender === "user" ? "flex-end" : "flex-start" }}>

                            {/* Message Bubble */}
                            <div style={{
                                maxWidth: "80%",
                                padding: "1.25rem 1.5rem",
                                borderRadius: "1rem",
                                backgroundColor: msg.sender === "user" ? "#0d9488" : "#1e293b",
                                color: "#f8fafc",
                                border: "1px solid #334155",
                                whiteSpace: "pre-line",
                                lineHeight: "1.6",
                                fontSize: "0.95rem"
                            }}>
                                {msg.text}
                            </div>

                            {/* Action Pills */}
                            {msg.actions && (
                                <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.75rem", flexWrap: "wrap" }}>
                                    {msg.actions.map((action, actIndex) => (
                                        <button
                                            key={actIndex}
                                            onClick={() => handleSendMessage(action)}
                                            style={{
                                                padding: "0.5rem 1rem",
                                                backgroundColor: "#1e293b",
                                                color: "#38bdf8",
                                                border: "1px solid #334155",
                                                borderRadius: "2rem",
                                                cursor: "pointer",
                                                fontSize: "0.8rem",
                                                fontWeight: "600",
                                                transition: "background-color 0.2s"
                                            }}
                                        >
                                            {action}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}

                    {loading && (
                        <div style={{ padding: "1rem", backgroundColor: "#1e293b", borderRadius: "1rem", color: "#94a3b8", fontStyle: "italic", fontSize: "0.9rem", width: "fit-content" }}>
                            Growth Architect is analyzing...
                        </div>
                    )}
                </div>

                {/* Sticky Input Bar */}
                <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, backgroundColor: "#0f172a", padding: "1rem 2rem", borderTop: "1px solid #334155" }}>
                    <div style={{ maxWidth: "56rem", margin: "0 auto" }}>
                        <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(input); }} style={{ display: "flex", gap: "1rem" }}>
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Ask your AI Growth Architect or enter a topic..."
                                style={{ flex: 1, padding: "0.875rem 1rem", borderRadius: "0.75rem", border: "1px solid #334155", backgroundColor: "#1e293b", color: "white", outline: "none", fontSize: "0.95rem" }}
                            />
                            <button
                                type="submit"
                                style={{ padding: "0.875rem 1.75rem", backgroundColor: "#4f46e5", color: "white", fontWeight: "600", borderRadius: "0.75rem", border: "none", cursor: "pointer", fontSize: "0.95rem" }}
                            >
                                Send
                            </button>
                        </form>
                    </div>
                </div>

            </div>
        </div>
    );
}