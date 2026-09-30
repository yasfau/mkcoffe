import Link from "next/link";

export const metadata = { title: "Pesanan Diterima · MK Coffee" };

export default async function SuccessPage({ searchParams }: { searchParams: Promise<{ id?: string }> }) {
  const { id } = await searchParams;

  return (
    <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
      <p className="text-6xl">✅</p>
      <h1 className="mt-4 text-2xl font-bold">Pesanan diterima!</h1>
      {id && (
        <p className="mt-2 text-stone-600">
          Nomor pesanan kamu: <span className="font-bold text-amber-900">#{id}</span>
        </p>
      )}
      <p className="mt-2 text-stone-600">Barista kami sedang menyiapkan pesananmu. Pesanan akan diantar ke lokasimu ☕</p>
      <Link
        href="/"
        className="mt-6 inline-block rounded-xl bg-amber-900 px-6 py-3 font-semibold text-white hover:bg-amber-950"
      >
        Pesan lagi
      </Link>
    </div>
  );
}
