'use client';
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ObrasPage() {
  interface Obra {
    id: number;
    _id: string;
    title: string;
    image: string;
    description: string;
    date: string;
    time: string;
    location: string;
  }

  const [obras, setObras] = useState<Obra[]>([]);

  const router = useRouter();

  useEffect(() => {
    // fetch obras
    fetch("http://localhost:4000/api/events/")
      .then((res) => res.json())
      .then((data) => {
        setObras(data);
      });
  }, []); // Asegúrate de que este efecto se ejecute solo una vez


  return (
    <div className="max-w-5xl mx-auto p-4">
      <h1 className="text-2xl">Obras</h1>
      {/* cards de las obras */}
      <div className="grid grid-cols-3 gap-4">
        {obras.map((obra) => (
          <div key={obra._id} className="bg-white p-4 shadow rounded-lg">
            <div>
              <img
                src={`http://localhost:4000/${obra.image}`}
                alt={obra.title}
                className="w-full h-32 object-contain rounded-lg"
              />
            </div>
            <h2 className="text-lg font-semibold text-black mt-2">{obra.title}</h2>
            <p className="text-gray-500">{obra.description}</p>
            <p className="text-gray-500">{obra.date}</p>
            <p className="text-gray-500">{obra.time}</p>
            <p className="text-gray-500">{obra.location}</p>
            <button
              className="bg-[#F4C751] py-2 text-[#151C25] font-semibold rounded-xl mt-2"
              onClick={() => router.push(`/obras/${obra._id}`)}
            >
              Reservar
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
