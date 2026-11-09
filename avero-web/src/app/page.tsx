import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="avero-gradient flex flex-1 flex-col items-center justify-center gap-6 px-6 py-16 text-center">
      <h1 className="font-serif text-5xl font-semibold tracking-tight text-foreground sm:text-7xl">
        Avero
      </h1>
      <Button className="h-11 px-6 text-base">Explore local spots</Button>
      <span className="inline-flex items-center rounded-full bg-amber px-3 py-1 text-sm font-medium text-teal-navy">
        Smart local picks
      </span>
    </main>
  );
}
