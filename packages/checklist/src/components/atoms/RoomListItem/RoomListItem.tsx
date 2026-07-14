import { ListItem, Text } from "@portal/ui";

export interface RoomListItemProps {
  number: string | number;
  name: string;
  onClick?: () => void;
  className?: string;
}

export function RoomListItem({
  number,
  name,
  onClick,
  className,
}: RoomListItemProps) {
  return (
    <ListItem
      onClick={onClick}
      className={["flex items-center gap-3", className]
        .filter(Boolean)
        .join(" ")}
    >
      <Text
        as="span"
        variant="label-sm"
        tone="secondary"
        className="w-8 shrink-0"
      >
        {number}
      </Text>
      <Text as="span" variant="label-sm" tone="secondary">
        {name}
      </Text>
    </ListItem>
  );
}
