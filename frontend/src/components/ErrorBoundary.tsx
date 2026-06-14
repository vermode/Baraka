import { Component, type ErrorInfo, type ReactNode } from "react";

/**
 * Catches render-time crashes anywhere below it and shows a friendly fallback
 * instead of a blank white screen. React requires a class component for this
 * (there is no hook equivalent for `componentDidCatch`).
 */
interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    // Surface the real error in the console for debugging; a real error-tracking
    // service can be wired in here later.
    console.error("Uncaught UI error:", error, info.componentStack);
  }

  private handleReload = (): void => {
    this.setState({ hasError: false });
    window.location.assign("/");
  };

  render(): ReactNode {
    if (!this.state.hasError) return this.props.children;

    const isAr =
      (typeof localStorage !== "undefined" && localStorage.getItem("lang")) !==
      "en";

    return (
      <div
        dir={isAr ? "rtl" : "ltr"}
        className="min-h-screen flex flex-col items-center justify-center gap-4 bg-background text-foreground px-6 text-center"
      >
        <img src="/logo.png" alt="" className="h-20 w-auto object-contain" />
        <h1 className="text-2xl font-extrabold">
          {isAr ? "حدث خطأ غير متوقع" : "Something went wrong"}
        </h1>
        <p className="text-muted-foreground max-w-md">
          {isAr
            ? "نأسف على ذلك. حاول إعادة تحميل الصفحة، وإذا استمرت المشكلة تواصل معنا."
            : "Sorry about that. Try reloading the page — if the problem persists, please contact us."}
        </p>
        <button
          onClick={this.handleReload}
          className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-2.5 text-sm font-bold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
        >
          {isAr ? "العودة إلى الرئيسية" : "Back to home"}
        </button>
      </div>
    );
  }
}
