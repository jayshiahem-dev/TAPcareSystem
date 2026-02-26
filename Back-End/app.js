const express = require("express");
const cors = require("cors");

const morgan = require("morgan");
const path = require("path");

const ErrorController = require("./Controller/errorController");
const session = require("express-session");
const MongoStore = require("connect-mongo");

const AdminRoute = require("./Routes/AdminRoute");

const Notification = require("./Routes/NotificationRoute");
const Resident = require("./Routes/ResidentRoute");
const AssignAssistance = require("./Routes/AssignRoutes");
const Category = require("./Routes/Category");
const History = require("./Routes/HistoryRoute");
const Rfid = require("./Routes/RFIDRegisterRoute");
const SuperAdmin = require("./Routes/SuperAdminRoute");
const Ayuda = require("./Routes/AyudaRoute");
const Logs = require("./Routes/LogsRoute");

const authentic = require("./Routes/authRouter");

const Analytics = require("./Routes/AnalyticsRoute");

const Officer = require("./Routes/OfficerRoute");
const DownloadAgent = require("./Routes/DownloadRoute");

let app = express();

const logger = function (req, res, next) {
  console.log("Middleware Called");
  next();
};

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.set("trust proxy", true);
app.use(
  session({
    secret: process.env.SECRET_STR,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.CONN_STR,
      ttl: 12 * 60 * 60,
    }),
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      sameSite: "none",
      maxAge: 12 * 60 * 60 * 1000,
    },
    rolling: true,
  }),
);
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST", "PATCH", "DELETE"],
    credentials: true,
  }),
);

app.use(logger);

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

const uploadsDir = path.join(__dirname, "..", "uploads");

app.use("/uploads", express.static(uploadsDir));
app.use("/api/v1/authentication", authentic);
app.use("/api/v1/Admin", AdminRoute);
app.use("/api/v1/Notification", Notification);
app.use("/api/v1/LogsAudit", Logs);
app.use("/api/v1/Officer", Officer);
app.use("/api/v1/Resident", Resident);
app.use("/api/v1/Assistance", AssignAssistance);
app.use("/api/v1/Category", Category);
app.use("/api/v1/History", History);
app.use("/api/v1/Rfid", Rfid);
app.use("/api/v1/Analytics", Analytics);
app.use("/api/v1/SuperAdmin", SuperAdmin);
app.use("/api/v1/Ayuda", Ayuda);
app.use("/api/v1/DownloadAgent", DownloadAgent);

app.use(ErrorController);

module.exports = app;
