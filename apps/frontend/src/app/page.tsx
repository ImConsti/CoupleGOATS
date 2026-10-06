"use client";


import {useState} from "react";

export default function Home() {
    const [backendReached, setBackendReached] = useState<boolean>(false);

    function backendTest() {
        fetch(`${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'}/test`)
            .then((res) => res.json())
            .then((data) => {
                console.log(data);
                setBackendReached(true);
            })
            .catch((err) => {
                console.error(err);
                setBackendReached(false);
            });
    }

  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
        <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={backendTest}>Test</button>
        <p hidden={!backendReached} className="text-green-500">Passed</p>
    </div>
  );
}
