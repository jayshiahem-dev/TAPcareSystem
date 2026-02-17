import { useContext, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext.jsx";
import socket from "../socket.js";
import { RFIDContext } from "../contexts/RFIDContext/RfidContext.jsx";
import { HistoryContext } from "../contexts/HistoryContext/HistoryContext.jsx";
import { NotificationDisplayContext } from "../contexts/NotificationContext/NotificationContext.jsx";

const SocketListener = () => {
    const { fetchNotifications } = useContext(NotificationDisplayContext);
    const { role, linkId } = useAuth();
    const { setRfidData } = useContext(RFIDContext);
    const { setAssistancesToday } = useContext(HistoryContext);

    useEffect(() => {
        if (!linkId || !role) return;
        socket.emit("register-user", linkId, role);
    }, [linkId, role]);

    useEffect(() => {
        if (!linkId || !role) return;

        const handlerfidscanned = async (data) => {
            await setRfidData(data);
        };

        const handlenewClaimed = (data) => {
            fetchNotifications();
            setAssistancesToday((prev) => [data, ...(prev || [])]); // prev || [] ensures no error
            console.log("Updated AssistancesToday:", data);
        };
        socket.on("rfid-scanned", handlerfidscanned);
        socket.on("newresident-claim", handlenewClaimed);

        return () => {
            socket.off("rfid-scanned", handlerfidscanned);
            socket.off("newresident-claim", handlenewClaimed);
        };
    }, [linkId, role]);

    return null;
};

export default SocketListener;
