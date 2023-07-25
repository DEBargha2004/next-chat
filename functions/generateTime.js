import { format, isSameDay, isSameHour, isSameMinute } from 'date-fns'

export const generateTimeStamp = date => {
  const currentDate = new Date()
  const inputDate = new Date(date)
  if (isSameDay(currentDate, inputDate)) {
    if (isSameHour(currentDate, inputDate)) {
      if (isSameMinute(currentDate, inputDate)) {
        return `recently`
      }
      return `${currentDate.getMinutes() - format(inputDate, `mm`)} minutes ago`
    }
    return format(inputDate, 'hh:mm a')
  } else {
    return format(inputDate, 'MMM d hh:mm a')
  }
}
