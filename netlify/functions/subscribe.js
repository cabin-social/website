export default async (req) => {
    if (req.method !== "POST") {
        return new Response(JSON.stringify({ error: "Method not allowed" }), {
            status: 405,
            headers: { "Content-Type": "application/json" },
        });
    }

    let body;
    try {
        body = await req.json();
    } catch {
        return new Response(JSON.stringify({ error: "Invalid JSON" }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
        });
    }

    const { email } = body;

    if (!email || !email.includes("@")) {
        return new Response(JSON.stringify({ error: "Invalid email address" }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
        });
    }

    const apiKey = process.env.MAILERLITE_API_KEY;
    const groupId = process.env.MAILERLITE_GROUP_ID;

    if (!apiKey || !groupId) {
        return new Response(JSON.stringify({ error: "Server misconfiguration" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }

    try {
        const mlRes = await fetch("https://connect.mailerlite.com/api/subscribers", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                email,
                groups: [groupId],
            }),
        });

        const mlData = await mlRes.json();

        if (!mlRes.ok) {
            const message = mlData?.message || "Failed to subscribe";
            return new Response(JSON.stringify({ error: message }), {
                status: mlRes.status,
                headers: { "Content-Type": "application/json" },
            });
        }

        return new Response(JSON.stringify({ success: true }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    } catch (err) {
        return new Response(JSON.stringify({ error: "Internal server error" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
};

export const config = {
    path: "/api/subscribe",
};
