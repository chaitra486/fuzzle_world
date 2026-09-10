console.log("APP.JS LOADED");

async function saveStudent(name, usn, score) {

    console.log("Saving student...");
    console.log("Name:", name);
    console.log("USN:", usn);
    console.log("Score:", score);

    try {

        const response = await fetch("/api/students", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                studentName: name,
                srn: usn,
                score: score
            })
        });

        console.log("Response status:", response.status);

        const data = await response.json();

        console.log("Server response:", data);

        if (response.ok) {

            console.log("✅ Student saved successfully");

        } else {

            console.log("❌ Failed to save student");

        }

    } catch (error) {

        console.error("❌ Error:", error);

    }
}