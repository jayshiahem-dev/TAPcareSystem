import { useContext, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext.jsx";
import socket from "../socket.js";
import { RFIDContext } from "../contexts/RFIDContext/RfidContext.jsx";
import { HistoryContext } from "../contexts/HistoryContext/HistoryContext.jsx";
import { NotificationDisplayContext } from "../contexts/NotificationContext/NotificationContext.jsx";
import { AssistanceContext } from "../contexts/AssignContext/AssignContext.jsx";
import { AyudaContext } from "../contexts/AyudaContext/AyudaContext.jsx";
import { ResidentContext } from "../contexts/ResidentContext/ResidentContext.jsx";
import { useRef } from "react";

const SocketListener = () => {
    const { fetchGroupProgram, fetchBenificiaryAssistance } = useContext(AyudaContext);
    const { fetchNotifications } = useContext(NotificationDisplayContext);
    const { DisplayContinueSelectResidents } = useContext(ResidentContext);
    const { role, linkId } = useAuth();
    const { setRfidData } = useContext(RFIDContext);
    const { setAssistancesToday } = useContext(HistoryContext);
    const { fetchLatestAssistance } = useContext(AssistanceContext);
    const debounceRef = useRef(null);
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

        const handlechangeprogram = async (data) => {
            // Sabay na tatakbo ang dalawang fetch requests
            await Promise.all([fetchLatestAssistance(data.assistanceId), fetchGroupProgram()]);
        };

        const handlecreateAyudaCreate = async (data) => {
            console.log("data", data);
              await Promise.all([DisplayContinueSelectResidents(data),fetchBenificiaryAssistance(data)]);
        };

        const handlecreateAssistance = () => {
            if (debounceRef.current) {
                clearTimeout(debounceRef.current);
            }

            debounceRef.current = setTimeout(async () => {
                await fetchLatestAssistance();
                
            }, 2000); // 500ms debounce delay
        };
        socket.on("rfid-scanned", handlerfidscanned);
        socket.on("newresident-claim", handlenewClaimed);
        socket.on("latestProgramChange", handlechangeprogram);
        socket.on("createAssistance", handlecreateAssistance);
        socket.on("AyudaCreate", handlecreateAyudaCreate);

        return () => {
            socket.off("rfid-scanned", handlerfidscanned);
            socket.off("latestProgramChange", handlechangeprogram);
            socket.off("newresident-claim", handlenewClaimed);
            socket.off("createAssistance", handlecreateAssistance);
            socket.off("AyudaCreate", handlecreateAyudaCreate);
        };
    }, [linkId, role]);

    return null;
};

export default SocketListener;
