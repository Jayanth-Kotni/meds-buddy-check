import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";

interface AuthFormProps {
  isLogin?: boolean;
}

const AuthForm = ({ isLogin = false }: AuthFormProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"patient" | "caretaker">("patient");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const endpoint = isLogin ? "/api/auth/login" : "/api/auth/signup";

    try {
      const response = await api.post(endpoint, {
        email,
        password,
        ...(isLogin ? {} : { role }),
      });

      if (isLogin) {
        const { token } = response.data;
        localStorage.setItem("token", token);
        const decoded = JSON.parse(atob(token.split(".")[1])); // get role
        toast({ description: "Logged in successfully!" });
        navigate("/", { state: { role: decoded.role } });
      } else {
        toast({ description: "Signup successful. Please login." });
        navigate("/login");
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        description: error?.response?.data?.error || "Something went wrong",
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-green-50 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl text-center">
            {isLogin ? "Login" : "Sign Up"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {!isLogin && (
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as "patient" | "caretaker")}
                className="w-full p-2 border rounded-md text-sm"
              >
                <option value="patient">Patient</option>
                <option value="caretaker">Caretaker</option>
              </select>
            )}
            <Button className="w-full" type="submit">
              {isLogin ? "Login" : "Sign Up"}
            </Button>
            <p className="text-center text-sm text-muted-foreground mt-2">
              {isLogin ? (
                <>
                  Don’t have an account?{" "}
                  <Link to="/signup" className="text-blue-600 hover:underline">
                    Sign Up
                  </Link>
                </>
              ) : (
                <>
                  Already have an account?{" "}
                  <Link to="/login" className="text-blue-600 hover:underline">
                    Login
                  </Link>
                </>
              )}
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthForm;
