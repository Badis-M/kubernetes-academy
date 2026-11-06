import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/prerequisites")({
  beforeLoad: ({ search }) => {
    throw redirect({
      to: "/learn/$chapterId",
      params: { chapterId: "setup-kind" },
      search,
      statusCode: 301,
    });
  },
});
