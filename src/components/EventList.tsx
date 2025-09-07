import prisma from "@/lib/prisma";
import { Event, Class } from "@prisma/client";

type EventWithClass = Event & {
  class: Class | null;
};

const EventList = async ({ dateParam }: { dateParam: string | undefined }) => {
  const date = dateParam ? new Date(dateParam) : new Date();

  const data = await prisma.event.findMany({
    where: {
      startTime: {
        gte: new Date(date.setHours(0, 0, 0, 0)),
        lte: new Date(date.setHours(23, 59, 59, 999)),
      },
    },
    include: {
      class: true, // Include class relation
    },
  });

  return data.map((event: EventWithClass) => (
    <div
      className="p-5 rounded-md border-2 border-gray-100 border-t-4 odd:border-t-lamaSky even:border-t-lamaPurple"
      key={event.id}
    >
      <div className="flex items-center justify-between">
        <h1 className="font-semibold text-gray-600">{event.title}</h1>
        <div className="flex items-center gap-2">
          {event.class && (
            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
              {event.class.name}
            </span>
          )}
          <span className="text-gray-300 text-xs">
            {event.startTime.toLocaleTimeString("en-UK", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
            })}
            {event.endTime && (
              <>
                {" - "}
                {event.endTime.toLocaleTimeString("en-UK", {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: false,
                })}
              </>
            )}
          </span>
        </div>
      </div>
      <p className="mt-2 text-gray-400 text-sm">{event.description}</p>
    </div>
  ));
};

export default EventList;