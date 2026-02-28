import { BrowserRouter, Routes, Route } from "react-router-dom"
import MontrevaleSite from "./ValmontierSite.jsx"
import ProductPage from "./ProductPage.jsx"

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MontrevaleSite />} />
        <Route path="/products/:slug" element={<ProductPage />} />
      </Routes>
    </BrowserRouter>
  )
}