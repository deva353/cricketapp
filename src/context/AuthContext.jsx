import {
  createContext,
  useContext,
  useState
} from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {

  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(
        localStorage.getItem("gully_user")
      );
    } catch {
      return null;
    }
  });

  const login = (email, password) => {

    const users = JSON.parse(
      localStorage.getItem("gully_users") || "[]"
    );

    const foundUser = users.find(
      (item) =>
        item.email.toLowerCase() === email.toLowerCase() &&
        item.password === password
    );

    if (!foundUser) {
      return {
        success: false,
        message: "Invalid email or password"
      };
    }

    const loggedInUser = {
      name: foundUser.name,
      email: foundUser.email,
      role: foundUser.role
    };

    localStorage.setItem(
      "gully_user",
      JSON.stringify(loggedInUser)
    );

    setUser(loggedInUser);

    return { success: true };
  };

  const register = (userData) => {

    const users = JSON.parse(
      localStorage.getItem("gully_users") || "[]"
    );

    const exists = users.find(
      (item) =>
        item.email.toLowerCase() ===
        userData.email.toLowerCase()
    );

    if (exists) {
      return {
        success: false,
        message: "Email already registered"
      };
    }

    users.push(userData);

    localStorage.setItem(
      "gully_users",
      JSON.stringify(users)
    );

    return {
      success: true,
      message: "Registration successful"
    };
  };

  const logout = () => {

    localStorage.removeItem("gully_user");

    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        isAuthenticated: Boolean(user)
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}