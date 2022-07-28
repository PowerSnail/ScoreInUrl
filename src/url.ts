export function decodeScore() {
  const params = new URL(document.location.href).searchParams;
  const encoded = params.get("s");
  if (encoded == null) {
    return null;
  }
  try {
    return window.atob(encoded);
  } catch (e) {
    return null;
  }
}

export function encodeScore(content: string) {
  const encoded = window.btoa(content);
  const url = new URL(document.location.href);
  url.searchParams.set("s", encoded);
  return url.toString();
}
