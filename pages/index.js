import Layout from "@/components/Layout";
import { useSession } from "next-auth/react";


export default function Home() {
  const {data: session} = useSession();

  return (
    <Layout>
      <div className="text-primary flex justify-between">
        <h2>
          Hello, <b>{session?.user.name}</b>
        </h2>
        <div className="flex bg-highlight text-gray-800 gap-1 rounded-md overflow-hidden">
          <img src={session?.user?.image} className="w-8 h-8" alt=""></img>
          <span className="px-2 py-1 items-center">
            {session?.user?.name}
          </span>
        </div>
      </div>
    </Layout>
  );
};
