import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import DashboardClient from "./DashboardClient";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const userId = session.user.id;

  const [balance, transactions, subscription] = await Promise.all([
    db.tokenBalance.findUnique({ where: { userId } }),
    db.transaction.findMany({
      where:   { userId },
      orderBy: { createdAt: "desc" },
      take:    20,
    }),
    db.subscription.findFirst({
      where: { userId },
    }),
  ]);

  return (
    <DashboardClient
      user={{
        id:    session.user.id,
        name:  session.user.name  ?? null,
        email: session.user.email ?? "",
        image: session.user.image ?? null,
      }}
      balance={{
        current:  balance?.balance  ?? 0,
        lifetime: balance?.lifetime ?? 0,
      }}
      transactions={transactions.map((t) => ({
        id:          t.id,
        type:        t.type,
        amount:      t.amount,
        description: t.description,
        createdAt:   t.createdAt.toISOString(),
      }))}
      subscription={subscription
        ? {
            planId:           subscription.planId,
            status:           subscription.status,
            currentPeriodEnd: subscription.currentPeriodEnd?.toISOString() ?? null,
            cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
          }
        : null}
    />
  );
}
