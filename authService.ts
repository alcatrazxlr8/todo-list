import { GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { auth } from "./src/firebaseConfig.ts";

// Sign in with Google
export const signInWithGoogle = async () => {
	try {
		const provider = new GoogleAuthProvider();
		const result = await signInWithPopup(auth, provider);
		return result.user;
	} catch (error) {
		console.error("Google Sign-In Error:", error);
		return null;
	}
};

// Sign out
export const logOut = async () => {
	try {
		await signOut(auth);
	} catch (error) {
		console.error("Logout Error:", error);
	}
};

