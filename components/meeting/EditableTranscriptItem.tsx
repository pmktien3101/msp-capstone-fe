import React, { useState } from 'react';
import { Button } from 'components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { is } from 'zod/v4/locales';

interface EditableTranscriptItemProps {
    speakerId: string;
    speaker: string;
    speakerList: any[];
    attendees: any[]; // Meeting attendees for dropdown
    text: string;
    timestamp: string;
    onSave: (newText: string, newSpeakerId: string) => void;
}

const EditableTranscriptItem: React.FC<EditableTranscriptItemProps> = ({
    speakerId, speaker, speakerList, attendees, text, timestamp, onSave
}) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editedText, setEditedText] = useState(text);
    const [editedSpeakerId, setEditedSpeakerId] = useState(speakerId);
    const { isProjectManager } = useAuth();

    return (
        <div className={`transcript-item ${isEditing ? 'transcript-edit-row' : 'transcript-view-row'}`}>
            {isEditing ? (
                <>
                    <div className="transcript-edit-header">
                        <span className="timestamp">{timestamp}</span>
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
                            onClick={() => { onSave(editedText, editedSpeakerId); setIsEditing(false); }}>
                            Save
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setIsEditing(false);
                                setEditedText(text);
                                setEditedSpeakerId(speakerId);
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
