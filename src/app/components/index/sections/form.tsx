"use client";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { authSchema } from "@/utils/schemas";
import { jwtDecode, JwtPayload } from "jwt-decode";
import { FormToggleProps } from "@/utils/interfaces";

const FormToggle: React.FC<FormToggleProps> = ({ mode, setMode }) => {
  return (
    <div className="flex items-center justify-center mt-4">
      <p>
        {mode === "login"
          ? "Don't have an account?"
          : "Already have an account?"}
      </p>
      <Button
        className="cursor-pointer"
        variant="link"
        onClick={() => setMode(mode === "login" ? "register" : "login")}
      >
        {mode === "login" ? "Register here" : "Login here"}
      </Button>
    </div>
  );
};

interface LoginFormProps {
  form: any;
  handleSubmit: (values: z.infer<typeof authSchema>) => Promise<void>;
  mode: "login" | "register";
}

const LoginForm: React.FC<LoginFormProps> = ({ form, handleSubmit, mode }) => {
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input placeholder="Username" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="Password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {form.formState.errors.root && (
          <p className="text-red-500 mt-2">
            {form.formState.errors.root.message}
          </p>
        )}
        <Button type="submit">{mode === "login" ? "Login" : "Register"}</Button>
      </form>
    </Form>
  );
};

const FormPage = () => {
  const [mode, setMode] = useState<"login" | "register">("login");
  const router = useRouter();
  const form = useForm<z.infer<typeof authSchema>>({
    resolver: zodResolver(authSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const handleAuth = async (values: z.infer<typeof authSchema>) => {
    const endpoint =
      mode === "login" ? "/api/auth/login" : "/api/auth/register";
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    return response;
  };

  const handleSubmit = async (values: z.infer<typeof authSchema>) => {
    try {
      const response = await handleAuth(values);
      if (response.ok) {
        const data = await response.json();
        if (mode === "login") {
          localStorage.setItem("token", data.token);
          router.push("/work-orders");
        } else {
          router.push("/");
        }
      } else {
        const errorData = await response.json();
        form.setError("root", {
          message:
            errorData.message ||
            `${
              mode === "login" ? "Login" : "Register"
            } Failed. Please check your credentials.`,
        });
      }
    } catch (error) {
      console.error(`Error during ${mode}:`, error);
      form.setError("root", {
        message: "An unexpected error occurred. Please try again.",
      });
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decodedToken = jwtDecode<JwtPayload>(token);
        if (decodedToken && decodedToken.exp) {
          const currentTime = Math.floor(Date.now() / 1000); // Current time in seconds
          if (decodedToken.exp > currentTime) {
            // Token is valid, redirect to /work-orders
            router.push("/work-orders");
          } else {
            // Token is expired, remove it
            localStorage.removeItem("token");
            console.log("Token expired and removed.");
          }
        } else {
          // Token is invalid (missing exp), remove it
          localStorage.removeItem("token");
          console.log("Invalid token format, removed.");
        }
      } catch (error) {
        // Token decoding failed, remove it
        localStorage.removeItem("token");
        console.error("Error decoding token:", error);
      }
    }
  }, [router]);

  return (
    <section className="flex items-center justify-center min-h-screen py-8">
      <div className="max-w-sm mx-auto p-6 border rounded-lg shadow-md w-full">
        <h1 className="text-3xl font-bold text-center mb-6">
          {mode === "login" ? "Login" : "Register"}
        </h1>
        <LoginForm form={form} handleSubmit={handleSubmit} mode={mode} />
        <FormToggle mode={mode} setMode={setMode} />
      </div>
    </section>
  );
};

export default FormPage;
