import { jsPDF } from "jspdf";
import autoTable, { UserOptions } from "jspdf-autotable";
import { Facture } from "@/types/facture";
import { Entreprise } from "@/types/entreprise";
import { db, storage } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { ref, getDownloadURL } from "firebase/storage";

// Déclaration du type augmenté
declare module "jspdf" {
  interface jsPDF {
    autoTable: (options: UserOptions) => void;
  }
}

export const generateInvoicePDF = async (facture: Facture) => {
  try {
    console.log("Début de la génération du PDF", { facture });

    // Vérification des données requises
    if (!facture || !facture.numero || !facture.client) {
      console.error("Données manquantes:", {
        hasFacture: !!facture,
        hasNumero: !!facture?.numero,
        hasClient: !!facture?.client,
      });
      throw new Error("Données de facture invalides");
    }

    // Récupération des informations de l'entreprise
    const entrepriseDoc = await getDoc(doc(db, "parametres", "entreprise"));
    if (!entrepriseDoc.exists()) {
      throw new Error(
        "Les informations de l'entreprise n'ont pas été configurées"
      );
    }
    const entreprise = entrepriseDoc.data() as Entreprise;

    // Création du document PDF
    console.log("Création du document PDF");
    const pdfDoc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    // En-tête
    console.log("Ajout de l'en-tête");

    // Ajout du logo s'il existe
    if (entreprise.logo) {
      try {
        // Précharger l'image
        const loadImage = (url: string): Promise<HTMLImageElement> => {
          return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = "anonymous"; // Important pour CORS
            img.onload = () => resolve(img);
            img.onerror = () =>
              reject(new Error("Erreur de chargement de l'image"));
            img.src = url;
          });
        };

        // Convertir l'image en base64
        const getBase64FromImage = (img: HTMLImageElement): string => {
          const canvas = document.createElement("canvas");
          canvas.width = img.naturalWidth;
          canvas.height = img.naturalHeight;
          const ctx = canvas.getContext("2d");
          ctx?.drawImage(img, 0, 0);
          // Forcer le format PNG
          return canvas.toDataURL("image/png");
        };

        console.log("Chargement du logo depuis:", entreprise.logo);
        const img = await loadImage(entreprise.logo);
        console.log("Image chargée, dimensions:", img.width, "x", img.height);

        const base64data = getBase64FromImage(img);
        console.log("Image convertie en base64");

        // Calculer les dimensions pour conserver le ratio
        const maxWidth = 40;
        const maxHeight = 40;
        const ratio = Math.min(maxWidth / img.width, maxHeight / img.height);
        const width = img.width * ratio;
        const height = img.height * ratio;

        console.log(
          "Ajout du logo au PDF avec dimensions:",
          width,
          "x",
          height
        );
        pdfDoc.addImage(base64data, "PNG", 20, 15, width, height);

        // Décaler le titre "FACTURE" vers la droite si le logo est présent
        pdfDoc.setFontSize(20);
        pdfDoc.text("FACTURE", 140, 20, { align: "center" });
      } catch (error) {
        console.error("Erreur détaillée lors de l'ajout du logo:", error);
        // En cas d'erreur avec le logo, on affiche juste le titre au centre
        pdfDoc.setFontSize(20);
        pdfDoc.text("FACTURE", 105, 20, { align: "center" });
      }
    } else {
      // Sans logo, on centre le titre
      pdfDoc.setFontSize(20);
      pdfDoc.text("FACTURE", 105, 20, { align: "center" });
    }

    // Informations de l'entreprise
    console.log("Ajout des informations de l'entreprise");
    pdfDoc.setFontSize(10);
    const startY = entreprise.logo ? 45 : 40; // Ajuster la position Y en fonction de la présence du logo
    pdfDoc.text(entreprise.nom.toUpperCase(), 20, startY);
    pdfDoc.text(entreprise.rue, 20, startY + 5);
    pdfDoc.text(
      `${entreprise.codePostal} ${entreprise.ville}`,
      20,
      startY + 10
    );
    pdfDoc.text(`Tél: ${entreprise.telephone}`, 20, startY + 15);
    pdfDoc.text(`Email: ${entreprise.email}`, 20, startY + 20);
    pdfDoc.text(`SIRET: ${entreprise.siret}`, 20, startY + 25);
    if (entreprise.tvaIntracommunautaire) {
      pdfDoc.text(
        `TVA Intra: ${entreprise.tvaIntracommunautaire}`,
        20,
        startY + 30
      );
    }

    // Informations de la facture
    console.log("Ajout des informations de la facture");
    pdfDoc.setFontSize(12);
    pdfDoc.text(`Facture N° ${facture.numero}`, 140, 40);

    // Gestion sécurisée de la date
    console.log("Traitement de la date");
    let dateStr;
    try {
      if (facture.dateCreation) {
        const date =
          facture.dateCreation instanceof Date
            ? facture.dateCreation
            : new Date(facture.dateCreation);
        dateStr = date.toLocaleDateString("fr-FR");
      } else {
        dateStr = new Date().toLocaleDateString("fr-FR");
      }
    } catch (error) {
      console.warn("Erreur lors du formatage de la date:", error);
      dateStr = new Date().toLocaleDateString("fr-FR");
    }
    pdfDoc.text(`Date: ${dateStr}`, 140, 45);

    // Informations du client
    console.log("Ajout des informations client");
    pdfDoc.setFontSize(11);
    pdfDoc.text("FACTURER À:", 140, 60);
    pdfDoc.setFontSize(10);

    const clientInfo = {
      nom: facture.client.nom || "",
      rue: facture.client.rue || "",
      codePostal: facture.client.codePostal || "",
      ville: facture.client.ville || "",
      email: facture.client.email || "",
      delaisPaiement: facture.client.delaisPaiement || "",
    };

    pdfDoc.text(clientInfo.nom, 140, 65);
    pdfDoc.text(clientInfo.rue, 140, 70);
    pdfDoc.text(`${clientInfo.codePostal} ${clientInfo.ville}`, 140, 75);
    pdfDoc.text(`Email: ${clientInfo.email}`, 140, 80);
    pdfDoc.text(`Délai de paiement: ${clientInfo.delaisPaiement}`, 140, 85);

    // Tableau des articles
    console.log("Création du tableau des articles");
    const tableColumn = [
      "Description",
      "Quantité",
      "Prix HT",
      "TVA %",
      "Total TTC",
    ];
    const tableRows = (facture.articles || []).map((article) => {
      const row = [
        article.description || "",
        article.quantite?.toString() || "0",
        `${(article.prixUnitaireHT || 0).toFixed(2)} €`,
        `${article.tva || 0}%`,
        `${(article.totalTTC || 0).toFixed(2)} €`,
      ];
      console.log("Article traité:", row);
      return row;
    });

    console.log("Configuration du tableau");
    autoTable(pdfDoc, {
      startY: 100,
      head: [tableColumn],
      body: tableRows,
      theme: "striped",
      headStyles: { fillColor: [66, 66, 66] },
      margin: { top: 100 },
      didDrawPage: function (data: any) {
        if (data.pageCount > 1) {
          pdfDoc.setFontSize(8);
          pdfDoc.text(
            `Facture N° ${facture.numero} - Page ${data.pageCount}`,
            data.settings.margin.left,
            20
          );
        }
      },
    } as UserOptions);

    // Totaux
    console.log("Ajout des totaux");
    const finalY = (pdfDoc as any).lastAutoTable.finalY || 150;
    pdfDoc.text(
      `Total HT: ${(facture.totalHT || 0).toFixed(2)} €`,
      140,
      finalY + 10
    );
    pdfDoc.text(
      `Total TTC: ${(facture.totalTTC || 0).toFixed(2)} €`,
      140,
      finalY + 20
    );

    // Fonction pour ajouter le pied de page
    const addFooter = () => {
      const pageHeight = pdfDoc.internal.pageSize.height;

      // Coordonnées bancaires si présentes
      if (entreprise.rib?.iban) {
        pdfDoc.setFontSize(9);
        pdfDoc.text("Coordonnées bancaires:", 20, pageHeight - 50);
        pdfDoc.text(`IBAN: ${entreprise.rib.iban}`, 20, pageHeight - 45);
        pdfDoc.text(`BIC: ${entreprise.rib.bic}`, 20, pageHeight - 40);
        pdfDoc.text(`Banque: ${entreprise.rib.banque}`, 20, pageHeight - 35);
      }

      // Mentions légales
      console.log("Ajout des mentions légales");
      pdfDoc.setFontSize(8);
      entreprise.mentionsLegales?.forEach((mention, index) => {
        pdfDoc.text(mention, 20, pageHeight - 20 + index * 5);
      });
    };

    // Ajouter le pied de page
    addFooter();

    // Sauvegarde du PDF avec gestion d'erreur
    console.log("Tentative de sauvegarde du PDF");
    try {
      pdfDoc.save(`${facture.numero}.pdf`);
      console.log("PDF généré avec succès");
      return true;
    } catch (saveError) {
      console.error("Erreur lors de la sauvegarde du PDF:", saveError);
      throw new Error("Impossible de sauvegarder le PDF");
    }
  } catch (error: unknown) {
    console.error("Erreur détaillée lors de la génération du PDF:", error);
    if (error instanceof Error) {
      console.error("Stack trace:", error.stack);
      throw new Error(`Erreur lors de la génération du PDF: ${error.message}`);
    } else {
      throw new Error("Erreur inconnue lors de la génération du PDF");
    }
  }
};
