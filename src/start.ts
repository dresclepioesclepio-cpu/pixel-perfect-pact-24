import { createStart, createMiddleware } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";

import { renderErrorPage } from "./lib/error-page";
import { attachSupabaseAuth } from "@/integrations/supabase/auth-attacher";

const errorMiddleware = createMiddleware().server(async ({ next }) => {
  try {
    return await next();
  } catch (error) {
    if (error != null && typeof error === "object" && "statusCode" in error) {
      throw error;
    }
    // Let serverFn / API requests propagate so the framework can serialize
    // the error as JSON for the client. Only render the HTML error page for
    // top-level document navigations.
    const url = (() => {
      try {
        return new URL(getRequest()?.url ?? "");
      } catch {
        return null;
      }
    })();
    const path = url?.pathname ?? "";
    if (path.startsWith("/_serverFn") || path.startsWith("/api/")) {
      throw error;
    }
    console.error(error);
    return new Response(renderErrorPage(), {
      status: 500,
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  }
});

export const startInstance = createStart(() => ({
  requestMiddleware: [errorMiddleware],
  functionMiddleware: [attachSupabaseAuth],
}));
