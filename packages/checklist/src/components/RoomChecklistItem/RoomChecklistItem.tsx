import { Button, Text } from "@portal/ui";

export interface RoomChecklistItemProps {
  room: string;
  hasChecklist?: boolean;
  onView?: () => void;
  onCreate?: () => void;
  className?: string;
}

export function RoomChecklistItem({
  room,
  hasChecklist = false,
  onView,
  onCreate,
  className,
}: RoomChecklistItemProps) {
  return (
    <div
      className={[
        "flex items-center justify-between gap-4 border-t border-border-default py-4",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <Text
        variant="label-sm"
        tone="brand"
        className="min-w-0 break-words md:text-label-md"
      >
        {room}
      </Text>

      {hasChecklist ? (
        <Button
          variant="outlined"
          tone="brand"
          size="sm"
          onClick={onView}
          iconLeft="eye"
          className="w-44 shrink-0"
        >
          Ver Template
        </Button>
      ) : (
        <Button
          variant="outlined"
          tone="positive"
          size="sm"
          iconLeft="plus"
          onClick={onCreate}
          className="w-44 shrink-0"
        >
          Criar Template
        </Button>
      )}
    </div>
  );
}
