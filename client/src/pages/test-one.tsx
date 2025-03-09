import GenerateApiKey from "@/components/GenerateApiKey";
import { movies } from "../components/movies";
import SearchData from "@/components/SearchData";
import { Button } from "@/components/ui/button";
import { api } from "@/utils/api";
import { useSession } from "next-auth/react";
import type React from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";

export default function Home() {
  const session = useSession();
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const { mutate } = api.user.createUser.useMutation({});
  const { data } = api.user.getAllUsers.useQuery();

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  console.log(data, "data");
  console.log(session, "data");
  useEffect(() => {
    if (session.status === "unauthenticated") {
      console.log(session, "session");
      router.push("/login");
    }
  }, [session, router]);

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-xl font-bold">User Dashboard</h1>

      <div>
        <p>Create User</p>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleInputChange}
        />
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleInputChange}
        />
        {/* biome-ignore lint/a11y/useButtonType: <explanation> */}
        <button
          onClick={() => {
            mutate(formData);
          }}
        >
          mutate
        </button>
      </div>

      <GenerateApiKey />
      <Button onClick={indexDocument}> indexDocument</Button>
      {/* <IndexData /> */}

      <SearchData />
    </div>
  );
}

// Example request to index a document
// biome-ignore lint/suspicious/noExplicitAny: <explanation>
const indexDocument = async (document: any) => {
  const response = await fetch("http://localhost:9000/api/index", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": "sk_SmzNZ1Bak2zD-Fw5ms-NX9j0zkFq3DSU",
    },
    body: JSON.stringify(movies),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }

  return await response.json();
};