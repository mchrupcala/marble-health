"use client";

import React, { useState, useCallback } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop";

import "react-big-calendar/lib/addons/dragAndDrop/styles.css";
import "react-big-calendar/lib/css/react-big-calendar.css";

const localizer = momentLocalizer(moment);
const DnDCalendar = withDragAndDrop(Calendar);

export default function Home() {
  // TODO - adding event to calendar should call my POST or PUT endpoints

  // TODO - get all events
  // TODO - get all events (only for user's session)
  const [events, setEvents] = useState([
    {
      start: new Date("2025-03-28T12:00-0500"),
      end: new Date("2025-03-28T12:01-0500"),
      title: "Earlier",
    },
    {
      start: moment().toDate(),
      end: moment().add(1, "days").toDate(),
      title: "Some title",
    },
  ]);

  const handleSlotSelect = useCallback(({ start, end, action }) => {
    if (action === "doubleClick") {
      const title = window.prompt("New Event name");

      if (!title) return;

      const newEvent = { start, end, title };
      setEvents((prevEvents) => [...prevEvents, newEvent]);
    }
  }, []);

  const handleSelectEvent = useCallback((event) => {
    //TODO - change this so I can edit events.

    window.alert(event.title);
  }, []);

  // TODO - update event after a resize
  const onEventResize = useCallback(({ start, end }) => {
    setEvents((prevEvents) => {
      const updated = [...prevEvents];
      updated[0] = { ...updated[0], start, end };
      return updated;
    });
  }, []);

  const onEventDrop = useCallback((data) => {
    console.log(data);
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
      />
    </div>
  );
}
