import { BrowserRouter, Routes, Route } from "react-router-dom"
import MontrevaleSite from "./ValmontierSite.jsx"
import ProductPage from "./ProductPage.jsx"
import AdminOrdersPage from "@/pages/AdminOrdersPage";
import AdminBespoke from "./pages/AdminBespoke"
import Privacy from "./Privacy";
import Terms from "./Terms";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MontrevaleSite />} />
        <Route path="/products/:slug" element={<ProductPage />} />
        <Route path="/admin/orders" element={<AdminOrdersPage />} />
        <Route path="/admin/bespoke" element={<AdminOrdersPage />} />
        <Route path="/admin" element={<AdminOrdersPage />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
      </Routes>
    </BrowserRouter>
  )
}