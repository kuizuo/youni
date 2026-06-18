import { createFileRoute, Navigate } from "@tanstack/react-router";

export const Route = createFileRoute("/_public/")({
	component: HomeComponent,
});

function HomeComponent() {
	return <Navigate to="/admin" />;
}
