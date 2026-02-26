import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { AdminDisplayProvider } from "./contexts/AdminContext/AdminContext.jsx";
import { AuthProvider } from "./contexts/AuthContext.jsx";
import { ResidentProvider } from "./contexts/ResidentContext/ResidentContext.jsx";
import SocketListener from "./SocketListener/SocketListener.jsx";
import { RFIDProvider } from "./contexts/RFIDContext/RfidContext.jsx";
import { CategoryProvider } from "./contexts/CategoryContext/categoryContext.jsx";
import { AssistanceProvider } from "./contexts/AssignContext/AssignContext.jsx";
import { HistoryProvider } from "./contexts/HistoryContext/HistoryContext.jsx";
import { OfficerDisplayProvider } from "./contexts/OfficerContext/OfficerContext.jsx";
import { NotificationDisplayProvider } from "./contexts/NotificationContext/NotificationContext.jsx";
import { RFIDRegisterProvider } from "./contexts/RegisterRfidContext/RegisterRfidContext.jsx";
import { DashboardProvider } from "./contexts/DashboardContext/SummaryDashboardContext.jsx";
import AxiosInterceptor from "./components/AxiosInterceptor.jsx";
import { SuperAdminDisplayProvider } from "./contexts/SuperAdminContext/SuperAdminContext.jsx";
import { AyudaProvider } from "./contexts/AyudaContext/AyudaContext.jsx";

createRoot(document.getElementById("root")).render(
        <AuthProvider>
            <AxiosInterceptor />
            <AyudaProvider>
                <SuperAdminDisplayProvider>
                    <DashboardProvider>
                        <RFIDRegisterProvider>
                            <NotificationDisplayProvider>
                                <CategoryProvider>
                                    <OfficerDisplayProvider>
                                        <HistoryProvider>
                                            <AssistanceProvider>
                                                <RFIDProvider>
                                                    <ResidentProvider>
                                                        <AdminDisplayProvider>
                                                            <SocketListener />
                                                            <App />
                                                        </AdminDisplayProvider>
                                                    </ResidentProvider>
                                                </RFIDProvider>
                                            </AssistanceProvider>
                                        </HistoryProvider>
                                    </OfficerDisplayProvider>
                                </CategoryProvider>
                            </NotificationDisplayProvider>
                        </RFIDRegisterProvider>
                    </DashboardProvider>
                </SuperAdminDisplayProvider>
            </AyudaProvider>
        </AuthProvider>
   
);
