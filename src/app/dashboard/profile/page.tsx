"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { KycStatusBadge } from "@/components/ui/Badge";

export default function ProfilePage() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [profile, setProfile] = useState({
    firstName: "",
    lastName: "",
    dni: "",
    address: "",
    city: "",
    postalCode: "",
    birthDate: "",
    phone: "",
    bankIban: "",
    bankHolder: "",
  });
  const [kycStatus, setKycStatus] = useState("PENDING");

  useEffect(() => {
    fetch("/api/user/profile")
      .then((r) => r.json())
      .then((data) => {
        if (data) {
          setProfile({
            firstName: data.firstName || "",
            lastName: data.lastName || "",
            dni: data.dni || "",
            address: data.address || "",
            city: data.city || "",
            postalCode: data.postalCode || "",
            birthDate: data.birthDate ? data.birthDate.slice(0, 10) : "",
            phone: data.phone || "",
            bankIban: data.bankIban || "",
            bankHolder: data.bankHolder || "",
          });
          setKycStatus(data.kycStatus);
        }
      });
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess(false);

    const res = await fetch("/api/user/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(profile),
    });
    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Error al guardar");
    } else {
      setSuccess(true);
    }
    setSaving(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Mi Perfil</h1>
        <KycStatusBadge status={kycStatus} />
      </div>

      {kycStatus === "PENDING" && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-sm text-yellow-800">
          Completa todos tus datos y un administrador revisará tu solicitud KYC.
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {error && <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg">{error}</div>}
        {success && <div className="bg-green-50 text-green-700 text-sm px-4 py-3 rounded-lg">Perfil actualizado correctamente.</div>}

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Datos personales</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Nombre" value={profile.firstName} onChange={(e) => setProfile({ ...profile, firstName: e.target.value })} required />
            <Input label="Apellidos" value={profile.lastName} onChange={(e) => setProfile({ ...profile, lastName: e.target.value })} required />
            <Input label="DNI / NIE" value={profile.dni} onChange={(e) => setProfile({ ...profile, dni: e.target.value })} required />
            <Input label="Fecha de nacimiento" type="date" value={profile.birthDate} onChange={(e) => setProfile({ ...profile, birthDate: e.target.value })} required />
            <Input label="Teléfono" type="tel" value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Dirección</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <Input label="Dirección" value={profile.address} onChange={(e) => setProfile({ ...profile, address: e.target.value })} required />
            </div>
            <Input label="Ciudad" value={profile.city} onChange={(e) => setProfile({ ...profile, city: e.target.value })} required />
            <Input label="Código postal" value={profile.postalCode} onChange={(e) => setProfile({ ...profile, postalCode: e.target.value })} required />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h2 className="font-semibold text-gray-900 mb-2">Cuenta bancaria para retiradas</h2>
          <p className="text-sm text-gray-500 mb-4">Se usará por defecto para procesar tus retiradas.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="IBAN" placeholder="ES00 0000..." value={profile.bankIban} onChange={(e) => setProfile({ ...profile, bankIban: e.target.value })} />
            <Input label="Titular" value={profile.bankHolder} onChange={(e) => setProfile({ ...profile, bankHolder: e.target.value })} />
          </div>
        </div>

        <Button type="submit" loading={saving}>Guardar cambios</Button>
      </form>
    </div>
  );
}
