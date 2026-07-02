export type BadgeInfo = {
  key: string;
  label: string;
  description: string;
  earned: boolean;
};

export function computeBadges(p: { created_at: string }): BadgeInfo[] {
  const ageDays = (Date.now() - new Date(p.created_at).getTime()) / 86_400_000;
  return [
    {
      key: "verified",
      label: "Doğrulanmış",
      description: "Edu mail ile doğrulandı",
      earned: true,
    },
    {
      key: "active",
      label: "Aktif Üye",
      description: "30+ gündür üye",
      earned: ageDays >= 30,
    },
  ];
}

export const POINT_RULES = [
  "Referansınla kayıt olan her kişi: +1 puan",
  "Başarılı eşleşme: +2 puan",
  "Aktif profil: her ay +1 puan",
];
