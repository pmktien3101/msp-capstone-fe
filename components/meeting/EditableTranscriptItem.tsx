import React, { useState } from 'react';
import { Button } from 'components/ui/button';

interface EditableTranscriptItemProps {
    speakerId: string;
    speaker: string;
    speakerList: any[];
    text: string;
    timestamp: string;
    onSave: (newText: string, newSpeakerId: string) => void;
}

const EditableTranscriptItem: React.FC<EditableTranscriptItemProps> = ({
    speakerId, speaker, speakerList, text, timestamp, onSave
}) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editedText, setEditedText] = useState(text);
    const [editedSpeakerId, setEditedSpeakerId] = useState(speakerId);

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
                            {speakerList.map(sp => (
                                <option key={sp.id} value={sp.id}>
                                    {sp.fullName}
                                </option>
                            ))}
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
                            Lưu
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setIsEditing(false);
                                setEditedText(text);
                                setEditedSpeakerId(speakerId);
                            }}>
                            Hủy
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
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsEditing(true)}
                        style={{ marginLeft: 8 }}
                    >
                        Chỉnh sửa
                    </Button>
                </>
            )}
        </div>
    );
};

export default EditableTranscriptItem;
