// import React from "react";
// import ReactDOM from "react-dom/client";
// import { BrowserRouter, Routes, Route } from "react-router-dom";
// import App from "./App";
// import Login from "./pages/Login";
// import { AuthProvider } from "./context/AuthContext";

// ReactDOM.createRoot(document.getElementById("root")!).render(
// 	<React.StrictMode>
// 		<AuthProvider>
// 			<BrowserRouter>
// 				<Routes>
// 					<Route path="/" element={<App />} />
// 					<Route path="/login" element={<Login />} />
// 				</Routes>
// 			</BrowserRouter>
// 		</AuthProvider>
// 	</React.StrictMode>
// );
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { AuthProvider } from "./context/AuthContext";

console.log("🔥 main.tsx loaded");

ReactDOM.createRoot(document.getElementById("root")!).render(
	<React.StrictMode>
		<AuthProvider>
			<BrowserRouter>
				<App />
			</BrowserRouter>
		</AuthProvider>
	</React.StrictMode>
);
