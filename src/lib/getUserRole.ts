import { currentUser } from "@clerk/nextjs/server";

export async function getUserRole(): Promise<string> {
  try {
    const user = await currentUser();
    
    if (!user) {
      return "guest";
    }

    const role = user.publicMetadata?.role;
    console.log(role)
    return typeof role === "string" && role.trim() !== "" ? role : "guest";
    
  } catch (error) {
    console.error("Error fetching user role:", error);
    return "guest";
  }

}