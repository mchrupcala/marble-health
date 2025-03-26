"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Calendar,
  momentLocalizer,
  Event as RBCEvent,
  stringOrDate,
} from "react-big-calendar";
import moment from "moment";
import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop";
import { CustomEvent } from "../components/CustomEvent";

import "react-big-calendar/lib/addons/dragAndDrop/styles.css";
import "react-big-calendar/lib/css/react-big-calendar.css";

const localizer = momentLocalizer(moment);
const DnDCalendar = withDragAndDrop(Calendar);

interface CalendarEvent extends RBCEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
}

export default function Home() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);

  // 🔁 Fetch events on mount
  useEffect(() => {
    const fetchEvents = async () => {
      const res = await fetch("/api/events");
      const data = await res.json();
      const mapped = data.map((e: any) => ({
        id: e.id,
        title: e.name,
        start: e.start,
        end: e.end, // you can customize this later
      }));
      console.log(mapped);
      setEvents(mapped);
    };

    fetchEvents();
  }, []);

  // ➕ Add event
  const handleSlotSelect = useCallback(async ({ start, end, action }) => {
    if (action === "doubleClick") {
      const title = window.prompt("New Event name");
      if (!title) return;

      const body = {
        name: title,
        start,
        end,
        // ownerId: "placeholder-id"
      }; // Replace with real user later

      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const created = await res.json();

      setEvents((prev) => [
        ...prev,
        {
          id: created.id,
          title: created.name,
          start,
          end,
        },
      ]);
    }
  }, []);

  // 🛠 Resize event
  const onEventResize = useCallback(async ({ event, start, end }) => {
    const updated = {
      id: event.id,
      name: event.title,
      start,
      end,
      // ownerId: "placeholder-id", // Replace with real user later
    };

    await fetch("/api/events", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updated),
    });

    setEvents((prev) =>
      prev.map((e) => (e.id === event.id ? { ...e, start, end } : e))
    );
  }, []);

  const onEventDrop = useCallback(
    async ({
      event,
      start,
      end,
    }: {
      event: CalendarEvent;
      start: stringOrDate;
      end: stringOrDate;
    }) => {
      console.log("dropped: ", event, start, end);
      const updated = {
        id: event.id,
        name: event.title,
        start: new Date(start),
        end: new Date(end),
        // ownerId: "placeholder-id", // Replace with real user later
      };
      await fetch("/api/events", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });

      setEvents((prev) =>
        prev.map((e) => (e.id === event.id ? { ...e, start, end } : e))
      );
    },
    []
  );

  const handleDeleteEvent = useCallback(async (id: string) => {
    await fetch("/api/events", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });

    setEvents((prev) => prev.filter((e) => e.id !== id));
  }, []);

  const handleSelectEvent = useCallback((event) => {
    window.alert(event.title);
  }, []);

  return (
    <div className="App">
      <DnDCalendar
        selectable
        defaultDate={moment().toDate()}
        defaultView="month"
        events={events}
        localizer={localizer}
        onEventDrop={onEventDrop}
        onEventResize={onEventResize}
        onSelectEvent={handleSelectEvent}
        onSelectSlot={handleSlotSelect}
        resizable
        style={{ height: "100vh" }}
        components={{
          event: (props) => (
            <CustomEvent {...props} onDelete={handleDeleteEvent} />
          ),
        }}
      />
    </div>
  );
}
