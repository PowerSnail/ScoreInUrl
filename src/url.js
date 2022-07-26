export function decode_score() {
    var params = (new URL(document.location)).searchParams
    let encoded = params.get("s")
    if (encoded == null) {
        return null
    }
    try {
        return atob(encoded)
    } catch (e) {
        return null        
    }
}

export function encode_score(content) {
    let encoded = btoa(content)
    var url = new URL(document.location)
    url.searchParams.set("s", encoded)
    return url.toString()
}