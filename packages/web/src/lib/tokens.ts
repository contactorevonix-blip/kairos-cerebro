import { db } from "@/lib/db";
import { TransactionType } from "@prisma/client";

export async function getBalance(userId: string): Promise<number> {
  const bal = await db.tokenBalance.findUnique({ where: { userId } });
  return bal?.balance ?? 0;
}

export async function creditTokens(
  userId:      string,
  amount:      number,
  description: string,
  type:        TransactionType = TransactionType.GRANT,
  meta?:       Record<string, unknown>
): Promise<void> {
  await db.$transaction([
    db.tokenBalance.upsert({
      where:  { userId },
      update: { balance: { increment: amount }, lifetime: { increment: amount } },
      create: { userId, balance: amount, lifetime: amount },
    }),
    db.transaction.create({
      data: { userId, type, amount, description, meta },
    }),
  ]);
}

export async function consumeToken(
  userId:      string,
  description: string,
  meta?:       Record<string, unknown>
): Promise<{ ok: boolean; remaining: number }> {
  const bal = await db.tokenBalance.findUnique({ where: { userId } });
  if (!bal || bal.balance < 1) {
    return { ok: false, remaining: 0 };
  }

  await db.$transaction([
    db.tokenBalance.update({
      where:  { userId },
      data:   { balance: { decrement: 1 } },
    }),
    db.transaction.create({
      data: {
        userId,
        type:   TransactionType.CONSUME,
        amount: -1,
        description,
        meta,
      },
    }),
  ]);

  return { ok: true, remaining: bal.balance - 1 };
}

// ─── Daily free limit (anonymous or authenticated) ──────────────────────────

const FREE_CHAT_LIMIT  = 5;
const FREE_CHECK_LIMIT = 3;

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

export async function checkFreeLimit(
  key:  string,
  type: "chat" | "check"
): Promise<{ allowed: boolean; remaining: number; limit: number }> {
  const date  = todayStr();
  const limit = type === "chat" ? FREE_CHAT_LIMIT : FREE_CHECK_LIMIT;

  const usage = await db.dailyUsage.findUnique({
    where: { key_date: { key, date } },
  });

  const count = usage ? (type === "chat" ? usage.chatCount : usage.checkCount) : 0;
  return { allowed: count < limit, remaining: limit - count, limit };
}

export async function consumeFreeCredit(
  key:  string,
  type: "chat" | "check"
): Promise<void> {
  const date = todayStr();
  await db.dailyUsage.upsert({
    where:  { key_date: { key, date } },
    update: type === "chat"
      ? { chatCount:  { increment: 1 } }
      : { checkCount: { increment: 1 } },
    create: {
      key,
      date,
      chatCount:  type === "chat"  ? 1 : 0,
      checkCount: type === "check" ? 1 : 0,
    },
  });
}
