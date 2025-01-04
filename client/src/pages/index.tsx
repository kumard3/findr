import GenerateApiKey from "@/components/GenerateApiKey";
import IndexData from "@/components/IndexData";
import SearchData from "@/components/SearchData";
import { api } from "@/utils/api";
import { useSession } from "next-auth/react";
import React, { ChangeEvent, useState } from "react";

export default function Home() {
  const session = useSession()
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
        <button
          onClick={() => {
            mutate(formData);
          }}
        >
          mutate
        </button>
      </div>

      <GenerateApiKey />

      <IndexData />

      <SearchData />
    </div>
  );
}
