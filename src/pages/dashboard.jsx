import AiTutor from "./AiTutor";

export default function Dashboard() {
    return (
        <div style={{ minHeight: "100vh", backgroundColor: "#FAFAFA", padding: "2rem", fontFamily: "sans-serif" }}>
            <div style={{ maxWidth: "56rem", margin: "0 auto" }}>

                {/* Dashboard Header */}
                <div style={{ backgroundColor: "white", padding: "1.5rem", borderRadius: "1rem", border: "1px solid #f3f4f6", marginBottom: "2rem" }}>
                    <h1 style={{ fontSize: "1.5rem", fontWeight: "extrabold", color: "#111827", margin: 0 }}>Dashboard Workspace</h1>
                    <p style={{ color: "#059669", fontWeight: "bold", fontSize: "0.75rem", textTransform: "uppercase", marginTop: "0.25rem" }}>● Systems Active</p>
                </div>

                {/* Render the AI Tutor Component */}
                <AiTutor />

            </div>
        </div>
    );
}