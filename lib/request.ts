export function request(
  method: "post" | "put" | "get" | "delete",
  url: `/api/${string}`,
  body?: Record<string, unknown>
) {
  return new Promise((resolve, reject) => {
    fetch(url, { method, body: JSON.stringify(body) })
      .then(async (res) => {
        const body = await res.json();
        if (res.ok) {
          resolve(body);
        } else {
          reject(body);
        }
      })
      .catch((err) => reject(err));
  });
}

export function extractError(rejection: unknown) {
  console.log(rejection);
  if (rejection instanceof Error) return rejection.message;
  if (typeof rejection === "string") return rejection;
  if (!rejection) return "<no message>";
  if (typeof rejection === "object" && "error" in rejection)
    return rejection.error;

  return JSON.stringify(rejection);
}
