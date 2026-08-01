import { useEffect, useState } from "react";

export default function Dashboard() {
    const [token, setToken] = useState("");

    useEffect(() => {
        const savedToken = localStorage.getItem("agentic_token");
        if (!savedToken) {
            window.location.href = "/";
        } else {
            setToken(savedToken);
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("agentic_token");
        window.location.href = "/";
    };

    return (
        <div style={{ minHeight: "100vh", backgroundColor: "#FAFAFA", padding: "2rem", fontFamily: "sans-serif" }}>
            <div style={{ maxWidth: "56rem", margin: "0 auto" }}>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "white", padding: "1.5rem", borderRadius: "1rem", boxShadow: "0 1px 2px 0 rgb(0 0 0 / 0.05)", border: "1px solid #f3f4f6", marginBottom: "2rem" }}>
                    <div>
                        <h1 style={{ fontSize: "1.5rem", fontWeight: "extrabold", color: "#111827", margin: 0 }}>Dashboard</h1>
                        <p style={{ fontSize: "0.75rem", color: "#059669", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "0.05em", marginTop: "0.25rem", marginBottom: 0 }}>● System Connected & Secure</p>
                    </div>
                    <button
                        onClick={handleLogout}
                        style={{ padding: "0.5rem 1rem", backgroundColor: "#FEF2F2", color: "#DC2626", fontWeight: "600", borderRadius: "0.75rem", border: "none", cursor: "pointer", fontSize: "0.875rem" }}
                    >
                        Terminate Session
                    </button>
                </div>

                <div style={{ backgroundColor: "white", padding: "2rem", borderRadius: "1.5rem", boxShadow: "0 1px 2px 0 rgb(0 0 0 / 0.05)", border: "1px solid #f3f4f6" }}>
                    <h2 style={{ fontSize: "1.25rem", fontWeight: "bold", color: "#1f2937", marginTop: 0 }}>Welcome to your Personal Wellbeing AI workspace.</h2>
                    <p style={{ color: "#4b5563", fontSize: "0.875rem", lineHeight: "1.5" }}>
                        Your authentication token is active, verified by FastAPI, and securely stored in local storage.
                    </p>

                    <div style={{ marginTop: "1.5rem", padding: "1rem", backgroundColor: "#f9fafb", borderRadius: "0.75rem", border: "1px solid #e5e7eb" }}>
                        <span style={{ display: "block", fontSize: "11px", fontWeight: "bold", color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.25rem" }}>Active Session Token</span>
                        <code style={{ fontSize: "0.75rem", color: "#4f46e5", wordBreak: "break-all" }}>{token}</code>
                    </div>
                </div>

            </div>
        </div>
    );
}