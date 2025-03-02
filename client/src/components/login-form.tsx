import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { signIn, useSession } from "next-auth/react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { toast } from "sonner";
import { Loader } from "lucide-react";
import Link from "next/link";
const formSchema = z.object({
  password: z.string().min(1, {
    message: "please enter the password",
  }),
  email: z.string().min(1, { message: "This field has to be filled." }),
});
export function LoginForm() {
  const [showLoader, setShowLoader] = useState(false);

  const router = useRouter();
  const session = useSession();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: "",
      email: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    setShowLoader(true);
    void signIn("credentials", {
      email: values.email,
      password: values.password,
    }).then((res) => {
      setShowLoader(false);
      if (res?.error) {
        toast(res?.error);
      } else {
        void router.push("/");
      }
    });
  }

  useEffect(() => {
    if (session.status === "authenticated") {
      void router.push("/dashboard");
    }
  }, [router, session]);
  return (
    <Card className="mx-auto max-w-sm">
      <CardHeader>
        <CardTitle className="text-2xl">Login</CardTitle>
        <CardDescription>
          Enter your email below to login to your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4 text-center text-sm text-muted-foreground">
          Don't have an account?{" "}
          <Link href="/auth/signup" className="text-primary hover:underline">
            Sign up
          </Link>
        </div>
        <Form {...form}>
          <form className="space-y-3" onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name={"email"}
              render={({ field }) => (
                <FormItem>
                  <div>
                    <FormLabel>Email/Username</FormLabel>
                    <FormControl>
                      <Input placeholder="Email Address " {...field} />
                    </FormControl>
                  </div>

                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <div className="mb-2">
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Enter Password"
                        {...field}
                      />
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              disabled={showLoader}
              type="submit"
              variant={"secondary"}
              className="w-full gap-x-1"
            >
              Continue{" "}
              {showLoader ? (
                <Loader className="animate-spin" size={20} />
              ) : (
                <div className="h-[1.2rem] w-[1.2rem]" />
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
