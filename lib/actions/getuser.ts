import { auth } from "@/auth"

export const getuser =  async () => {
    const session = await auth()
    const user_id = session?.user?.id
    return parseInt(user_id!!)
}
