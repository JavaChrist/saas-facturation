"use client";
import { useState } from "react";

interface Article {
  id: number;
  description: string;
  quantite: number;
  prixUnitaireHT: number;
  tva: number;
  totalTTC: number;
}

interface Facture {
  id: number;
  numero: string;
  client: string;
  statut: "Payée" | "En attente" | "En retard";
  articles: Article[];
  totalHT: number;
  totalTTC: number;
}

export default function FacturesPage() {
  const [factures, setFactures] = useState<Facture[]>([
    { id: 1, numero: "FCT-2024001", client: "Jean Dupont", statut: "Payée", articles: [], totalHT: 1200, totalTTC: 1440 },
    { id: 2, numero: "FCT-2024002", client: "Entreprise XYZ", statut: "En attente", articles: [], totalHT: 850, totalTTC: 1020 },
    { id: 3, numero: "FCT-2024003", client: "Marie Curie", statut: "En retard", articles: [], totalHT: 2500, totalTTC: 3000 },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newFacture, setNewFacture] = useState<Facture>({
    id: 0,
    numero: "",
    client: "",
    statut: "En attente",
    articles: [],
    totalHT: 0,
    totalTTC: 0,
  });

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => {
    setNewFacture({
      id: 0,
      numero: "",
      client: "",
      statut: "En attente",
      articles: [],
      totalHT: 0,
      totalTTC: 0,
    });
    setIsModalOpen(false);
  };

  // Ajout d'un article à la facture
  const addArticle = () => {
    setNewFacture({
      ...newFacture,
      articles: [
        ...newFacture.articles,
        { id: Date.now(), description: "", quantite: 1, prixUnitaireHT: 0, tva: 20, totalTTC: 0 },
      ],
    });
  };

  // Mise à jour d'un article
  const handleArticleChange = (index: number, field: string, value: any) => {
    const updatedArticles = [...newFacture.articles];
    updatedArticles[index] = { ...updatedArticles[index], [field]: value };

    // Calcul du total TTC pour cet article
    const prixHT = updatedArticles[index].prixUnitaireHT * updatedArticles[index].quantite;
    const tvaAmount = (prixHT * updatedArticles[index].tva) / 100;
    updatedArticles[index].totalTTC = prixHT + tvaAmount;

    // Mise à jour des totaux de la facture
    const totalHT = updatedArticles.reduce((sum, article) => sum + article.prixUnitaireHT * article.quantite, 0);
    const totalTTC = updatedArticles.reduce((sum, article) => sum + article.totalTTC, 0);

    setNewFacture({ ...newFacture, articles: updatedArticles, totalHT, totalTTC });
  };

  // Suppression d'un article
  const removeArticle = (id: number) => {
    const updatedArticles = newFacture.articles.filter((article) => article.id !== id);
    const totalHT = updatedArticles.reduce((sum, article) => sum + article.prixUnitaireHT * article.quantite, 0);
    const totalTTC = updatedArticles.reduce((sum, article) => sum + article.totalTTC, 0);
    setNewFacture({ ...newFacture, articles: updatedArticles, totalHT, totalTTC });
  };

  // Validation du formulaire
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFactures([...factures, { ...newFacture, id: factures.length + 1 }]);
    closeModal();
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-4xl font-semibold">📜 Factures</h1>
        <button onClick={openModal} className="bg-gray-800 text-white py-2 px-4 rounded-md hover:bg-gray-600 transform hover:scale-105 transition-transform duration-300">
          Ajouter une facture
        </button>
      </div>

      {/* Tableau des factures */}
      <div className="overflow-x-auto">
        <table className="w-full bg-white shadow-md rounded-lg">
          <thead className="bg-gray-800 text-white">
            <tr>
              <th className="py-3 px-4 text-left">N° Facture</th>
              <th className="py-3 px-4 text-left">Client</th>
              <th className="py-3 px-4 text-left">Total TTC</th>
              <th className="py-3 px-4 text-left">Statut</th>
              <th className="py-3 px-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {factures.map((facture) => (
              <tr key={facture.id} className="border-b hover:bg-gray-100">
                <td className="py-3 px-4">{facture.numero}</td>
                <td className="py-3 px-4">{facture.client}</td>
                <td className="py-3 px-4">{facture.totalTTC.toFixed(2)} €</td>
                <td className="py-3 px-4">
                  <span className={`py-1 px-3 rounded-full text-white text-sm ${facture.statut === "Payée" ? "bg-green-500" : facture.statut === "En attente" ? "bg-yellow-500" : "bg-red-500"}`}>
                    {facture.statut}
                  </span>
                </td>
                <td className="py-3 px-4 text-center">
                  <button className="bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600  transform hover:scale-105 transition-transform duration-300">
                    ✏️ Modifier
                  </button>
                  <button
                    onClick={() => setFactures(factures.filter((f) => f.id !== facture.id))}
                    className="ml-2 bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-800  transform hover:scale-105 transition-transform duration-300"
                  >
                    ❌ Supprimer
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal amélioré */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-[1200px] relative">
            <button
              onClick={closeModal}
              className="absolute top-3 right-3 bg-gray-300 text-gray-800 px-3 py-1 rounded-full hover:bg-gray-400 transform hover:scale-105 transition-transform duration-300"
            >
              ❌
            </button>
            <h2 className="text-xl font-semibold mb-4">Ajouter une facture</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="Numéro de facture"
                value={newFacture.numero}
                onChange={(e) => setNewFacture({ ...newFacture, numero: e.target.value.toUpperCase() })}
                className="w-full p-2 border"
                required
              />
              <input
                type="text"
                placeholder="Client"
                value={newFacture.client}
                onChange={(e) => setNewFacture({ ...newFacture, client: e.target.value.toUpperCase() })}
                className="w-full p-2 border"
                required
              />

              <h3 className="font-semibold">Articles</h3>
              {newFacture.articles.map((article, index) => (
                <div key={article.id} className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="Description"
                    value={article.description}
                    onChange={(e) => handleArticleChange(index, "description", e.target.value)}
                    className="flex-1 p-2 border"
                  />
                  <input
                    type="number"
                    placeholder="Qté"
                    value={article.quantite}
                    onChange={(e) => handleArticleChange(index, "quantite", Number(e.target.value))}
                    className="w-16 p-2 border"
                  />
                  <input
                    type="number"
                    placeholder="Prix HT"
                    value={article.prixUnitaireHT}
                    onChange={(e) => handleArticleChange(index, "prixUnitaireHT", Number(e.target.value))}
                    className="w-24 p-2 border"
                  />
                  <input
                    type="number"
                    placeholder="TVA %"
                    value={article.tva}
                    onChange={(e) => handleArticleChange(index, "tva", Number(e.target.value))}
                    className="w-16 p-2 border"
                  />
                  <p className="w-24 text-center font-semibold">{article.totalTTC.toFixed(2)} €</p>
                  <button type="button" onClick={() => removeArticle(article.id)} className="text-red-500">
                    ❌
                  </button>
                </div>
              ))}

              <div className="flex justify-between">
                <button type="button" onClick={addArticle} className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-800 transform hover:scale-105 transition-transform duration-300">
                  Ajouter un article
                </button>
                <button type="submit" className="bg-gray-800 text-white px-4 py-2 rounded-md hover:bg-gray-500 transform hover:scale-105 transition-transform duration-300">
                  Ajouter la facture
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
