import { desc, inArray } from "drizzle-orm";
import Link from "next/link";
import { AutoRefresh, OrderStatusSelect } from "@/components/admin/controls";
import { db } from "@/db";
import { orderItems, orders } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { formatTime, rupiah } from "@/lib/format";
import { STATUS_COLOR, STATUS_LABEL } from "@/lib/order-status";

export const dynamic = "force-dynamic";

const ACTIVE = ["PENDING", "PROCESSING", "READY"] as const;

export default async function AdminOrdersPage({ searchParams }: { searchParams: Promise<{ filter?: string }> }) {
  await requireAdmin();
  const showAll = (await searchParams).filter === "all";

  const list = await db
    .select()
    .from(orders)
    .where(showAll ? undefined : inArray(orders.status, [...ACTIVE]))
    .orderBy(desc(orders.id))
    .limit(100);

  const items = list.length
    ? await db.select().from(orderItems).where(inArray(orderItems.orderId, list.map((o) => o.id)))
    : [];

  const tab = (active: boolean) =>
    `rounded-full px-4 py-1.5 text-sm font-medium ${active ? "bg-amber-900 text-white" : "bg-white text-stone-600 hover:bg-stone-100"}`;

  return (
    <div>
      <AutoRefresh seconds={15} />
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Pesanan</h1>
        <div className="flex gap-2">
          <Link href="/admin" className={tab(!showAll)}>
            Aktif
          </Link>
          <Link href="/admin?filter=all" className={tab(showAll)}>
            Semua
          </Link>
        </div>
      </div>

      {list.length === 0 ? (
        <p className="rounded-2xl bg-white p-10 text-center text-stone-500 shadow-sm">Belum ada pesanan.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {list.map((o) => (
            <article key={o.id} className="rounded-2xl bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-lg font-bold">
                    #{o.id} · {o.location}
                  </p>
                  <p className="text-sm text-stone-500">
                    {o.customerName} · {formatTime(o.createdAt)}
                  </p>
                  <p className="text-sm text-stone-500">🧑‍🍳 Barista: {o.baristaName ?? "siapa saja"}</p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${STATUS_COLOR[o.status]}`}>
                  {STATUS_LABEL[o.status]}
                </span>
              </div>

              <ul className="my-4 space-y-1 text-sm">
                {items
                  .filter((i) => i.orderId === o.id)
                  .map((i) => (
                    <li key={i.id} className="flex justify-between">
                      <span>
                        {i.quantity}× {i.productName}
                      </span>
                      <span className="tabular-nums text-stone-600">{rupiah(i.price * i.quantity)}</span>
                    </li>
                  ))}
              </ul>
              {o.note && <p className="mb-4 rounded-lg bg-amber-50 px-3 py-2 text-sm">📝 {o.note}</p>}

              <div className="flex items-center justify-between border-t border-stone-100 pt-3">
                <span className="font-bold tabular-nums">{rupiah(o.total)}</span>
                <OrderStatusSelect id={o.id} status={o.status} />
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
