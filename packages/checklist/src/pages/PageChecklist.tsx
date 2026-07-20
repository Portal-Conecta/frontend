import { listRooms } from "../services/server/roomService";
import { PageChecklistContent } from "./PageChecklistContent";

export async function PageChecklist() {
  const rooms = await listRooms().catch(() => []);

  return <PageChecklistContent rooms={rooms} />;
}

export default PageChecklist;