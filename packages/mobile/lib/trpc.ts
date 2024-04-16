import { createTRPCReact } from "@trpc/react-query";
import { AppRouter } from "backend";

export const trpc = createTRPCReact<AppRouter>();
