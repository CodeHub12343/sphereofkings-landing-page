import { listAllCreationOrders, ensureCreationOrderIndexes } from "@/lib/db/collections/creation-orders";
import { ensureCreationIndexes, listByStatus } from "@/lib/db/collections/creation-designs";
import AdminQueue from "./AdminQueue";

export const dynamic = "force-dynamic";

export default async function AdminCreationStationPage() {
  await ensureCreationOrderIndexes();
  await ensureCreationIndexes();
  const orders = await listAllCreationOrders();
  const review = await listByStatus("needs-review", 50);
  return <AdminQueue orders={orders} review={review} />;
}
