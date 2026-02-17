const path = require("path");
const fs = require("fs");

exports.downloadAgent = (req, res) => {
    try {
        // Path kung nasaan ang RFID-Bridge.exe sa iyong VPS
        // Siguraduhin na ang file ay nasa: back-end/public/downloads/RFID-Bridge.exe
        const filePath = path.join(__dirname, "..", "public", "downloads", "RFID-Agent.exe");

        // I-check kung nage-exist ang file bago ipadala
        if (fs.existsSync(filePath)) {
            console.log("📥 User started downloading the Standalone RFID Bridge EXE.");

            // I-set ang headers para malaman ng browser na .exe ito
            res.setHeader("Content-Disposition", "attachment; filename=RFID-Bridge.exe");
            res.setHeader("Content-Type", "application/vnd.microsoft.portable-executable");

            // I-stream ang file papunta sa user
            const fileStream = fs.createReadStream(filePath);
            
            fileStream.on("error", (error) => {
                console.error("Stream Error:", error);
                if (!res.headersSent) {
                    res.status(500).send("Nagkaroon ng problema sa pag-download.");
                }
            });

            return fileStream.pipe(res);
        } else {
            console.error("❌ File not found at:", filePath);
            return res.status(404).json({
                message: "Ang RFID-Bridge.exe ay wala sa server. Siguraduhing na-upload ito sa public/downloads/ folder."
            });
        }
    } catch (error) {
        console.error("⚠️ Internal Server Error:", error);
        res.status(500).send("An unexpected error occurred.");
    }
};