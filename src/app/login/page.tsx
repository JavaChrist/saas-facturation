"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/authContext";

export default function LoginPage() {
  const { loginWithGoogle, loginWithEmail, registerWithEmail } = useAuth();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle();
      router.push("/dashboard");
    } catch (err) {
      setError("Erreur de connexion avec Google.");
    }
  };

  const handleEmailLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    try {
      await loginWithEmail(email, password);
      router.push("/dashboard");
    } catch (err) {
      setError("Email ou mot de passe incorrect.");
    }
  };

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    try {
      await registerWithEmail(email, password);
      router.push("/dashboard");
    } catch (err) {
      setError("Erreur lors de la création du compte.");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-6">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-md border border-gray-300">
        <h1 className="text-2xl font-semibold text-center text-gray-800 mb-6">Connexion</h1>

        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

        <button
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center bg-white border border-gray-300 text-gray-700 py-2 rounded-md hover:bg-gray-100 transition duration-200"
        >
          <img src="/google.svg" alt="Google" className="w-5 h-5 mr-2" />
          Connexion avec Google
        </button>

        <div className="border-t border-gray-300 my-6"></div>

        <form onSubmit={handleEmailLogin} className="space-y-4">
          <input
            type="email"
            name="email"
            placeholder="Email"
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-500 focus:outline-none"
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Mot de passe"
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-500 focus:outline-none"
            required
          />
          <button
            type="submit"
            className="w-full bg-gray-600 text-white py-2 rounded-md hover:bg-gray-900 transition duration-200"
          >
            Connexion
          </button>
        </form>

        <p className="text-center text-gray-600 mt-6">Pas encore de compte ?</p>

        <form onSubmit={handleRegister} className="space-y-4 mt-4">
          <input
            type="email"
            name="email"
            placeholder="Email"
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-500 focus:outline-none"
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Mot de passe"
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-500 focus:outline-none"
            required
          />
          <button
            type="submit"
            className="w-full bg-gray-600 text-white py-2 rounded-md hover:bg-gray-800 transition duration-200"
          >
            Créer un compte
          </button>
        </form>
      </div>
    </div>
  );
}
