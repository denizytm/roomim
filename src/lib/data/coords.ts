// Yaklaşık [lng, lat] koordinatlar — bölge bazlı (ilçe/şehir) harita için.
// Tam adres asla saklanmaz/gösterilmez; bunlar sadece genel bölge merkezleridir.

export const CITY_COORDS: Record<string, [number, number]> = {
  Ankara: [32.8597, 39.9334],
  İstanbul: [28.9784, 41.0082],
  İzmir: [27.1428, 38.4237],
  Eskişehir: [30.5206, 39.7767],
  Bursa: [29.061, 40.1826],
  Adana: [35.3213, 37.0],
  Antalya: [30.7133, 36.8969],
  Trabzon: [39.7168, 41.0027],
  Konya: [32.4846, 37.8714],
  Kayseri: [35.4787, 38.7312],
  Gaziantep: [37.3833, 37.0662],
  Erzurum: [41.2769, 39.9043],
  Samsun: [36.3361, 41.2867],
  Denizli: [29.0875, 37.7765],
};

export const DISTRICT_COORDS: Record<string, [number, number]> = {
  // Ankara
  Çankaya: [32.8625, 39.908],
  Yenimahalle: [32.7847, 39.973],
  Keçiören: [32.8636, 40.015],
  Mamak: [32.92, 39.93],
  Etimesgut: [32.668, 39.945],
  Sincan: [32.58, 39.967],
  Altındağ: [32.88, 39.95],
  Pursaklar: [32.9, 40.04],
  Gölbaşı: [32.8, 39.79],
  Çubuk: [33.03, 40.238],
  Polatlı: [32.147, 39.584],
  Elmadağ: [33.23, 39.92],
  // İstanbul
  Kadıköy: [29.03, 40.99],
  Beşiktaş: [29.007, 41.043],
  Şişli: [28.987, 41.06],
  Beyoğlu: [28.977, 41.036],
  Üsküdar: [29.015, 41.023],
  Maltepe: [29.131, 40.935],
  Kartal: [29.19, 40.906],
  Ataşehir: [29.127, 40.992],
  Bakırköy: [28.872, 40.982],
  Beylikdüzü: [28.641, 40.982],
  Esenyurt: [28.673, 41.034],
  Sarıyer: [29.057, 41.167],
  Fatih: [28.95, 41.019],
  Bahçelievler: [28.859, 41.0],
  Pendik: [29.233, 40.878],
  Ümraniye: [29.124, 41.016],
  // İzmir
  Konak: [27.13, 38.418],
  Bornova: [27.214, 38.47],
  Buca: [27.18, 38.386],
  Karşıyaka: [27.111, 38.461],
  Bayraklı: [27.167, 38.462],
  Gaziemir: [27.114, 38.32],
  Balçova: [27.049, 38.389],
  Narlıdere: [27.0, 38.392],
  Çiğli: [27.067, 38.497],
  Karabağlar: [27.11, 38.37],
};

export function coordsFor(
  city: string,
  district?: string | null,
): [number, number] | null {
  if (district && DISTRICT_COORDS[district]) return DISTRICT_COORDS[district];
  return CITY_COORDS[city] ?? null;
}
