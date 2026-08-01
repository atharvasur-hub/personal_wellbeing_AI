import { useEffect, useState } from "react";
import AppLayout from "../components/AppLayout";

export default function Dashboard() {
    const [token, setToken] = useState("");
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        const savedToken = localStorage.getItem("agentic_token");
        if (!savedToken) {
            window.location.href = "/";
        } else {
            setToken(savedToken);
            // Parse token to build the user object
            // Token format: token_for_email@domain.com
            const email = savedToken.startsWith("token_for_") 
                ? savedToken.replace("token_for_", "") 
                : savedToken;
            const name = email.split("@")[0].split(".")[0].toUpperCase();
            setCurrentUser({
                id: email,
                email: email,
                name: name
            });
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("agentic_token");
        window.location.href = "/";
    };

    if (!currentUser) {
        return (
            <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#FAFAFA", fontFamily: "sans-serif" }}>
                <p style={{ color: "#4b5563", fontSize: "0.875rem" }}>Initializing cognitive session...</p>
            </div>
        );
    }

    return (
        <AppLayout currentUser={currentUser} onLogout={handleLogout} />
    );
}