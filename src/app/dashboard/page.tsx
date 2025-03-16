"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/authContext";
import { useRouter } from "next/navigation";
import { FiUsers, FiFileText, FiClock, FiSettings } from "react-icons/fi";
import Link from "next/link";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Facture } from "@/types/facture";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState({
    totalMontantFactures: 0,
    totalClients: 0,
    facturesEnAttente: 0,
  });

  // Redirection vers /login si l'utilisateur n'est pas connecté
  useEffect(() => {
    if (!user) {
      router.push("/login");
    }
  }, [user, router]);

  useEffect(() => {
    // Écouter les changements dans la collection factures
    const unsubFactures = onSnapshot(collection(db, "factures"), (snapshot) => {
      const factures = snapshot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      })) as Facture[];

      setStats((prev) => ({
        ...prev,
        totalMontantFactures: factures.reduce(
          (sum, facture) => sum + (facture.totalTTC || 0),
          0
        ),
        facturesEnAttente: factures.filter((f) => f.statut === "En attente")
          .length,
      }));
    });

    // Écouter les changements dans la collection clients
    const unsubClients = onSnapshot(collection(db, "clients"), (snapshot) => {
      setStats((prev) => ({
        ...prev,
        totalClients: snapshot.size,
      }));
    });

    return () => {
      unsubFactures();
      unsubClients();
    };
  }, []);

  if (!user) {
    return <p className="text-center text-gray-600 mt-10">Redirection...</p>;
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-800 text-white min-h-screen p-5">
        <h2 className="text-xl font-bold mb-6">Facturation SaaS</h2>
        <nav className="space-y-2">
          <a
            href="/dashboard"
            className="block py-2 px-4 rounded-md bg-gray-700 hover:bg-gray-600"
          >
            Dashboard
          </a>
          <a
            href="/dashboard/factures"
            className="block py-2 px-4 rounded-md hover:bg-gray-600"
          >
            Factures
          </a>
          <a
            href="/dashboard/clients"
            className="block py-2 px-4 rounded-md hover:bg-gray-600"
          >
            Clients
          </a>
          <a
            href="/dashboard/parametres"
            className="block py-2 px-4 rounded-md hover:bg-gray-600"
          >
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
        <div className="flex justify-between items-center bg-white p-4 shadow-md rounded-md mb-8">
          <h1 className="text-2xl font-semibold">
            Bienvenue, {user.email || "Utilisateur"} 👋
          </h1>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md h-[120px] flex items-center transform hover:scale-105 transition-transform duration-300">
            <div className="flex items-center justify-between w-full">
              <div>
                <p className="text-gray-500 mb-2">Total Factures</p>
                <h2 className="text-3xl font-bold">
                  {stats.totalMontantFactures.toLocaleString("fr-FR", {
                    style: "currency",
                    currency: "EUR",
                  })}
                </h2>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <FiFileText className="text-blue-500 text-xl" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md h-[120px] flex items-center transform hover:scale-105 transition-transform duration-300">
            <div className="flex items-center justify-between w-full">
              <div>
                <p className="text-gray-500 mb-2">Clients enregistrés</p>
                <h2 className="text-3xl font-bold">{stats.totalClients}</h2>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <FiUsers className="text-green-500 text-xl" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md h-[120px] flex items-center transform hover:scale-105 transition-transform duration-300">
            <div className="flex items-center justify-between w-full">
              <div>
                <p className="text-gray-500 mb-2">Factures en attente</p>
                <h2 className="text-3xl font-bold">
                  {stats.facturesEnAttente}
                </h2>
              </div>
              <div className="bg-yellow-100 p-3 rounded-full">
                <FiClock className="text-yellow-500 text-xl" />
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link
            href="/dashboard/clients"
            className="transform hover:scale-105 transition-transform duration-300"
          >
            <div className="bg-white p-6 rounded-lg shadow-md cursor-pointer h-[100px] flex items-center">
              <div className="flex items-center space-x-4">
                <div className="bg-green-100 p-3 rounded-full">
                  <FiUsers className="text-green-500 text-xl" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold">Clients</h3>
                  <p className="text-gray-500">Gérer vos clients</p>
                </div>
              </div>
            </div>
          </Link>

          <Link
            href="/dashboard/factures"
            className="transform hover:scale-105 transition-transform duration-300"
          >
            <div className="bg-white p-6 rounded-lg shadow-md cursor-pointer h-[100px] flex items-center">
              <div className="flex items-center space-x-4">
                <div className="bg-blue-100 p-3 rounded-full">
                  <FiFileText className="text-blue-500 text-xl" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold">Factures</h3>
                  <p className="text-gray-500">Gérer vos factures</p>
                </div>
              </div>
            </div>
          </Link>

          <Link
            href="/dashboard/parametres"
            className="transform hover:scale-105 transition-transform duration-300"
          >
            <div className="bg-white p-6 rounded-lg shadow-md cursor-pointer h-[100px] flex items-center">
              <div className="flex items-center space-x-4">
                <div className="bg-gray-100 p-3 rounded-full">
                  <FiSettings className="text-gray-500 text-xl" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold">Paramètres</h3>
                  <p className="text-gray-500">Configuration entreprise</p>
                </div>
              </div>
            </div>
          </Link>
        </div>
      </main>
    </div>
  );
}
