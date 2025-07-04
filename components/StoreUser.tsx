"use client"
import useUser from "@/store/useUser"
import { useEffect } from "react"

const StoreUser = ({ userid }: { userid: number | null }) => {
  const setUser = useUser((s) => s.setUser)

  useEffect(() => {
    if (userid) {
      setUser(userid)
    }
  }, [userid, setUser])

  return null
}

export default StoreUser
