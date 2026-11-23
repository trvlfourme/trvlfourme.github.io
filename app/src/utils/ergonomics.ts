import { CalculatedErgonomics, ErgonomicsProfile, SchoolHeightGroup } from '../types';

/**
 * Группы роста школьной мебели: стол — ГОСТ 35278-2025 (табл. 2) и СанПиН 1.2.3685-21
 * (табл. 6.2), сиденье — ГОСТ 11016-2024 (табл. 2). Рост и высоты — без обуви.
 * Верхняя граница группы входит в неё: 115 см — ещё первая группа, 116 — уже вторая.
 */
export const SCHOOL_HEIGHT_GROUPS: SchoolHeightGroup[] = [
  { minHeightCm: 100, maxHeightCm: 115, deskHeightCm: 46, seatHeightCm: 26 },
  { minHeightCm: 115, maxHeightCm: 130, deskHeightCm: 52, seatHeightCm: 30 },
  { minHeightCm: 130, maxHeightCm: 145, deskHeightCm: 58, seatHeightCm: 34 },
  { minHeightCm: 145, maxHeightCm: 160, deskHeightCm: 64, seatHeightCm: 38 },
  { minHeightCm: 160, maxHeightCm: 175, deskHeightCm: 70, seatHeightCm: 42 }
];

export function findSchoolHeightGroup(heightCm: number): SchoolHeightGroup | null {
  return SCHOOL_HEIGHT_GROUPS.find(g => heightCm > g.minHeightCm && heightCm <= g.maxHeightCm) || null;
}

/**
 * Calculates ergonomic measurements based on human body height
 * in accordance with ISO 9241-5 and GOST 13025.3 ergonomic standards.
 * Для школьного режима высоты стола и сиденья берутся из нормативов ученической
 * мебели по группе роста, а не из взрослых коэффициентов.
 */
export function calculateErgonomics(profile: ErgonomicsProfile): CalculatedErgonomics {
  const { heightCm, shoeSoleCm = 2, monitorDiagonalInch = 27, hasNeckPain, hasLowerBackPain } = profile;
  const schoolGroup = profile.audience === 'child' ? findSchoolHeightGroup(heightCm) : null;

  // Popliteal height + sole thickness: ~0.255 of total height
  const seatHeightCm = schoolGroup ? schoolGroup.seatHeightCm : Math.round(heightCm * 0.255 + shoeSoleCm);

  // Elbow height sitting (from seat surface): ~0.15 of total height
  // Total desk height sitting = seat height + elbow height
  const deskSitHeightCm = schoolGroup ? schoolGroup.deskHeightCm : Math.round(seatHeightCm + (heightCm * 0.155));

  // Elbow height standing: ~0.62 of total height + sole
  const adultDeskStandHeightCm = Math.round(heightCm * 0.62 + shoeSoleCm);
  const deskStandHeightCm = schoolGroup ? null : adultDeskStandHeightCm;

  // Eye level sitting = seat height + (heightCm * 0.44)
  const eyeLevelSittingCm = Math.round(seatHeightCm + (heightCm * 0.44));

  // The top edge of the monitor should be at or slightly below eye level (0 to 3 cm lower)
  const monitorTopEdgeHeightCm = eyeLevelSittingCm - 2;

  // Eye to screen distance: optimal is 50-70 cm, or roughly diagonal * 1.5 in cm
  const idealDistanceCm = Math.round(Math.max(55, Math.min(85, monitorDiagonalInch * 2.3)));

  // Armrest height should match desk height sitting minus seat height
  const armrestHeightCm = deskSitHeightCm - seatHeightCm;

  const recommendations: string[] = [];

  if (schoolGroup) {
    recommendations.push(
      `Школьная мебель группы роста ${schoolGroup.minHeightCm}–${schoolGroup.maxHeightCm} см: стол ${schoolGroup.deskHeightCm} см, стул ${schoolGroup.seatHeightCm} см. Это нормативы ученической мебели (СанПиН 1.2.3685-21, ГОСТ 35278-2025, ГОСТ 11016-2024), а не расчёт по взрослой формуле.`
    );
    recommendations.push(
      `Стопы ребёнка должны полностью стоять на полу, колени — под прямым углом, бёдра параллельны полу. Взрослый стол 75 см для роста ${heightCm} см высок на ${75 - deskSitHeightCm} см: если другого стола нет, поднимите стул и поставьте подставку для ног.`
    );
  }

  if (hasNeckPain) {
    recommendations.push(
      '⚠️ При болях в шее: поднимите верхнюю грань монитора строго на уровень глаз с помощью кронштейна (ONKRON G80). Наклон монитора назад на 10–15° снижает напряжение мышц затылка.'
    );
  }

  if (hasLowerBackPain) {
    recommendations.push(
      '⚠️ При болях в пояснице: используйте кресло с подвижной поясничной опорой (SIHOO Doro C300 или Metta Samurai). Угол между бедрами и туловищем должен быть не 90°, а около 100–110° для снятия компрессии с L4-L5.'
    );
  }

  if (!schoolGroup && deskSitHeightCm > 76 && heightCm < 172) {
    recommendations.push(
      '💡 Стандартные столы в РФ имеют фиксированную высоту 75 см. Для вашего роста нужен стол высотой ' +
      deskSitHeightCm +
      ' см. Чтобы плечи не задирались вверх, поднимите кресло и обязательно поставьте подставку под ноги!'
    );
  }

  if (!schoolGroup) {
    recommendations.push(
      `Правило 40/20: работайте сидя 40 минут (высота стола ${deskSitHeightCm} см), затем 20 минут стоя (высота ${adultDeskStandHeightCm} см). Это предотвращает застой венозной крови в малом тазу.`
    );
  }

  return {
    seatHeightCm,
    deskSitHeightCm,
    deskStandHeightCm,
    monitorTopEdgeHeightCm,
    eyeToScreenDistanceCm: idealDistanceCm,
    armrestHeightCm,
    schoolGroup,
    footrestNeeded: !schoolGroup && heightCm < 170 && deskSitHeightCm < 74,
    idealAngleElbows: '90° – 105°',
    recommendations
  };
}
