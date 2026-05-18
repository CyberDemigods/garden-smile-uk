import { WishlistView } from '@/components/wishlist/WishlistView'

export const metadata = { title: 'Wishlist' }

export default function WishlistPage() {
  return (
    <section className="max-w-6xl mx-auto px-6 py-12">
      <h1 className="font-serif text-4xl sm:text-5xl text-[rgb(var(--gs-leaf-deep))] mb-2">
        Wishlist
      </h1>
      <p className="text-[rgb(var(--gs-stone))] mb-10">
        Saved on this device. Sign-up coming later — keeps the list across browsers.
      </p>
      <WishlistView />
    </section>
  )
}
