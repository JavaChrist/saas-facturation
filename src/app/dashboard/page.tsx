"use client";
import { useEffect } from "react";
import { useAuth } from "@/lib/authContext";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const router = useRouter();

  // Redirection vers /login si l'utilisateur n'est pas connecté
  useEffect(() => {
    if (!user) {
      router.push("/login");
    }
  }, [user, router]);

  if (!user) {
    return <p className="text-center text-gray-600 mt-10">Redirection...</p>;
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-800 text-white min-h-screen p-5">
        <h2 className="text-xl font-bold mb-6">Facturation SaaS</h2>
        <nav className="space-y-2">
          <a href="/dashboard" className="block py-2 px-4 rounded-md bg-gray-700 hover:bg-gray-600">
            Dashboard
          </a>
          <a href="/dashboard/factures" className="block py-2 px-4 rounded-md hover:bg-gray-600">
            Factures
          </a>
          <a href="/dashboard/clients" className="block py-2 px-4 rounded-md hover:bg-gray-600">
            Clients
          </a>
          <a href="/dashboard/settings" className="block py-2 px-4 rounded-md hover:bg-gray-600">
            Paramètres
          </a>
        </nav>
        <button
          onClick={logout}
          className="mt-6 w-full bg-red-500 py-2 rounded-md hover:bg-red-600 transition"
        >
          Déconnexion
        </button>
      </aside>

      {/* Contenu principal */}
      <main className="flex-1 p-6">
        {/* Topbar */}
        <div className="flex justify-between items-center bg-white p-4 shadow-md rounded-md">
          <h1 className="text-2xl font-semibold">Bienvenue, {user.displayName || "Utilisateur"} 👋</h1>
        </div>

        {/* Cartes d'indicateurs */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-6 rounded-lg shadow-md transform hover:scale-105 transition-transform duration-300">
            <h3 className="text-lg font-semibold">Total des Factures</h3>
            <p className="text-2xl font-bold text-gray-800">12 500 €</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md transform hover:scale-105 transition-transform duration-300">
            <h3 className="text-lg font-semibold">Clients enregistrés</h3>
            <p className="text-2xl font-bold text-gray-800">53</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md transform hover:scale-105 transition-transform duration-300">
            <h3 className="text-lg font-semibold">Factures en attente</h3>
            <p className="text-2xl font-bold text-red-600">3</p>
          </div>
        </div>

      </main>
    </div>
  );
}
