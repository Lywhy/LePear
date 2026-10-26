/** Preserve the existing NFC, UTF-16 length limits and well-formed filename policy.
 * Callers own prefixes, suffixes, extensions and fallback names.
 */
export function sanitizeFilenamePart(value, maxLength = 90) {
  return value
    .normalize("NFC")
    .split("")
    .filter((character) => {
      const code = character.charCodeAt(0);
      return code >= 32 && code !== 127;
    })
    .join("")
    .replace(/[<>:"/\\|?*]/g, "")
    .replace(/^\.+|[.\s]+$/g, "")
    .slice(0, maxLength)
    .toWellFormed();
}

export function youtubeDownloadFilename(
  videoId,
  title,
  extension,
  { titleLimit = 90, suffix = "" } = {},
) {
  return (
    (
      "LePear-" +
      videoId +
      "-" +
      sanitizeFilenamePart(title, titleLimit)
    ).trim() +
    suffix +
    "." +
    extension
  );
}
