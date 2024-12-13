"use client";
import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/context/authContext";
import { io } from "socket.io-client";

const socket = io("http://localhost:4000");

interface Comment {
  user: string;
  message: string;
  createdAt: string;
}

interface Seat {
  seatNumber: string;
  reserved: boolean;
  reservedBy: string | null;
  selecting: boolean;
  selectedBy: string | null;
}

interface Obra {
  id: string;
  title: string;
  image: string;
  description: string;
  date: string;
  time: string;
  location: string;
  comments: Comment[];
  seats: Seat[];
}

export default function ObraDetailPage() {
  const { obra: eventId } = useParams();
  const { user } = useAuth();
  const [obraData, setObraData] = useState<Obra | null>(null);
  const [comment, setComment] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const obraId = eventId;
  // Fetch event details
  const fetchObraData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:4000/api/events/${eventId}`);
      if (!response.ok) throw new Error("Error fetching event details");
      const data: Obra = await response.json();
      setObraData(data);
    } catch (error) {
      console.error("Failed to fetch event:", error);
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    if (eventId) fetchObraData();
    if (eventId) {
      socket.emit("joinEvent", eventId);
    }
  }, [fetchObraData, eventId]);

  

  // Handle socket updates
  useEffect(() => {
    const handleUpdateObra = (updatedObra: Obra) => {
      setObraData(updatedObra);
    };
  
    socket.on("updateObra", handleUpdateObra);
  
    return () => {
      socket.off("updateObra", handleUpdateObra);
    };
  }, []);
  

  // Handle new comment
  const handleAddComment = async () => {
    if (!user) {
      alert("Debes iniciar sesión para comentar");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:4000/api/events/${eventId}/comments`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ user: user.name, message: comment }),
        }
      );
      if (!response.ok) throw new Error("Error adding comment");
      const newComment: Comment = await response.json();
      setObraData((prev) => {
        if (!prev) return null;
        return { ...prev, comments: [...prev.comments, newComment] };
      });
      setComment("");
    } catch (error) {
      console.error("Failed to add comment:", error);
    }
  };

  // Handle seat selection
  const selectSeat = (seatNumber: string) => {
    socket.emit("selectSeat", seatNumber, user?.id, obraId || null); // Enviar cambio al servidor
  };

  if (loading) return <p>Cargando...</p>;
  if (!obraData) return <p>No se pudo cargar la información del evento.</p>;

  return (
    <div className="max-w-5xl mx-auto p-4">
      <h1 className="text-2xl font-bold">{obraData.title}</h1>
      <section className="flex">
        <img
          src={`http://localhost:4000/${obraData.image}`}
          alt={obraData.title}
          className="w-full h-64 object-contain my-4"
        />
        <section className="space-y-2 ml-4">
          <p>{obraData.description}</p>
          <p>
            <strong>Fecha:</strong> {obraData.date}
          </p>
          <p>
            <strong>Hora:</strong> {obraData.time}
          </p>
          <p>
            <strong>Ubicación:</strong> {obraData.location}
          </p>
        </section>
      </section>

      {/* Comments Section */}
      <h2 className="text-xl my-4">Comentarios</h2>
      <ul>
        {obraData.comments.map((comment, index) => (
          <li key={index} className="border-b py-2">
            <strong>{comment.user}</strong>: {comment.message}
            <p className="text-gray-500 text-sm">
              {new Date(comment.createdAt).toLocaleString()}
            </p>
          </li>
        ))}
      </ul>
      <textarea
        className="w-full border p-2 my-2 text-black rounded-lg"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Escribe un comentario..."
      />
      <button
        className="bg-blue-500 text-white px-4 py-2 rounded-xl"
        onClick={handleAddComment}
      >
        Agregar comentario
      </button>

      {/* Seat Selection */}
      <h2 className="text-xl my-4">Butacas</h2>
      <div className="grid grid-cols-6 gap-2">
        {obraData.seats.map((seat) => (
          <div key={seat.seatNumber} className="flex flex-col items-center">
            <button
              disabled={seat.reserved || seat.selecting}
              className={`p-2 rounded ${
                seat.reserved
                  ? "bg-red-500"
                  : seat.selecting
                  ? "bg-yellow-500"
                  : "bg-green-500"
              }`}
              onClick={() => selectSeat(seat.seatNumber)}
            >
              {seat.seatNumber}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
