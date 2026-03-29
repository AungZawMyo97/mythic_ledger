import { ChangePasswordPanel } from "@/components/change-password-panel";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { KeyRound } from "lucide-react";

export default function ChangePasswordPage() {
  return (
    <div className="paper-bg min-h-screen flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-lg space-y-8">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center gap-2 font-heading text-2xl tracking-tight">
            <KeyRound className="size-7 text-primary" aria-hidden />
            <span>Update password</span>
          </div>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            For security, choose a new password before continuing. This screen appears once
            after your first sign-in with a temporary password.
          </p>
        </div>

        <Card className="border-2 shadow-[6px_6px_0_0_var(--border)]">
          <CardHeader>
            <CardTitle className="font-heading text-xl">Choose a strong password</CardTitle>
            <CardDescription>
              Use at least 8 characters. Avoid reusing passwords from other sites.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChangePasswordPanel />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
