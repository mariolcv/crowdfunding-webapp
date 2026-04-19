import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const metadata = { title: "Proyectos de inversión" };

export default async function ProjectsPage() {
  const projects = await prisma.project.findMany({
    where: { status: { not: "DRAFT" } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <>
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Proyectos de inversión</h1>
        {projects.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p className="text-lg">Próximamente tendremos proyectos disponibles.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((p) => <ProjectCard key={p.id} project={p} />)}
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
