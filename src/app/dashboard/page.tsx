"use client";

import { useState, useEffect } from "react";
import axios from "axios";

export default function Dashboard() {
  interface Event {
    _id: string;
    title: string;
    image: string;
    description: string;
    date: string;
    time: string;
    location: string;
    availableSeats: number;
  }

  const [events, setEvents] = useState<Event[]>([]);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    location: "",
    availableSeats: "",
  });
  const [fileData, setFileData] = useState<File | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const token = localStorage.getItem("token");
  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await axios.get("http://localhost:4000/api/events");
      setEvents(response.data);
    } catch (error) {
      console.error("Error al obtener eventos:", error);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFileData(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formDataToSend = new FormData();
    Object.keys(formData).forEach((key) => {
      formDataToSend.append(key, formData[key as keyof typeof formData]);
    });

    if (fileData) {
      formDataToSend.append("image", fileData);
    }

    try {
      if (editingId) {
        const response = await axios.put(
          `http://localhost:4000/api/events/${editingId}`,
          formDataToSend,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );
        setEvents(
          events.map((event) =>
            event._id === editingId ? response.data.event : event
          )
        );
        setEditingId(null);
      } else {
        const response = await axios.post(
          "http://localhost:4000/api/events",
          formDataToSend,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );
        setEvents([...events, response.data.event]);
      }

      setFormData({
        title: "",
        description: "",
        date: "",
        time: "",
        location: "",
        availableSeats: "",
      });
      setFileData(null);
    } catch (error) {
      console.error("Error al enviar el formulario:", error);
    }
  };

  const handleEditClick = (event: Event) => {
    setFormData({
      title: event.title,
      description: event.description,
      date: event.date,
      time: event.time,
      location: event.location,
      availableSeats: String(event.availableSeats),
    });
    setEditingId(event._id);
  };
  console.log(localStorage.getItem("token"));
  const deleteEvent = async (id: string) => {
    try {
      await axios.delete(`http://localhost:4000/api/events/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setEvents(events.filter((event) => event._id !== id));
    } catch (error) {
      console.error("Error al eliminar el evento:", error);
    }
  };

  return (
    <section className="w-full">
      <form
        className="flex flex-col max-w-2xl mx-auto [&>input]:p-3 [&>input]:rounded-xl [&>input]:bg-[#1C2A36] [&>input]:mb-4 [&>input]:border [&>input]:border-neutral-700"
        onSubmit={handleSubmit}
      >
        <input
          name="title"
          value={formData.title}
          onChange={handleInputChange}
          placeholder="Título"
          required
        />
        <input
          name="image"
          type="file"
          onChange={handleFileChange}
          required={!editingId}
        />
        <textarea
          className="p-3 rounded-xl bg-[#1C2A36] mb-4 border border-neutral-700"
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          placeholder="Descripción"
          required
        />
        <input
          name="date"
          type="date"
          value={formData.date}
          onChange={handleInputChange}
          required
        />
        <input
          name="time"
          type="time"
          value={formData.time}
          onChange={handleInputChange}
          required
        />
        <input
          name="location"
          value={formData.location}
          onChange={handleInputChange}
          placeholder="Ubicación"
          required
        />
        <input
          name="availableSeats"
          type="number"
          value={formData.availableSeats}
          onChange={handleInputChange}
          placeholder="Asientos disponibles"
          required
        />
        <button type="submit" className="bg-[#F4C751] py-2 text-[#151C25] font-semibold rounded-xl">
          {editingId ? "Editar Evento" : "Crear Evento"}
        </button>
      </form>
      <div className="grid grid-cols-1 gap-4 max-w-2xl mx-auto mt-4">
        {events.map((event) => (
          <div
            key={event._id}
            className="bg-[#1C2A36] p-4 rounded-xl border border-neutral-700"
          >
            <h2 className="text-xl font-semibold">{event.title}</h2>
            <img
              className="w-full h-40 object-cover rounded-xl"
              src={`http://localhost:4000/${event.image}`}
              alt={event.title}
            />
            <p>{event.description}</p>
            <p>
              <strong>Fecha:</strong> {event.date}
            </p>
            <p>
              <strong>Hora:</strong> {event.time}
            </p>
            <p>
              <strong>Ubicación:</strong> {event.location}
            </p>
            <p>
              <strong>Asientos disponibles:</strong> {event.availableSeats}
            </p>
            <button
              className="bg-[#F4C751] py-2 text-[#151C25] font-semibold rounded-xl"
              onClick={() => handleEditClick(event)}
            >
              Editar
            </button>
            <button
              className="bg-[#F4C751] py-2 text-[#151C25] font-semibold rounded-xl"
              onClick={() => deleteEvent(event._id)}
            >
              Eliminar
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
