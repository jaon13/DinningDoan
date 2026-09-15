/**
 * Dining Doan business-hours helpers (Asia/Seoul).
 * Default service window: 17:30 → 01:00 (overnight).
 */

const SEOUL = 'Asia/Seoul';

/**
 * @returns {{ day: number, minutes: number }} day: 0=Sun … 6=Sat
 */
export function getSeoulNowParts(date = new Date()) {
  const fmt = new Intl.DateTimeFormat('en-US', {
    timeZone: SEOUL,
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23'
  });
  const parts = Object.fromEntries(fmt.formatToParts(date).map((p) => [p.type, p.value]));
  const dayMap = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  return {
    day: dayMap[parts.weekday] ?? 0,
    minutes: Number(parts.hour) * 60 + Number(parts.minute)
  };
}

/**
 * @param {{
 *   openMinutes?: number,
 *   closeMinutes?: number,
 *   closedWeekdays?: number[]
 * }} schedule
 * @param {Date} [date]
 */
export function isBranchOpen(schedule, date = new Date()) {
  const openMinutes = schedule.openMinutes ?? 17 * 60 + 30;
  const closeMinutes = schedule.closeMinutes ?? 1 * 60;
  const closedWeekdays = schedule.closedWeekdays ?? [];
  const { day, minutes } = getSeoulNowParts(date);

  // 00:00–close → still previous day's service
  if (minutes < closeMinutes) {
    const prevDay = (day + 6) % 7;
    return !closedWeekdays.includes(prevDay);
  }

  // close–open → closed
  if (minutes < openMinutes) return false;

  // open–midnight → today's evening service
  return !closedWeekdays.includes(day);
}

/**
 * @param {boolean} open
 */
export function statusLabel(open) {
  return open
    ? { open: true, en: 'OPEN', ko: '영업 중' }
    : { open: false, en: 'CLOSED', ko: '영업 종료' };
}
