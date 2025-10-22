import { NextRequest } from "next/server";
import { handleMethodWithId } from "@/feature/prospects/api/apiProspects";

type Params = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, context: Params) {
  const { id } = await context.params;
  return handleMethodWithId(req, id);
}
export async function PATCH(req: NextRequest, context: Params) {
  const { id } = await context.params;
  return handleMethodWithId(req, id);
}
export async function DELETE(req: NextRequest, context: Params) {
  const { id } = await context.params;
  return handleMethodWithId(req, id);
}
