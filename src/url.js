export function decode_score() {
    var params = (new URL(document.location)).searchParams
    let encoded = params.get("s")
    if (encoded == null) {
        return null
    }
    let decoded = atob(encoded)
    return decoded
}

export function encode_score(content) {
    let encoded = btoa(content)
    var url = new URL(document.location)
    url.searchParams.set("s", encoded)
    return url.toString()
}