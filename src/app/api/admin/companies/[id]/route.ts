import { NextRequest } from "next/server";
import { handleMethodWithId } from "@/feature/companies/api/apiCompanies";

type Params = { params: { id: string } };

export async function GET(req: NextRequest, context: Params) {
  return handleMethodWithId(req, context.params.id);
}
export async function PATCH(req: NextRequest, context: Params) {
  return handleMethodWithId(req, context.params.id);
}
export async function DELETE(req: NextRequest, context: Params) {
  return handleMethodWithId(req, context.params.id);
}
