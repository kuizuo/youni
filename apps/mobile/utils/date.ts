import { format, formatRelative, isBefore, isThisYear, subDays } from "date-fns";
import dayjs from 'dayjs'
import { zhCN } from "date-fns/locale";

export const DATE_TIME_FORMAT = 'YYYY-MM-DD HH:mm:ss';

export function formatToDateTime(date: Date = new Date(), formatString = DATE_TIME_FORMAT) {
  return format(date, formatString)
}

export function formatTime(dateString: dayjs.ConfigType) {
  const date = dayjs(dateString).toDate()

  const today = new Date();

  if (isBefore(subDays(today, 7), date)) {
    return formatRelative(date, today, { locale: zhCN });
  } else {
    if (isThisYear(date)) {
      return format(date, 'MM-dd');
    } else {
      return format(date, 'yyyy-MM-dd');
    }
  }
}