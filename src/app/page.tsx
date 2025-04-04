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
import { CancelEventIcon } from "../components/CancelEventIcon";

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

interface User {
  id: string;
  createdAt: string;
  username: string;
  password: string;
}

export default function Home() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isCreatingNewEvent, setIsCreatingNewEvent] = useState(false);
  const [eventName, setEventName] = useState("");
  const [userName, setUserName] = useState("");

  function extractUsernames(users) {
    return users.map((user) => user.username);
  }

  function handleEventName(e) {
    console.log(e.target.value);
    setEventName(e.target.value);
  }

  function handleUsername(e) {
    console.log(e.target.value);
    setUserName(e.target.value);
  }

  useEffect(() => {
    const fetchEvents = async () => {
      const res = await fetch("/api/events");
      const data = await res.json();
      const mapped = data.map((e: any) => ({
        id: e.id,
        title: e.name,
        start: e.start,
        end: e.end,
      }));

      setEvents(mapped);
    };

    fetchEvents();
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      const res = await fetch("/api/users");
      const data = await res.json();
      const mapped = data.map((e: any) => ({
        id: e.id,
        createdAt: e.createdAt,
        username: e.username,
        end: e.end,
      }));

      setUsers(mapped);
    };

    fetchUsers();
    console.log(users);
  }, []);

  const handleSlotSelect = useCallback(async ({ start, end, action }) => {
    console.log(users);

    if (action === "doubleClick") {
      setIsCreatingNewEvent(true);
      // const title = window.prompt("New Event name");
      const title = eventName;
      if (!title || !userName) return;

      const body = {
        name: title,
        start,
        end,
        username,
      };

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

  const onEventResize = useCallback(async ({ event, start, end }) => {
    const updated = {
      id: event.id,
      name: event.title,
      start,
      end,
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

  // const handleSelectEvent = useCallback((event) => {
  //   window.alert(event.title);
  // }, []);

  return (
    <div className="App">
      {isCreatingNewEvent && (
        <div className="z-50 bg-amber-900 h-100 w-100 absolute top-30 left-30">
          <input id="eventName" onChange={(e) => handleEventName(e)} />
          <select onChange={(e) => handleUsername(e)}>
            {extractUsernames(users).map((username, idx) => {
              return <option key={idx}>{username}</option>;
            })}
          </select>
          <button onClick={() => console.log("clicked")}></button>
        </div>
      )}

      <DnDCalendar
        selectable
        defaultDate={moment().toDate()}
        defaultView="month"
        events={events}
        localizer={localizer}
        onEventDrop={onEventDrop}
        onEventResize={onEventResize}
        onSelectEvent={(e) => console.log(e.title)}
        onSelectSlot={handleSlotSelect}
        resizable
        style={{ height: "100vh", zIndex: "0" }}
        components={{
          event: (props) => (
            <CancelEventIcon {...props} onDelete={handleDeleteEvent} />
          ),
        }}
      />
    </div>
  );
}
