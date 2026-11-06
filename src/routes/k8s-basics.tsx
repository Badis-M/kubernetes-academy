import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/k8s-basics")({
  beforeLoad: ({ search }) => {
    throw redirect({
      to: "/learn/$chapterId",
      params: { chapterId: "architecture" },
      search,
      statusCode: 301,
    });
  },
});
