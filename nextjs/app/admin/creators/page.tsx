import {
  ensureCreatorIndexes, listCreatorsByState,
} from "@/lib/db/collections/creators";
import {
  ensureAssignmentIndexes, listReviewQueue,
} from "@/lib/db/collections/creator-assignments";
import {
  ensureCreditIndexes, listAllRedemptions,
} from "@/lib/db/collections/creator-credits";
import AdminCommandCenter from "./AdminCommandCenter";

export const dynamic = "force-dynamic";

export default async function AdminCreatorsPage() {
  await Promise.all([ensureCreatorIndexes(), ensureAssignmentIndexes(), ensureCreditIndexes()]);
  const [pending, approved, review, redemptions] = await Promise.all([
    listCreatorsByState("pending"),
    listCreatorsByState("approved"),
    listReviewQueue(),
    listAllRedemptions(),
  ]);
  return <AdminCommandCenter pending={pending} approved={approved} review={review} redemptions={redemptions} />;
}
