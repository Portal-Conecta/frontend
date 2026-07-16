import type { AnnouncementOrigin } from '../../types/announcement'

export {
  formatAnnouncementDateTime as formatMyAnnouncementDateTime,
  formatAnnouncementStatusLine,
} from '../../utils/announcement'

export const originLabel: Record<AnnouncementOrigin, string> = {
  WEG: 'WEG',
  SENAI: 'SENAI',
  BOTH: 'WEG + SENAI',
}

/** @deprecated Preferir `formatAnnouncementStatusLine` / `formatAnnouncementDateTime`. */
export { formatAnnouncementDateTime as formatMyAnnouncementDate } from '../../utils/announcement'
