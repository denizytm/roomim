"use client";

import { useActionState, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import { createListingAction } from "@/features/listings/actions";
import {
  CategorizedPhotoUploader,
  type CategorizedPhoto,
} from "@/features/listings/categorized-photo-uploader";
import {
  GENDER_PREFERENCE_OPTIONS,
  LISTING_FEATURES,
  PHOTO_CATEGORIES,
} from "@/lib/constants";
import { CITIES, districtsFor } from "@/lib/data/locations";
import { listingFormSchema, validateCategorizedPhotos } from "@/lib/validation/listing";
import { cn } from "@/lib/utils";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-border bg-card p-5 sm:p-6">
      <h2 className="mb-4 font-semibold">{title}</h2>
      {children}
    </section>
  );
}

const INITIAL = {
  title: "",
  description: "",
  neighborhood: "",
  capacity: "3",
  occupied: "0",
  totalRooms: "",
  bathroomCount: "",
  monthlyRent: "",
  dues: "",
  deposit: "",
  availableFrom: "",
  genderPreference: "any",
};

export function ListingForm({ userId }: { userId: string }) {
  const [state, formAction, pending] = useActionState(createListingAction, null);
  const [photos, setPhotos] = useState<CategorizedPhoto[]>([]);
  const [f, setF] = useState(INITIAL);
  const [city, setCity] = useState("");
  const [district, setDistrict] = useState("");
  const [checks, setChecks] = useState({
    furnished: false,
    petsAllowed: false,
    billsIncluded: false,
  });
  const [features, setFeatures] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (state?.error) toast.error(state.error);
  }, [state]);

  // Bir alanı güncelle ve o alandaki hatayı temizle (kullanıcı düzeltmeye başladı).
  function set(key: keyof typeof INITIAL, value: string) {
    setF((prev) => ({ ...prev, [key]: value }));
    clearError(key);
  }
  function clearError(key: string) {
    setErrors((prev) => {
      if (!prev[key]) return prev;
      const n = { ...prev };
      delete n[key];
      return n;
    });
  }

  const allCategories = PHOTO_CATEGORIES.every((c) =>
    photos.some((p) => p.category === c.key),
  );

  function toggleFeature(value: string) {
    setFeatures((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value],
    );
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    const photoErr = validateCategorizedPhotos(photos);
    if (photoErr) {
      toast.error(photoErr);
      return;
    }

    const parsed = listingFormSchema.safeParse({
      title: f.title,
      description: f.description,
      monthlyRent: f.monthlyRent,
      deposit: f.deposit === "" ? undefined : f.deposit,
      dues: f.dues === "" ? undefined : f.dues,
      billsIncluded: checks.billsIncluded,
      capacity: f.capacity,
      occupied: f.occupied === "" ? 0 : f.occupied,
      totalRooms: f.totalRooms === "" ? undefined : f.totalRooms,
      bathroomCount: f.bathroomCount === "" ? undefined : f.bathroomCount,
      availableFrom: f.availableFrom,
      city,
      district,
      neighborhood: f.neighborhood,
      petsAllowed: checks.petsAllowed,
      furnished: checks.furnished,
      genderPreference: f.genderPreference,
      features,
    });

    if (!parsed.success) {
      const errs: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0] ?? "");
        if (key && !errs[key]) errs[key] = issue.message;
      }
      setErrors(errs);
      // Sadece hatalı alanları sıfırla; geçerli girdiler korunur.
      setF((prev) => {
        const n = { ...prev };
        for (const key of Object.keys(errs)) {
          if (key in n) n[key as keyof typeof INITIAL] = "";
        }
        return n;
      });
      if (errs.city) setCity("");
      if (errs.district) setDistrict("");
      toast.error("Kırmızı ile işaretli alanları düzelt.");
      return;
    }

    setErrors({});
    const d = parsed.data;
    const fd = new FormData();
    fd.set("photos", JSON.stringify(photos));
    fd.set("title", d.title);
    fd.set("description", d.description ?? "");
    fd.set("monthlyRent", String(d.monthlyRent));
    if (d.dues != null) fd.set("dues", String(d.dues));
    if (d.deposit != null) fd.set("deposit", String(d.deposit));
    if (d.billsIncluded) fd.set("billsIncluded", "true");
    fd.set("capacity", String(d.capacity));
    fd.set("occupied", String(d.occupied));
    if (d.totalRooms != null) fd.set("totalRooms", String(d.totalRooms));
    if (d.bathroomCount != null) fd.set("bathroomCount", String(d.bathroomCount));
    if (d.availableFrom) fd.set("availableFrom", d.availableFrom);
    fd.set("city", d.city);
    fd.set("district", d.district);
    if (d.neighborhood) fd.set("neighborhood", d.neighborhood);
    if (d.petsAllowed) fd.set("petsAllowed", "true");
    if (d.furnished) fd.set("furnished", "true");
    fd.set("genderPreference", d.genderPreference);
    for (const ft of d.features) fd.append("features", ft);
    formAction(fd);
  }

  const errCls = (key: string) =>
    errors[key] ? "border-destructive focus-visible:ring-destructive/30" : "";

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <Section title="Fotoğraflar">
        <CategorizedPhotoUploader userId={userId} value={photos} onChange={setPhotos} />
      </Section>

      <Section title="Temel bilgiler">
        <div className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="title">Başlık</Label>
            <Input
              id="title"
              value={f.title}
              onChange={(e) => set("title", e.target.value)}
              aria-invalid={!!errors.title}
              className={errCls("title")}
              placeholder="ODTÜ'ye yürüme mesafesinde, 3 kişilik evde 1 oda"
            />
            {errors.title && <p className="text-xs text-destructive">{errors.title}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Açıklama</Label>
            <Textarea
              id="description"
              value={f.description}
              onChange={(e) => set("description", e.target.value)}
              aria-invalid={!!errors.description}
              className={errCls("description")}
              rows={4}
              placeholder="Ev, ortak alanlar, mahalle ve aradığın ev arkadaşı hakkında bilgi ver."
            />
            {errors.description && (
              <p className="text-xs text-destructive">{errors.description}</p>
            )}
          </div>
        </div>
      </Section>

      <Section title="Konum">
        <div className="grid gap-5 sm:grid-cols-3">
          <div className="space-y-2">
            <Label>Şehir</Label>
            <NativeSelect
              value={city}
              aria-invalid={!!errors.city}
              className={errCls("city")}
              onChange={(e) => {
                setCity(e.target.value);
                setDistrict("");
                clearError("city");
              }}
            >
              <option value="" disabled>
                Seç
              </option>
              {CITIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </NativeSelect>
            {errors.city && <p className="text-xs text-destructive">{errors.city}</p>}
          </div>
          <div className="space-y-2">
            <Label>İlçe</Label>
            <NativeSelect
              disabled={!city}
              value={district}
              aria-invalid={!!errors.district}
              className={errCls("district")}
              onChange={(e) => {
                setDistrict(e.target.value);
                clearError("district");
              }}
            >
              <option value="" disabled>
                Seç
              </option>
              {districtsFor(city).map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </NativeSelect>
            {errors.district && <p className="text-xs text-destructive">{errors.district}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="neighborhood">Semt / Mahalle (opsiyonel)</Label>
            <Input
              id="neighborhood"
              value={f.neighborhood}
              onChange={(e) => set("neighborhood", e.target.value)}
              placeholder="Ör. Çayyolu"
            />
          </div>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          Gizlilik için yalnızca ilçe/semt ve yaklaşık bölge gösterilir; tam adres asla
          otomatik paylaşılmaz.
        </p>
      </Section>

      <Section title="Kapasite & oda">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-2">
            <Label htmlFor="capacity">Toplam kişi kapasitesi</Label>
            <Input
              id="capacity"
              inputMode="numeric"
              value={f.capacity}
              onChange={(e) => set("capacity", e.target.value)}
              aria-invalid={!!errors.capacity}
              className={errCls("capacity")}
            />
            {errors.capacity && <p className="text-xs text-destructive">{errors.capacity}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="occupied">Evde yaşayan kişi sayısı</Label>
            <Input
              id="occupied"
              inputMode="numeric"
              value={f.occupied}
              onChange={(e) => set("occupied", e.target.value)}
              aria-invalid={!!errors.occupied}
              className={errCls("occupied")}
            />
            {errors.occupied && <p className="text-xs text-destructive">{errors.occupied}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="totalRooms">Oda sayısı</Label>
            <Input
              id="totalRooms"
              inputMode="numeric"
              value={f.totalRooms}
              onChange={(e) => set("totalRooms", e.target.value)}
              aria-invalid={!!errors.totalRooms}
              className={errCls("totalRooms")}
              placeholder="Ör. 3"
            />
            {errors.totalRooms && (
              <p className="text-xs text-destructive">{errors.totalRooms}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="bathroomCount">Banyo / tuvalet</Label>
            <Input
              id="bathroomCount"
              inputMode="numeric"
              value={f.bathroomCount}
              onChange={(e) => set("bathroomCount", e.target.value)}
              aria-invalid={!!errors.bathroomCount}
              className={errCls("bathroomCount")}
              placeholder="Ör. 1"
            />
            {errors.bathroomCount && (
              <p className="text-xs text-destructive">{errors.bathroomCount}</p>
            )}
          </div>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          Müsait kişi = kapasite − evde yaşayan. Kartlarda kişi ikonlarıyla gösterilir.
        </p>
      </Section>

      <Section title="Fiyat & detaylar">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="monthlyRent">Aylık kira (₺)</Label>
            <Input
              id="monthlyRent"
              inputMode="numeric"
              value={f.monthlyRent}
              onChange={(e) => set("monthlyRent", e.target.value)}
              aria-invalid={!!errors.monthlyRent}
              className={errCls("monthlyRent")}
            />
            {errors.monthlyRent && (
              <p className="text-xs text-destructive">{errors.monthlyRent}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="dues">Aidat (₺/ay, opsiyonel)</Label>
            <Input
              id="dues"
              inputMode="numeric"
              value={f.dues}
              onChange={(e) => set("dues", e.target.value)}
              aria-invalid={!!errors.dues}
              className={errCls("dues")}
            />
            {errors.dues && <p className="text-xs text-destructive">{errors.dues}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="deposit">Depozito (₺, opsiyonel)</Label>
            <Input
              id="deposit"
              inputMode="numeric"
              value={f.deposit}
              onChange={(e) => set("deposit", e.target.value)}
              aria-invalid={!!errors.deposit}
              className={errCls("deposit")}
            />
            {errors.deposit && <p className="text-xs text-destructive">{errors.deposit}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="availableFrom">Müsait tarih (opsiyonel)</Label>
            <Input
              id="availableFrom"
              type="date"
              value={f.availableFrom}
              onChange={(e) => set("availableFrom", e.target.value)}
              aria-invalid={!!errors.availableFrom}
              className={errCls("availableFrom")}
            />
            {errors.availableFrom && (
              <p className="text-xs text-destructive">{errors.availableFrom}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label>Cinsiyet tercihi</Label>
            <NativeSelect
              value={f.genderPreference}
              onChange={(e) => set("genderPreference", e.target.value)}
            >
              {GENDER_PREFERENCE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </NativeSelect>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {(
            [
              { name: "furnished", label: "Eşyalı" },
              { name: "petsAllowed", label: "Evcil hayvan kabul" },
              { name: "billsIncluded", label: "Faturalar dahil" },
            ] as const
          ).map((t) => (
            <label
              key={t.name}
              className="flex cursor-pointer items-center gap-2 rounded-full border border-border px-3.5 py-2 text-sm transition-colors has-checked:border-primary has-checked:bg-primary/5 has-checked:text-primary"
            >
              <input
                type="checkbox"
                checked={checks[t.name]}
                onChange={(e) => setChecks((c) => ({ ...c, [t.name]: e.target.checked }))}
                className="size-4 accent-primary"
              />
              {t.label}
            </label>
          ))}
        </div>
      </Section>

      <Section title="Özellikler">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {LISTING_FEATURES.map((ft) => (
            <label
              key={ft.value}
              className="flex cursor-pointer items-center gap-2 rounded-xl border border-border px-3 py-2.5 text-sm transition-colors has-checked:border-primary has-checked:bg-primary/5 has-checked:text-primary"
            >
              <input
                type="checkbox"
                checked={features.includes(ft.value)}
                onChange={() => toggleFeature(ft.value)}
                className="size-4 accent-primary"
              />
              {ft.label}
            </label>
          ))}
        </div>
      </Section>

      <div className="flex flex-col items-end gap-2">
        {!allCategories && (
          <p className="text-sm text-muted-foreground">
            Her fotoğraf kategorisine (oda, banyo, mutfak, ortak alan) en az 1 foto ekle.
          </p>
        )}
        {Object.keys(errors).length > 0 && (
          <p className={cn("text-sm text-destructive")}>
            Bazı alanlar hatalı — kırmızı ile işaretlenenleri düzelt.
          </p>
        )}
        <Button type="submit" size="lg" disabled={pending || !allCategories}>
          {pending && <Loader2 className="animate-spin" />}
          İlanı yayınla
        </Button>
      </div>
    </form>
  );
}
