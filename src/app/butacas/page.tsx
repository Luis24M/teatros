"use client";
import { useState, useEffect } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:4000");

type Seat = {
  id: string; // Ejemplo: "A1", "B2", etc.
  occupied: boolean; // Estado de la butaca
};

export default function Home() {
  const [seats, setSeats] = useState<Seat[]>([]); // Especificar el tipo de datos

  useEffect(() => {
    // Escuchar actualizaciones del servidor
    socket.on("updateSeats", (updatedSeats: Seat[]) => {
      setSeats(updatedSeats);
    });

    // Limpiar la conexión al desmontar el componente
    return () => {
      socket.disconnect();
    };
  }, []);

  const toggleSeat = (seatId: string) => {
    socket.emit("toggleSeat", seatId); // Enviar cambio al servidor
  };

  return (
    <div>
      <h1>Reserva de Butacas</h1>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(10, 1fr)", gap: "10px" }}>
        {seats.map((seat) => (
          <button
            key={seat.id}
            onClick={() => toggleSeat(seat.id)}
            style={{
              width: "50px",
              height: "50px",
              backgroundColor: seat.occupied ? "red" : "green",
              color: "white",
              border: "none",
              cursor: "pointer",
            }}
          >
            {seat.id}
          </button>
        ))}
      </div>
    </div>
  );
}

