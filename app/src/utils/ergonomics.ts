import { CalculatedErgonomics, ErgonomicsProfile } from '../types';

/**
 * Calculates ergonomic measurements based on human body height
 * in accordance with ISO 9241-5 and GOST 13025.3 ergonomic standards.
 */
export function calculateErgonomics(profile: ErgonomicsProfile): CalculatedErgonomics {
  const { heightCm, shoeSoleCm = 2, monitorDiagonalInch = 27, hasNeckPain, hasLowerBackPain } = profile;

  // Popliteal height + sole thickness: ~0.255 of total height
  const seatHeightCm = Math.round(heightCm * 0.255 + shoeSoleCm);

  // Elbow height sitting (from seat surface): ~0.15 of total height
  // Total desk height sitting = seat height + elbow height
  const deskSitHeightCm = Math.round(seatHeightCm + (heightCm * 0.155));

  // Elbow height standing: ~0.62 of total height + sole
  const deskStandHeightCm = Math.round(heightCm * 0.62 + shoeSoleCm);

  // Eye level sitting = seat height + (heightCm * 0.44)
  const eyeLevelSittingCm = Math.round(seatHeightCm + (heightCm * 0.44));

  // The top edge of the monitor should be at or slightly below eye level (0 to 3 cm lower)
  const monitorTopEdgeHeightCm = eyeLevelSittingCm - 2;

  // Eye to screen distance: optimal is 50-70 cm, or roughly diagonal * 1.5 in cm
  const idealDistanceCm = Math.round(Math.max(55, Math.min(85, monitorDiagonalInch * 2.3)));

  // Armrest height should match desk height sitting minus seat height
  const armrestHeightCm = deskSitHeightCm - seatHeightCm;

  const recommendations: string[] = [];

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

  if (deskSitHeightCm > 76 && heightCm < 172) {
    recommendations.push(
      '💡 Стандартные столы в РФ имеют фиксированную высоту 75 см. Для вашего роста нужен стол высотой ' +
      deskSitHeightCm +
      ' см. Чтобы плечи не задирались вверх, поднимите кресло и обязательно поставьте подставку под ноги!'
    );
  }

  recommendations.push(
    `Правило 40/20: работайте сидя 40 минут (высота стола ${deskSitHeightCm} см), затем 20 минут стоя (высота ${deskStandHeightCm} см). Это предотвращает застой венозной крови в малом тазу.`
  );

  return {
    seatHeightCm,
    deskSitHeightCm,
    deskStandHeightCm,
    monitorTopEdgeHeightCm,
    eyeToScreenDistanceCm: idealDistanceCm,
    armrestHeightCm,
    footrestNeeded: heightCm < 170 && deskSitHeightCm < 74,
    idealAngleElbows: '90° – 105°',
    recommendations
  };
}
