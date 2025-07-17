/**
 * Utilitaires pour la gestion cohérente des dates dans l'application
 */

// ✅ Formater une date en string local (YYYY-MM-DD) sans problème de timezone
export function formatDateToLocal(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// ✅ Comparer deux dates (année, mois, jour) sans tenir compte de l'heure
export function isSameDate(date1: Date, date2: Date): boolean {
  return date1.getFullYear() === date2.getFullYear() &&
         date1.getMonth() === date2.getMonth() &&
         date1.getDate() === date2.getDate();
}

// ✅ Obtenir le début de la semaine (lundi) pour une date donnée
export function getStartOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Ajuster pour que lundi soit le premier jour
  return new Date(d.setDate(diff));
}

// ✅ Obtenir la fin de la semaine (dimanche) pour une date donnée
export function getEndOfWeek(date: Date): Date {
  const startOfWeek = getStartOfWeek(date);
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  return endOfWeek;
}

// ✅ Générer les plages de dates pour les semaines (actuelle et précédentes)
export function generateWeekRanges(numberOfWeeks: number = 4): Array<{
  label: string;
  startDate: Date;
  endDate: Date;
  value: string;
}> {
  const ranges = [];
  const today = new Date();

  for (let i = 0; i < numberOfWeeks; i++) {
    // ✅ Commencer par la semaine actuelle (i=0), puis remonter dans le temps
    const weekDate = new Date(today);
    weekDate.setDate(today.getDate() - (i * 7));

    const startOfWeek = getStartOfWeek(weekDate);
    const endOfWeek = getEndOfWeek(startOfWeek);

    // ✅ Format français pour l'affichage
    const startDay = startOfWeek.getDate();
    const startMonth = getMonthName(startOfWeek.getMonth());
    const endDay = endOfWeek.getDate();
    const endMonth = getMonthName(endOfWeek.getMonth());

    const label = startOfWeek.getMonth() === endOfWeek.getMonth()
      ? `Du ${startDay} au ${endDay} ${startMonth}`
      : `Du ${startDay} ${startMonth} au ${endDay} ${endMonth}`;

    const value = `${formatDateToLocal(startOfWeek)}_${formatDateToLocal(endOfWeek)}`;

    ranges.push({
      label,
      startDate: startOfWeek,
      endDate: endOfWeek,
      value
    });
  }

  return ranges;
}

// ✅ Obtenir le nom du mois en français (abrégé)
function getMonthName(monthIndex: number): string {
  const months = ['jan', 'fév', 'mar', 'avr', 'mai', 'juin', 'juil', 'août', 'sep', 'oct', 'nov', 'déc'];
  return months[monthIndex];
}

// ✅ Parser une plage de dates depuis le format "YYYY-MM-DD_YYYY-MM-DD"
export function parseDateRange(dateRangeValue: string): { startDate: Date; endDate: Date } | null {
  try {
    const [startStr, endStr] = dateRangeValue.split('_');
    const startDate = new Date(startStr + 'T00:00:00');
    const endDate = new Date(endStr + 'T23:59:59');
    
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return null;
    }
    
    return { startDate, endDate };
  } catch {
    return null;
  }
}

// ✅ Vérifier si une date est dans une plage
export function isDateInRange(date: Date, startDate: Date, endDate: Date): boolean {
  const checkDate = new Date(date);
  checkDate.setHours(0, 0, 0, 0);
  
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);
  
  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999);
  
  return checkDate >= start && checkDate <= end;
}

// ✅ Formater une date pour l'affichage (français)
export function formatDateForDisplay(date: Date): string {
  return date.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

// ✅ Obtenir la date d'aujourd'hui à minuit
export function getTodayAtMidnight(): Date {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

// ✅ Obtenir la date de demain à minuit
export function getTomorrowAtMidnight(): Date {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  return tomorrow;
}
