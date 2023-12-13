"use client";

import { useEffect, useState } from "react";
import { fetchEventSource } from "@microsoft/fetch-event-source";

type Notification = {
  id: string;
  type: string;
  metadata: {
    title: string;
    description: string
  };
}

export default function Home() {
  const [notifications, setNotifications] = useState<Notification[]>([])

  useEffect(() => {
    const fetchData = async () => {
      await fetchEventSource(`//localhost:5001/notifications/events/0x69D30b1875d39E13A01AF73CCFED6d84839e84f2`, {
        method: "GET",
        headers: {
          Accept: "text/event-stream",
        },
        onopen: async (res) : Promise<void> =>{
          if (res.ok && res.status === 200) {
            console.log("Connection made ", res);
          } else if (
              res.status >= 400 &&
              res.status < 500 &&
              res.status !== 429
          ) {
            console.log("Client side error ", res);
          }
        },
        onmessage(event) {
          console.log('onmessage', event.data);
          // const parsedData = JSON.parse(event.data);
          // setNotifications((data) => [...data, parsedData]);
        },
        onclose() {
          console.log("onclose: Connection closed by the server");
        },
        onerror(err) {
          console.log("onerror: There was an error from server", err);
        },
      });
    };
    fetchData();
  }, []);

  // useEffect(() => {
  //   console.log('subscribing')
  //   const evtSource = new EventSource(`//localhost:5001/notifications/events/0x69D30b1875d39E13A01AF73CCFED6d84839e84f2`, {
  //     // withCredentials: true,
  //   });
  //   evtSource.onmessage = (event) => {
  //     console.log(`message: ${event.data}`);
  //     setNotifications([...notifications, JSON.parse(event.data)]);
  //   };
  //
  //   return () => {
  //     console.log('closing')
  //     evtSource.close()
  //   }
  // })

  return (
      <main className=" min-h-screen p-24">
        <h1 className="text-4xl font-bold text-center">Notifications</h1>
        <div className="z-10 max-w-5xl w-full items-center text-sm border">
          <ul>
            {notifications.map((notification, idx) => (
                <li key={idx} className="text-lg flex border border-b-orange-400 gap-x-5 p-2">
                  <div className="w-36" title={notification.id}>{notification.metadata.title}</div>
                  <div>{notification.metadata.description}</div>
                </li>))
            }
          </ul>
        </div>
      </main>
  )
}
