import { Suspense } from "react";
import { LoginForm } from "@/components/login-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen } from "lucide-react";

export default function LoginPage() {
  return (
    <div className="paper-bg min-h-screen flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center gap-2 font-heading text-2xl tracking-tight">
            <BookOpen className="size-7 text-primary" aria-hidden />
            <span>Mythic Ledger</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Sign in to manage orders and customers.
          </p>
        </div>

        <Card className="border-2 shadow-[6px_6px_0_0_var(--border)]">
          <CardHeader>
            <CardTitle className="font-heading text-xl">Welcome back</CardTitle>
            <CardDescription>Use your shop or super admin credentials.</CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<p className="text-sm text-muted-foreground">Loading…</p>}>
              <LoginForm />
            </Suspense>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
