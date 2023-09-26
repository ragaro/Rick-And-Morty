"use client";

import axios from "axios";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, Form, Input, Button, Space } from 'antd';

function Home() {
  const [credentials, setCredentials] = useState({
    username: "admin",
    password: "admin",
  });
  const router = useRouter();

  const handleSubmit = async (values) => {
    const res = await axios.post("/api/auth/login", credentials);

    if (res.status === 200) {
      router.push("/");
    }
  };

  return (
    <Card title="Login" style={{ width: 300, margin: "2rem auto" }}>
        <Form onFinish={handleSubmit}>
            <Form.Item>
                <Input
                placeholder="Username"
                type="text"
                defaultValue={credentials.username}
                onChange={(e) =>
                    setCredentials({
                    ...credentials,
                    username: e.target.value,
                    })
                }
                />
            </Form.Item>
            <Form.Item>
                <Input
                type="password"
                placeholder="password"
                defaultValue={credentials.password}
                onChange={(e) =>
                    setCredentials({
                    ...credentials,
                    password: e.target.value,
                    })
                }
                />
            </Form.Item>
            <Button type="primary" block htmlType="submit">Login</Button>
        </Form>
    </Card>
  );
}

export default Home;