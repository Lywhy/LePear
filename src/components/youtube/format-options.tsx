import { VideoDownload } from "@/components/youtube/video-download";
import { SubtitleDownload } from "@/components/youtube/subtitle-download";
import { type YouTubeMetadata } from "@/lib/youtube-api";
import { designClasses as ui } from "@/lib/design-system";

type Props = {
  kind: "video" | "audio" | "subtitles";
  data: YouTubeMetadata | null;
  loading: boolean;
};
export function FormatOptions({ kind, data, loading }: Props) {
  if (!data)
    return (
      <p className={"mt-5 " + ui.caption}>
        {loading
          ? "Получаем доступные параметры…"
          : "Параметры появятся после получения данных по ссылке."}
      </p>
    );
  return kind === "subtitles" ? (
    <SubtitleDownload key={data.video.id} data={data} />
  ) : (
    <VideoDownload key={data.video.id + ":" + kind} data={data} kind={kind} />
  );
}
