export const dynamic = "force-dynamic";

import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { CookieBanner } from "@/components/CookieBanner";
import { prisma } from "@/lib/prisma";
import { TrendingUp, Shield, Clock, Users, ChevronRight, CheckCircle } from "lucide-react";

async function getFeaturedProject() {
  return prisma.project.findFirst({
    where: { status: { not: "DRAFT" } },
    orderBy: { createdAt: "desc" },
  });
}

export default async function HomePage() {
  const project = await getFeaturedProject();

  return (
    <>
      <Navbar />
      <main>
        {/* Hero */}
        <section className="bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
            <div className="max-w-3xl">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
                Invierte en inmuebles con rentabilidades del{" "}
                <span className="text-yellow-400">12% anual</span>
              </h1>
              <p className="text-xl text-blue-100 mb-8 leading-relaxed">
                Participa en proyectos de compra-reforma-venta con capital desde 100€.
                Sin bancos, sin intermediarios, sin complicaciones.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/proyectos">
                  <Button size="lg" className="bg-yellow-400 text-blue-900 hover:bg-yellow-500 font-bold">
                    Ver proyectos <ChevronRight className="ml-1 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/como-funciona">
                  <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                    Cómo funciona
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { label: "Rentabilidad media", value: "12% anual" },
                { label: "Inversión mínima", value: "100€" },
                { label: "Proyectos activos", value: "1" },
                { label: "Proceso verificado", value: "KYC incluido" },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <p className="text-2xl font-bold text-blue-800">{stat.value}</p>
                  <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
              ¿Por qué invertir con nosotros?
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { icon: TrendingUp, title: "Alta rentabilidad", desc: "Rentabilidades históricas del 10-15% anual en proyectos CRV seleccionados." },
                { icon: Shield, title: "Respaldo inmobiliario", desc: "Cada inversión está respaldada por un activo inmobiliario real y valorado." },
                { icon: Clock, title: "Plazos cortos", desc: "Proyectos de 6 a 18 meses. Recupera tu capital antes que en la bolsa." },
                { icon: Users, title: "Totalmente transparente", desc: "Seguimiento en tiempo real del proyecto, actualizaciones y documentación." },
              ].map(({ icon: Icon, title, desc }) => (
                <div key={title} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                    <Icon className="h-6 w-6 text-blue-800" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
                  <p className="text-sm text-gray-600">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Project */}
        {project && (
          <section className="py-20 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-bold text-gray-900">Proyecto actual</h2>
                <Link href="/proyectos" className="text-blue-800 hover:underline text-sm font-medium flex items-center gap-1">
                  Ver todos <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
              <div className="max-w-lg">
                <ProjectCard project={project} />
              </div>
            </div>
          </section>
        )}

        {/* How it works */}
        <section className="py-20 bg-blue-900 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center mb-12">Cómo funciona</h2>
            <div className="grid md:grid-cols-4 gap-8">
              {[
                { step: "1", title: "Regístrate", desc: "Crea tu cuenta y completa el proceso de verificación KYC." },
                { step: "2", title: "Deposita fondos", desc: "Transfiere desde tu banco a nuestra cuenta con tu referencia única." },
                { step: "3", title: "Invierte", desc: "Elige el proyecto y el importe. Firma el contrato digitalmente." },
                { step: "4", title: "Recibe retornos", desc: "Al finalizar el proyecto, recuperas capital + intereses netos." },
              ].map(({ step, title, desc }) => (
                <div key={step} className="text-center">
                  <div className="w-12 h-12 bg-yellow-400 text-blue-900 rounded-full flex items-center justify-center font-bold text-lg mx-auto mb-4">
                    {step}
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{title}</h3>
                  <p className="text-blue-200 text-sm">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 bg-white">
          <div className="max-w-2xl mx-auto text-center px-4">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">¿Listo para invertir?</h2>
            <p className="text-gray-600 mb-8">Únete a la plataforma de inversión inmobiliaria más transparente.</p>
            <div className="flex gap-4 justify-center">
              <Link href="/registro"><Button size="lg">Crear cuenta gratuita</Button></Link>
              <Link href="/proyectos"><Button size="lg" variant="outline">Ver proyectos</Button></Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <CookieBanner />
    </>
  );
}
