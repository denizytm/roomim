"use client";

import Link from "next/link";
import { Heart, House, List, Menu, ShieldCheck, UserRound } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Dar ekranlarda header'a sığmayan gezinme bağlantıları (İlanlar, İlanlarım vb.)
// için açılır menü. Yalnızca mobil viewport'ta görünür (sm:hidden).
export function HeaderMenu({
  role,
  isAdmin,
}: {
  role: string | null;
  isAdmin: boolean;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="ghost" size="icon-sm" aria-label="Menü" className="sm:hidden" />
        }
      >
        <Menu />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuItem render={<Link href="/listings" />}>
          <List /> İlanlar
        </DropdownMenuItem>
        <DropdownMenuItem render={<Link href="/listings/mine" />}>
          <House /> İlanlarım
        </DropdownMenuItem>
        {role === "seeker" && (
          <DropdownMenuItem render={<Link href="/liked" />}>
            <Heart /> Beğendiklerim
          </DropdownMenuItem>
        )}
        <DropdownMenuItem render={<Link href="/profile" />}>
          <UserRound /> Profil
        </DropdownMenuItem>
        {isAdmin && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem render={<Link href="/moderation" />} className="text-primary">
              <ShieldCheck /> Moderasyon
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
