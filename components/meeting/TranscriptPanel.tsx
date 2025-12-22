import EditableTranscriptItem from './EditableTranscriptItem';
import { meetingService } from "@/services/meetingService";

interface TranscriptPanelProps {
    meetingId: string;
    transcriptItems: any[]; // type chuẩn: TranscriptItem[]
    setTranscriptItems: (items: any[]) => void; // chuẩn: (items: TranscriptItem[]) => void
    allSpeakers: { id: string; name: string }[];
    attendees: any[]; // Meeting attendees for dropdown
    getSpeakerName: (speakerId: string) => string;
    formatTimestamp: (ts: number) => string;
}

const TranscriptPanel = ({
    meetingId, transcriptItems, setTranscriptItems, allSpeakers, attendees, getSpeakerName, formatTimestamp
}: TranscriptPanelProps) => (
    <div className="transcript-panel">
        {transcriptItems.map((item, idx) => (
            <EditableTranscriptItem
                key={item.startTs + "-" + idx}
                speakerId={item.speakerId}
                speaker={getSpeakerName(item.speakerId)}
                speakerList={allSpeakers}
                attendees={attendees}
                timestamp={formatTimestamp(item.startTs)}
                startTs={item.startTs}
                text={item.text}
                onSave={async (newText, newSpeakerId, newStartTs) => {
                    const updated = [...transcriptItems];
                    updated[idx] = {
                        ...updated[idx],
                        text: newText,
                        speakerId: newSpeakerId,
                        startTs: newStartTs,
                    };
                    setTranscriptItems(updated);
                    await meetingService.updateTranscript(meetingId, updated);
                }}
            />
        ))}
    </div>
);

export default TranscriptPanel;
