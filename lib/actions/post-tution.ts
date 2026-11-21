interface TuitionFormState {
  title: string;
  subject: string;
  classLevel: string;
  mode: "online" | "offline";
  location: string;
  monthlyFee: string;
  daysPerWeek: string;
  description: string;
  bannerImage?: string;
}

interface PostTuitionError {
  error?: string;
}

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000"

export const posttution = async (data: TuitionFormState) => {
  const res = await fetch(`${BASE_URL}/tution-post`, {
    method: "POST",
    credentials: "include",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify(data),
  })

  const result = (await res.json().catch(() => ({}))) as PostTuitionError

  if (!res.ok) {
    throw new Error(result.error || "Failed to post tuition. Please try again.")
  }

  return result
}
export const deleteTution = async (id: string) => {
  const res = await fetch(`${BASE_URL}/tution-post/${id}`, {
    method: "DELETE",
    credentials: "include",
  })

  const text = await res.text()
  let result: PostTuitionError = {}

  try {
    result = text ? JSON.parse(text) : {}
  } catch {
    result = {}
  }

  if (!res.ok) {
    throw new Error(result.error || `Failed to delete tuition. (HTTP ${res.status})`)
  }

  return result
}



export const updateTution = async (
  id: string,
  data: TuitionFormState
) => {
  const res = await fetch(`${BASE_URL}/tution-post/${id}`, {
    method: "PATCH",
    credentials: "include",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify(data),
  })

  const result = (await res.json().catch(() => ({}))) as PostTuitionError

  if (!res.ok) {
    throw new Error(result.error || "Failed to update tuition.")
  }

  return result
}
