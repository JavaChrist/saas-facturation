"use client";
import { useState } from "react";

interface Client {
  id: number;
  nom: string;
  adresse: string;
  email: string;
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([
    { id: 1, nom: "Jean Dupont", adresse: "123 Rue des Lilas, Paris", email: "jean.dupont@email.com" },
    { id: 2, nom: "Entreprise XYZ", adresse: "456 Avenue du Business, Lyon", email: "contact@xyz.com" },
  ]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-6">👥 Clients</h1>
      <div className="overflow-x-auto">
        <table className="w-full bg-white shadow-md rounded-lg">
          <thead className="bg-gray-800 text-white">
            <tr>
              <th className="py-3 px-4 text-left">Nom</th>
              <th className="py-3 px-4 text-left">Adresse</th>
              <th className="py-3 px-4 text-left">Email</th>
            </tr>
          </thead>
          <tbody>
            {clients.map((client) => (
              <tr key={client.id} className="border-b hover:bg-gray-100">
                <td className="py-3 px-4">{client.nom}</td>
                <td className="py-3 px-4">{client.adresse}</td>
                <td className="py-3 px-4">{client.email}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
