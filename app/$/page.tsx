// src/components/errors/NotFoundEnergyPage.tsx

import Link from "next/link"; // Atau 'react-router-dom' jika Anda menggunakan CRA
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"; // Sesuaikan path jika berbeda
import { Button } from "@/components/ui/button";
import { Home, Map, TreePine, ZapOff } from "lucide-react";

/**
 * Komponen untuk halaman 404 dengan tema manajemen energi,
 * terinspirasi dari petualangan mencari sumber energi baru di hutan.
 */
export default function NotFoundEnergyPage() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md transform-gpu animate-fade-in-down">
        <CardHeader className="items-center text-center">
          {/* Visualisasi Tema: Ikon yang menceritakan kisah */}
          <div className="mb-4 flex items-center justify-center space-x-4 text-primary">
            <TreePine size={48} strokeWidth={1.5} />
            <div className="flex flex-col items-center">
              <ZapOff size={64} strokeWidth={1.5} />
              <Map
                size={32}
                strokeWidth={1.5}
                className="-mt-2 text-muted-foreground"
              />
            </div>
            <TreePine size={48} strokeWidth={1.5} />
          </div>

          <CardTitle className="text-3xl font-bold tracking-tight">
            Energi Tidak Ditemukan
          </CardTitle>
          <CardDescription className="pt-2 text-lg">
            Kesalahan 404: Jalur Terputus
          </CardDescription>
        </CardHeader>

        <CardContent className="text-center text-muted-foreground">
          <p>
            Sepertinya Anda tersesat di hutan belantara digital. Sama seperti
            Sir Miles Axlerod, Anda sedang berpetualang mencari sumber energi
            baru, namun halaman yang Anda tuju sepertinya kehabisan daya atau
            tidak pernah ada.
          </p>
        </CardContent>

        <CardFooter>
          <Button asChild className="w-full">
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              Kembali ke Jaringan Utama
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
