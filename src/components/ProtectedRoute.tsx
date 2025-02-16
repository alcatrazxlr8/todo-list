import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = () => {
	console.log("🔐 ProtectedRoute component is rendering...");

	const { user, loading } = useAuth();

	console.log("Checking Protected Route:", { user, loading });

	if (loading) return <p>Loading...</p>;
	if (!user) return <Navigate to="/" replace />;

	return <Outlet />;
};

export default ProtectedRoute;
