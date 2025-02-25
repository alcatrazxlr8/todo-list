import {
	createContext,
	useContext,
	useEffect,
	useState,
	ReactNode,
} from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import {auth} from '../FirebaseConfig'

// Define the AuthContext type
type AuthContextType = {
	user: User | null;
	loading: boolean;
};

// Create the AuthContext
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Create the AuthProvider component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
	const [user, setUser] = useState<User | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
			console.log("Auth State Changed: ", firebaseUser); // Debugging Log
			setUser(firebaseUser);
			setLoading(false);
		});

		return () => unsubscribe();
	}, []);

	return (
		<AuthContext.Provider value={{ user, loading }}>
			{children}
		</AuthContext.Provider>
	);
};

// Custom hook for accessing auth state
export const useAuth = () => {
	const context = useContext(AuthContext);
	if (!context) {
		throw new Error("useAuth must be used within an AuthProvider");
	}
	return context;
};
