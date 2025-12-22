import React, { useState } from 'react';
import { Button } from 'components/ui/button';
import { useAuth } from '@/hooks/useAuth';

const parseTimeStringToSeconds = (s: string): number => {
    const parts = s.split(':').map(Number); // "mm:ss" hoặc "hh:mm:ss"
    if (parts.some(n => Number.isNaN(n))) return NaN;

    if (parts.length === 2) {
        const [m, sec] = parts;
        return (m * 60 + sec);
    }
    if (parts.length === 3) {
        const [h, m, sec] = parts;
        return (h * 3600 + m * 60 + sec);
    }
    return NaN;
};

interface EditableTranscriptItemProps {
    speakerId: string;
    speaker: string;
    speakerList: any[];
    attendees: any[]; // Meeting attendees for dropdown
    text: string;
    timestamp: string;
    startTs: number;
    onSave: (newText: string, newSpeakerId: string, newStartTs: number) => void;
}

const EditableTranscriptItem: React.FC<EditableTranscriptItemProps> = ({
    speakerId, speaker, speakerList, attendees, text, timestamp, startTs, onSave
}) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editedText, setEditedText] = useState(text);
    const [editedSpeakerId, setEditedSpeakerId] = useState(speakerId);
    const [editedTimestamp, setEditedTimestamp] = useState(timestamp);
    const [editedStartTs, setEditedStartTs] = useState(startTs);
    const { isProjectManager } = useAuth();

    return (
        <div className={`transcript-item ${isEditing ? 'transcript-edit-row' : 'transcript-view-row'}`}>
            {isEditing ? (
                <>
                    <div className="transcript-edit-header">
                        <input
                            className="edit-timestamp"
                            value={editedTimestamp}
                            onChange={(e) => {
                                const v = e.target.value;
                                setEditedTimestamp(v);
                                const secs = parseTimeStringToSeconds(v);
                                if (!Number.isNaN(secs)) {
                                    setEditedStartTs(secs * 1000);
                                }
                            }}
                        />
                        <select
                            value={editedSpeakerId}
                            onChange={(e) => setEditedSpeakerId(e.target.value)}
                            className="edit-speaker"
                        >
                            {attendees && attendees.length > 0 ? (
                                attendees.map(att => (
                                    <option key={att.id} value={att.id}>
                                        {att.fullName || att.email}
                                    </option>
                                ))
                            ) : (
                                <option value="">No attendees</option>
                            )}
                        </select>
                    </div>
                    <textarea
                        value={editedText}
                        onChange={(e) => setEditedText(e.target.value)}
                        rows={2}
                        className="edit-text"
                    />
                    <div className="transcript-edit-actions">
                        <Button
                            className='bg-orange-500 text-white'
                            onClick={() => { onSave(editedText, editedSpeakerId, editedStartTs); setIsEditing(false); }}>
                            Save
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setIsEditing(false);
                                setEditedText(text);
                                setEditedSpeakerId(speakerId);
                                setEditedTimestamp(timestamp);
                                setEditedStartTs(startTs);
                            }}>
                            Cancel
                        </Button>
                    </div>
                </>
            ) : (
                <>
                    <span className="timestamp">{timestamp}</span>
                    <strong className="speaker-name">
                        {speakerList.find(sp => sp.id === speakerId)?.fullName || speaker}
                    </strong>
                    <span className="transcript-text">{text}</span>
                    {isProjectManager() &&
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setIsEditing(true)}
                            style={{ marginLeft: 8 }}
                        >
                            Edit
                        </Button>
                    }
                </>
            )}
        </div>
    );
};

export default EditableTranscriptItem;
