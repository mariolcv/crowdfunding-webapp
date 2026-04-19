import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { formatCurrency, formatPercent } from "@/lib/taxes";
import { formatDate } from "@/lib/utils";
import { ProjectStatusBadge } from "@/components/ui/Badge";
import { InvestModal } from "@/components/projects/InvestModal";
import Image from "next/image";
import { MapPin, Clock, TrendingUp, FileText, Calendar, Users } from "lucide-react";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = await prisma.project.findUnique({ where: { slug }, select: { name: true, description: true } });
  return { title: project?.name, description: project?.description?.slice(0, 160) };
}

export default async function ProjectDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const session = await auth();
  const userId = session?.user?.id;

  const project = await prisma.project.findUnique({
    where: { slug },
    include: {
      updates: { orderBy: { publishedAt: "desc" }, take: 10 },
      _count: { select: { investments: { where: { status: "ACTIVE" } } } },
    },
  });

  if (!project || project.status === "DRAFT") notFound();

  const progress = Math.min(100, (Number(project.currentFunding) / Number(project.fundingGoal)) * 100);
  const remaining = Number(project.fundingGoal) - Number(project.currentFunding);

  // Check if user has invested (to show updates)
  let hasInvested = false;
  if (userId) {
    const inv = await prisma.investment.findFirst({ where: { userId, projectId: project.id, status: { in: ["ACTIVE", "COMPLETED"] } } });
    hasInvested = !!inv;
  }

  // Check user KYC for invest button
  let canInvest = false;
  let walletBalance = 0;
  if (userId) {
    const user = await prisma.user.findUnique({ where: { id: userId }, include: { wallet: true } });
    canInvest = user?.kycStatus === "APPROVED" && project.status === "OPEN_FOR_INVESTMENT";
    walletBalance = Number(user?.wallet?.balance || 0);
  }

  const docs = project.documents as Record<string, string> | null;

  return (
    <>
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Images */}
            <div className="rounded-2xl overflow-hidden bg-gray-200 aspect-video relative">
              {project.images[0] ? (
                <Image src={project.images[0]} alt={project.name} fill className="object-cover" priority />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">Sin imagen</div>
              )}
            </div>

            {/* Image gallery */}
            {project.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {project.images.slice(1, 5).map((img, i) => (
                  <div key={i} className="aspect-square rounded-lg overflow-hidden relative bg-gray-200">
                    <Image src={img} alt={`${project.name} ${i + 2}`} fill className="object-cover" />
                  </div>
                ))}
              </div>
            )}

            {/* Title and location */}
            <div>
              <div className="flex items-center gap-3 mb-2">
                <ProjectStatusBadge status={project.status} />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{project.name}</h1>
              {project.location && (
                <p className="flex items-center gap-2 text-gray-500">
                  <MapPin className="h-4 w-4" /> {project.location}
                </p>
              )}
            </div>

            {/* Description */}
            <div className="prose max-w-none text-gray-700">
              <h2 className="text-xl font-bold text-gray-900 mb-3">Sobre el proyecto</h2>
              <p className="whitespace-pre-wrap">{project.description}</p>
            </div>

            {/* Map */}
            {project.mapEmbed && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-3">Ubicación</h2>
                <div className="rounded-xl overflow-hidden h-64" dangerouslySetInnerHTML={{ __html: project.mapEmbed }} />
              </div>
            )}

            {/* Financial breakdown */}
            {project.financialBreakdown && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Desglose financiero</h2>
                <div className="space-y-2">
                  {(project.financialBreakdown as Array<{ concepto: string; importe: number }>).map((item, i) => (
                    <div key={i} className="flex justify-between py-2 border-b border-gray-100 last:border-0">
                      <span className="text-gray-700">{item.concepto}</span>
                      <span className="font-medium">{formatCurrency(item.importe)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Documents */}
            {docs && Object.keys(docs).length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">Documentación</h2>
                <div className="space-y-2">
                  {Object.entries(docs).map(([name, url]) => (
                    <a key={name} href={url} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                      <FileText className="h-5 w-5 text-blue-800" />
                      <span className="text-sm font-medium text-gray-900">{name}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Updates */}
            {(hasInvested || session?.user) && project.updates.length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">Actualizaciones del proyecto</h2>
                <div className="space-y-4">
                  {project.updates.map((update) => (
                    <div key={update.id} className="bg-white rounded-xl border border-gray-200 p-5">
                      <div className="flex items-center gap-2 text-gray-400 text-xs mb-2">
                        <Calendar className="h-3.5 w-3.5" />
                        {formatDate(update.publishedAt)}
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-2">{update.title}</h3>
                      <p className="text-gray-700 text-sm whitespace-pre-wrap">{update.content}</p>
                      {update.videoUrl && (
                        <div className="mt-4 aspect-video rounded-lg overflow-hidden">
                          <iframe src={update.videoUrl.replace("watch?v=", "embed/")} className="w-full h-full" allowFullScreen />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sticky top-20">
              <div className="space-y-4 mb-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500">Rentabilidad</p>
                    <p className="font-bold text-green-700 text-lg flex items-center gap-1">
                      <TrendingUp className="h-4 w-4" /> {formatPercent(Number(project.annualRate))}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Duración</p>
                    <p className="font-bold text-gray-900 text-lg flex items-center gap-1">
                      <Clock className="h-4 w-4" /> {project.durationMonths}m
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Objetivo</p>
                    <p className="font-bold text-gray-900">{formatCurrency(Number(project.fundingGoal))}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Inversores</p>
                    <p className="font-bold text-gray-900 flex items-center gap-1">
                      <Users className="h-4 w-4" /> {project._count.investments}
                    </p>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>{formatCurrency(Number(project.currentFunding))} captados</span>
                    <span>{progress.toFixed(0)}%</span>
                  </div>
                  <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-800 rounded-full" style={{ width: `${progress}%` }} />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{formatCurrency(remaining)} disponibles</p>
                </div>

                {project.openDate && (
                  <div className="text-xs text-gray-500 flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    Abierto desde {formatDate(project.openDate)}
                  </div>
                )}
              </div>

              {project.status === "OPEN_FOR_INVESTMENT" && (
                <>
                  {!session ? (
                    <a href="/login" className="block w-full bg-blue-800 text-white text-center py-3 rounded-lg font-medium hover:bg-blue-900 transition-colors">
                      Iniciar sesión para invertir
                    </a>
                  ) : !canInvest ? (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-800 text-center">
                      Completa tu verificación KYC para invertir
                    </div>
                  ) : (
                    <InvestModal
                      projectId={project.id}
                      projectName={project.name}
                      annualRate={Number(project.annualRate)}
                      durationMonths={project.durationMonths}
                      minInvestment={Number(project.minInvestment)}
                      maxAvailable={remaining}
                      walletBalance={walletBalance}
                    />
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
