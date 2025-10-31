import EditableTranscriptItem from './EditableTranscriptItem';
import { meetingService } from "@/services/meetingService";

interface TranscriptPanelProps {
    meetingId: string;
    transcriptItems: any[]; // type chuẩn: TranscriptItem[]
    setTranscriptItems: (items: any[]) => void; // chuẩn: (items: TranscriptItem[]) => void
    allSpeakers: { id: string; name: string }[];
    getSpeakerName: (speakerId: string) => string;
    formatTimestamp: (ts: number) => string;
}

const TranscriptPanel = ({
    meetingId, transcriptItems, setTranscriptItems, allSpeakers, getSpeakerName, formatTimestamp
}: TranscriptPanelProps) => (
    <div className="transcript-panel">
        {transcriptItems.map((item, idx) => (
            <EditableTranscriptItem
                key={item.startTs + "-" + idx}
                speakerId={item.speakerId}
                speaker={getSpeakerName(item.speakerId)}
                speakerList={allSpeakers}
                timestamp={formatTimestamp(item.startTs)}
                text={item.text}
                onSave={async (newText, newSpeakerId) => {
                    const updated = [...transcriptItems];
                    updated[idx].text = newText;
                    updated[idx].speakerId = newSpeakerId;
                    setTranscriptItems(updated);
                    await meetingService.updateTranscript(meetingId, updated);
                }}
            />
        ))}
    </div>
);

export default TranscriptPanel;
