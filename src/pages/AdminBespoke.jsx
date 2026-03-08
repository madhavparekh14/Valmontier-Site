import { useEffect, useState } from "react"

export default function AdminBespoke() {

  const [orders,setOrders] = useState([])
  const [loading,setLoading] = useState(true)

  const token = "valmontier_admin_9348fj3948fj"

  useEffect(() => {

    async function load() {
      const res = await fetch(`/api/admin/bespoke?token=${token}`)
      const data = await res.json()

      setOrders(data)
      setLoading(false)
    }

    load()

  },[])

  if (loading) return <div className="p-10">Loading...</div>

  return (
    <div className="p-10 max-w-6xl mx-auto">

      <h1 className="text-3xl font-semibold mb-8">
        Bespoke Requests
      </h1>

      <div className="overflow-x-auto">

        <table className="w-full border border-black/10">

          <thead className="bg-zinc-100">
            <tr>
              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-left">Email</th>
              <th className="p-3 text-left">Inspired</th>
              <th className="p-3 text-left">Budget</th>
              <th className="p-3 text-left">Specs</th>
              <th className="p-3 text-left">Notes</th>
              <th className="p-3 text-left">Date</th>
            </tr>
          </thead>

          <tbody>

            {orders.map((o) => (

              <tr key={o.id} className="border-t">

                <td className="p-3">{o.name}</td>
                <td className="p-3">{o.email}</td>

                <td className="p-3">
                  {o.style_brand} {o.style_build}
                </td>

                <td className="p-3">
                  {o.budget}
                </td>

                <td className="p-3 text-sm">
                  {o.case_size} / {o.case_finish} / {o.bracelet} / {o.hands} / {o.movement}
                </td>

                <td className="p-3 text-sm">
                  {o.message}
                </td>

                <td className="p-3 text-sm">
                  {new Date(o.created_at).toLocaleDateString()}
                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </div>
  )
}