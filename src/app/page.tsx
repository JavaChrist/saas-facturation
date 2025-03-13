"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    router.push("/login");
  }, [router]);
  <h1 className="text-4xl font-bold text-blue-500">Test Tailwind</h1>

  return <p>Redirection vers la page de connexion...</p>;
}

