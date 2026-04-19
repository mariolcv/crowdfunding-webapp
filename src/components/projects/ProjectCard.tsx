import Link from "next/link";
import Image from "next/image";
import { ProjectStatusBadge } from "@/components/ui/Badge";
import { formatCurrency } from "@/lib/taxes";
import { MapPin, Clock, TrendingUp } from "lucide-react";
import type { Prisma } from "@prisma/client";
type Project = Prisma.ProjectGetPayload<Record<string, never>>;

interface ProjectCardProps {
  project: Pick<Project, "id" | "slug" | "name" | "description" | "location" | "images" | "fundingGoal" | "currentFunding" | "annualRate" | "durationMonths" | "status">;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const progress = Math.min(100, (Number(project.currentFunding) / Number(project.fundingGoal)) * 100);

  return (
    <Link href={`/proyectos/${project.slug}`} className="block group">
      <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
        <div className="relative h-48 bg-gray-200">
          {project.images[0] ? (
            <Image src={project.images[0]} alt={project.name} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400 text-sm">Sin imagen</div>
          )}
          <div className="absolute top-3 left-3">
            <ProjectStatusBadge status={project.status} />
          </div>
        </div>

        <div className="p-5">
          <h3 className="font-bold text-gray-900 text-lg mb-1 group-hover:text-blue-800 transition-colors">{project.name}</h3>
          {project.location && (
            <p className="text-sm text-gray-500 flex items-center gap-1 mb-3">
              <MapPin className="h-3.5 w-3.5" /> {project.location}
            </p>
          )}

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-500">Rentabilidad</p>
              <p className="font-bold text-green-700 flex items-center gap-1">
                <TrendingUp className="h-3.5 w-3.5" /> {Number(project.annualRate).toFixed(1)}% anual
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-500">Duración</p>
              <p className="font-bold text-gray-800 flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" /> {project.durationMonths} meses
              </p>
            </div>
          </div>

          <div className="mb-3">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>{formatCurrency(Number(project.currentFunding))} captados</span>
              <span>{formatCurrency(Number(project.fundingGoal))} objetivo</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-800 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">{progress.toFixed(0)}% financiado</p>
          </div>
        </div>
      </div>
    </Link>
  );
}
