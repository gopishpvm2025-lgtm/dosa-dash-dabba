import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { BarChart3, Lightbulb, LoaderCircle, LogIn, LogOut } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import type { MonthlySalesSummary } from "@/lib/sales-report";

interface SalesInsightsProps {
  summary: MonthlySalesSummary;
}

const SalesInsights = ({ summary }: SalesInsightsProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [managerEmail, setManagerEmail] = useState<string | null>(null);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [analysis, setAnalysis] = useState("");
  const [analysisMonth, setAnalysisMonth] = useState("");

  useEffect(() => {
    let active = true;
    void supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setManagerEmail(data.session?.user.email ?? null);
      setIsCheckingSession(false);
    });
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setManagerEmail(session?.user.email ?? null);
      if (!session) {
        setAnalysis("");
        setAnalysisMonth("");
      }
    });
    return () => {
      active = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    setAnalysis("");
    setAnalysisMonth("");
    setErrorMessage("");
  }, [summary.month]);

  const handlePasswordSignIn = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage("");
    setIsSigningIn(true);
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setIsSigningIn(false);
    if (error) setErrorMessage(error.message);
  };

  const handleSocialSignIn = async (provider: "google" | "lovable") => {
    setErrorMessage("");
    const result = await lovable.auth.signInWithOAuth(provider, { redirect_uri: window.location.origin });
    if (result.error) setErrorMessage(result.error.message);
  };

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) setErrorMessage(error.message);
  };

  const handleAnalysis = async () => {
    setIsAnalyzing(true);
    setErrorMessage("");
    setAnalysis("");

    const { data, error } = await supabase.functions.invoke<{ analysis: string; error?: string }>("analyze-sales", {
      body: {
        month: summary.month,
        totalRevenue: summary.totalRevenue,
        totalOrders: summary.totalOrders,
        days: summary.dailyData.map(({ date, revenue }) => ({ day: Number(date), revenue })),
        items: summary.items.map(({ name, quantity, revenue }) => ({ name, quantity, revenue })),
      },
    });

    if (error) {
      let message = error.message;
      if (error.context instanceof Response) {
        try {
          const responseBody = await error.context.json() as { error?: string; message?: string };
          message = responseBody.error ?? responseBody.message ?? message;
        } catch {
          // Preserve the safe SDK message if the edge response is not JSON.
        }
      }
      setErrorMessage(message);
      setIsAnalyzing(false);
      return;
    }

    if (!data?.analysis?.trim()) {
      setErrorMessage("The AI analysis returned no recommendations. Please try again.");
      setIsAnalyzing(false);
      return;
    }

    setAnalysis(data.analysis.trim());
    setAnalysisMonth(summary.month);
    setIsAnalyzing(false);
    toast.success("Monthly sales insights are ready");
  };

  const formattedAnalysis = analysis.split(/\n+/).map((line, index) => {
    const trimmed = line.trim();
    if (!trimmed) return null;
    const heading = trimmed.replace(/^#{1,4}\s*/, "").replace(/\*\*/g, "");
    const isHeading = /^#{1,4}\s/.test(trimmed) || /^\*\*.+\*\*$/.test(trimmed);
    const content = trimmed.replace(/^[-*]\s+/, "").replace(/^\*\*(.+)\*\*:?\s*/, "$1: ").replace(/\*\*/g, "");
    return isHeading ? (
      <h4 key={index} className="pt-3 font-semibold text-foreground">{heading}</h4>
    ) : (
      <p key={index} className={/^[-*]\s/.test(trimmed) ? "pl-3 text-sm leading-relaxed text-muted-foreground" : "text-sm leading-relaxed text-muted-foreground"}>{content}</p>
    );
  });

  return (
    <section className="space-y-4 border-y border-border py-5" aria-labelledby="sales-insights-title">
      <div className="flex items-center gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-accent/30 text-primary">
          <Lightbulb className="size-5" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 id="sales-insights-title" className="font-display text-lg font-bold text-foreground">AI sales insights</h3>
          <p className="text-sm text-muted-foreground">Patterns and practical menu and staffing actions</p>
        </div>
        {managerEmail && (
          <Button variant="ghost" size="icon" onClick={handleSignOut} aria-label="Sign out" title={`Sign out ${managerEmail}`}>
            <LogOut />
          </Button>
        )}
      </div>

      {isCheckingSession ? (
        <p className="text-sm text-muted-foreground">Checking manager sign-in…</p>
      ) : managerEmail ? (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="min-w-0 truncate text-sm text-muted-foreground">Signed in as {managerEmail}</p>
            <Button onClick={handleAnalysis} disabled={isAnalyzing}>
              {isAnalyzing ? <LoaderCircle className="animate-spin" /> : <BarChart3 />}
              {isAnalyzing ? "Analyzing sales…" : "Analyze this month"}
            </Button>
          </div>
          {analysis && analysisMonth === summary.month && (
            <div className="divide-y divide-border border-l-2 border-primary pl-4" aria-live="polite">
              {formattedAnalysis}
            </div>
          )}
        </div>
      ) : (
        <div className="max-w-xl space-y-3">
          <p className="text-sm leading-relaxed text-muted-foreground">Sign in to send this month’s sales totals for a private AI-powered review. Only summary totals and menu item counts are sent.</p>
          <form onSubmit={handlePasswordSignIn} className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
            <Input type="email" autoComplete="username" placeholder="Manager email" aria-label="Manager email" value={email} onChange={(event) => setEmail(event.target.value)} required />
            <Input type="password" autoComplete="current-password" placeholder="Password" aria-label="Manager password" value={password} onChange={(event) => setPassword(event.target.value)} required />
            <Button type="submit" disabled={isSigningIn}>
              {isSigningIn ? <LoaderCircle className="animate-spin" /> : <LogIn />}
              Sign in
            </Button>
          </form>
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" onClick={() => void handleSocialSignIn("google")}>Continue with Google</Button>
            <Button type="button" variant="outline" onClick={() => void handleSocialSignIn("lovable")}>Continue with Lovable</Button>
          </div>
          <p className="text-xs text-muted-foreground">Manager accounts are managed by the restaurant owner.</p>
        </div>
      )}

      {errorMessage && <p role="alert" className="text-sm text-destructive">{errorMessage}</p>}
    </section>
  );
};

export default SalesInsights;