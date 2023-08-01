import { format, isSameDay, isYesterday } from 'date-fns'

export default function messeage_CreatedAt (time) {
  if (!time) {
    return
  }
  const currentDate = new Date()
  const inputDate = new Date(time)
  if (isSameDay(currentDate, inputDate)) {
    return format(inputDate, 'hh:mm a')
  } else if (isYesterday(inputDate)) {
    return 'Yesterday'
  } else {
    return format(inputDate, 'dd/MM/yyyy')
  }
}
