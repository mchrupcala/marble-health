type CancelEventIconProps = {
  event: {
    id: string;
    title: string;
  };
  onDelete: (id: string) => void;
};

export const CancelEventIcon = ({ event, onDelete }: CancelEventIconProps) => {
  return (
    <div className="relative group px-1">
      <span>{event.title}</span>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete(event.id);
        }}
        className="absolute top-0 right-1 opacity-0 hover:cursor-pointer group-hover:opacity-100 text-red-500 text-xs hover:text-red-700"
      >
        ❌
      </button>
    </div>
  );
};
