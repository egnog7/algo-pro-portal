import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import CheckoutClient from "./CheckoutClient";

export default function CheckoutPage() {
  return <CheckoutClient />;
}