import { useEffect, useState } from "react";

export default function Users() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetch('/api/users')
      .then(res => res.json())
      .then(data => setUsers(data));
  }, []);

  return (
    <div>
      <h1>Usuarios</h1>
      {users.map((u: any) => (
        <div key={u.id}>{u.name}</div>
      ))}
    </div>
  );
}
