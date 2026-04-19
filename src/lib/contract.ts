import { renderToBuffer } from "@react-pdf/renderer";
import { ContractDocument } from "@/components/pdf/ContractDocument";
import type { Prisma } from "@prisma/client";

type User = Prisma.UserGetPayload<Record<string, never>>;
type Project = Prisma.ProjectGetPayload<Record<string, never>>;

interface ContractData {
  user: User;
  project: Project;
  amount: number;
  signatureData: string;
}

export async function generateContractPdf(data: ContractData): Promise<Buffer> {
  const buffer = await renderToBuffer(
    ContractDocument({ data })
  );
  return Buffer.from(buffer);
}
