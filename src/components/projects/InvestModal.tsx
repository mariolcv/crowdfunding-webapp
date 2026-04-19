"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { formatCurrency } from "@/lib/taxes";
import { calculateInterest } from "@/lib/taxes";
import { useRouter } from "next/navigation";
import SignatureCanvas from "react-signature-canvas";
import { X } from "lucide-react";

interface InvestModalProps {
  projectId: string;
  projectName: string;
  annualRate: number;
  durationMonths: number;
  minInvestment: number;
  maxAvailable: number;
  walletBalance: number;
}

export function InvestModal({
  projectId,
  projectName,
  annualRate,
  durationMonths,
  minInvestment,
  maxAvailable,
  walletBalance,
}: InvestModalProps) {
  const router = useRouter();
  const sigRef = useRef<SignatureCanvas>(null);
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<"amount" | "contract" | "sign" | "success">("amount");
  const [amount, setAmount] = useState(minInvestment);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [accepted, setAccepted] = useState(false);

  const maxAmount = Math.min(maxAvailable, walletBalance);
  const interest = calculateInterest(amount, annualRate, durationMonths);

  const handleInvest = async () => {
    if (!sigRef.current || sigRef.current.isEmpty()) {
      setError("Por favor, firma el contrato");
      return;
    }

    setLoading(true);
    setError("");
    const signatureData = sigRef.current.toDataURL("image/png");

    const res = await fetch("/api/investments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectId, amount, signatureData }),
    });
    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Error al procesar la inversión");
      setLoading(false);
      return;
    }

    setStep("success");
    setLoading(false);
  };

  const handleAmountChange = (val: string) => {
    const n = Math.round(Number(val) / 100) * 100;
    setAmount(Math.max(minInvestment, Math.min(maxAmount, n)));
  };

  if (!open) {
    return (
      <Button className="w-full" size="lg" onClick={() => setOpen(true)}>
        Invertir ahora
      </Button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="font-bold text-gray-900 text-lg">Invertir en {projectName}</h2>
          <button onClick={() => { setOpen(false); setStep("amount"); setError(""); }} className="p-1 rounded-lg hover:bg-gray-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          {step === "amount" && (
            <div className="space-y-5">
              <div>
                <p className="text-sm text-gray-500 mb-1">Saldo disponible: <span className="font-medium text-gray-900">{formatCurrency(walletBalance)}</span></p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Importe a invertir (múltiplo de 100€)</label>
                <input
                  type="range"
                  min={minInvestment}
                  max={maxAmount}
                  step={100}
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full"
                />
                <div className="flex items-center gap-3 mt-2">
                  <Input
                    type="number"
                    min={minInvestment}
                    max={maxAmount}
                    step={100}
                    value={amount}
                    onChange={(e) => handleAmountChange(e.target.value)}
                    className="text-center font-bold text-lg"
                  />
                  <span className="text-gray-500">€</span>
                </div>
              </div>

              <div className="bg-blue-50 rounded-xl p-4 space-y-2 text-sm">
                <h3 className="font-semibold text-blue-900">Estimación de retorno</h3>
                <div className="flex justify-between"><span className="text-gray-600">Capital</span><span className="font-medium">{formatCurrency(amount)}</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Interés bruto</span><span className="font-medium text-green-700">+{formatCurrency(interest.gross)}</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Retención IRPF (19%)</span><span className="font-medium text-red-600">-{formatCurrency(interest.withholding)}</span></div>
                <div className="flex justify-between border-t border-blue-200 pt-2"><span className="font-bold text-blue-900">Total neto estimado</span><span className="font-bold text-blue-900">{formatCurrency(amount + interest.net)}</span></div>
                <p className="text-xs text-gray-400">* Estimación basada en {annualRate}% anual · {durationMonths} meses. El resultado real puede variar.</p>
              </div>

              <Button className="w-full" onClick={() => setStep("contract")} disabled={amount < minInvestment || amount > maxAmount}>
                Ver contrato
              </Button>
            </div>
          )}

          {step === "contract" && (
            <div className="space-y-5">
              <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-700 max-h-64 overflow-y-auto space-y-3">
                <h3 className="font-bold text-gray-900">Contrato de Préstamo Participativo</h3>
                <p>El presente contrato regula la relación entre el inversor y la empresa para el proyecto <strong>{projectName}</strong>.</p>
                <p><strong>Importe:</strong> {formatCurrency(amount)}</p>
                <p><strong>Interés anual:</strong> {annualRate}%</p>
                <p><strong>Duración estimada:</strong> {durationMonths} meses</p>
                <p><strong>Interés bruto estimado:</strong> {formatCurrency(interest.gross)}</p>
                <p><strong>Retención IRPF (19%):</strong> {formatCurrency(interest.withholding)}</p>
                <p><strong>Interés neto estimado:</strong> {formatCurrency(interest.net)}</p>
                <p className="text-xs text-gray-500">La empresa se compromete a devolver el capital más los intereses generados al finalizar el proyecto. Los rendimientos están sujetos a retención fiscal según la normativa española vigente. El inversor asume los riesgos inherentes a la inversión inmobiliaria.</p>
              </div>

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={accepted}
                  onChange={(e) => setAccepted(e.target.checked)}
                  className="mt-0.5 h-4 w-4"
                />
                <span className="text-sm text-gray-700">
                  He leído y acepto los términos del contrato y la política de privacidad.
                </span>
              </label>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep("amount")} className="flex-1">Atrás</Button>
                <Button onClick={() => setStep("sign")} disabled={!accepted} className="flex-1">Firmar</Button>
              </div>
            </div>
          )}

          {step === "sign" && (
            <div className="space-y-5">
              <p className="text-sm text-gray-600">Firma con tu dedo o ratón en el área de abajo:</p>
              <div className="border-2 border-gray-300 rounded-xl overflow-hidden">
                <SignatureCanvas
                  ref={sigRef}
                  canvasProps={{ className: "w-full", height: 200, style: { background: "#f9fafb" } }}
                />
              </div>
              <button type="button" onClick={() => sigRef.current?.clear()} className="text-sm text-gray-400 hover:text-gray-600 underline">
                Borrar firma
              </button>

              {error && <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg">{error}</div>}

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep("contract")} className="flex-1">Atrás</Button>
                <Button onClick={handleInvest} loading={loading} className="flex-1">Confirmar inversión</Button>
              </div>
            </div>
          )}

          {step === "success" && (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900">¡Inversión enviada!</h3>
              <p className="text-gray-600 text-sm">Tu inversión de {formatCurrency(amount)} está pendiente de aprobación por el administrador. Recibirás un email cuando sea aprobada.</p>
              <Button onClick={() => { setOpen(false); router.push("/dashboard/portfolio"); router.refresh(); }}>
                Ver mi portfolio
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
